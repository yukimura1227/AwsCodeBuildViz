import type { BatchGetBuildsCommandOutput } from "npm:@aws-sdk/client-codebuild";
import { fromEnv, fromIni } from "npm:@aws-sdk/credential-providers";
import { BatchGetBuilds } from "./libs/BatchGetBuilds.ts";
import { ListBuilds } from "./libs/ListBuilds.ts";
import type { AwsCredentialIdentityProvider } from "npm:@aws-sdk/types";

const localSettings = await import('../environment.local.json', { with: { type: "json" } });
const globalSettings = await import('../environment.json', { with: { type: "json" } });

let settings: typeof globalSettings | typeof localSettings;
if(localSettings) {
  settings = localSettings;
} else {
  settings = globalSettings;
}

for (const setting of settings.default.codebuildSettings) {
  const codeBuildProjectName:string = setting.codeBuildProjectName;
  const region:string               = setting.region;

  let credentials: AwsCredentialIdentityProvider;
  if( setting.credentials.sso?.awsProfileName ) {
    const awsProfileName:string = setting.credentials.sso.awsProfileName;
    credentials = fromIni({ profile: awsProfileName });
  } else if( setting.credentials.accessToken ) {
    Deno.env.set("AWS_ACCESS_KEY_ID", setting.credentials.accessToken?.AWS_ACCESS_KEY_ID);
    Deno.env.set("AWS_SECRET_ACCESS_KEY", setting.credentials.accessToken?.AWS_SECRET_ACCESS_KEY);
    Deno.env.set("AWS_SESSION_TOKEN", setting.credentials.accessToken?.AWS_SESSION_TOKEN);
    credentials = fromEnv();
  } else {
    console.error('credentials not found');
    Deno.exit(1);
  }

  const kv = await Deno.openKv('./denoKVData/kv.sqlite3');
  const buildIds = await ListBuilds(credentials, codeBuildProjectName, region);

  console.log(buildIds);

  for(const buildId of buildIds) {
    await kv.set(
      [codeBuildProjectName, buildId],
      {
        codeBuildProjectName,
        buildId,
      }
    );
  }

  const entries = kv.list({ prefix: [codeBuildProjectName]});
  for await (const entry of entries) {
    console.log(entry.key);
    console.log(entry.value);
    const buildId:string = (entry.value as { buildId: string }).buildId;

    const buildDetailEntry:BatchGetBuildsCommandOutput = await kv.get([`${codeBuildProjectName}__detail-response`, buildId])
    if( buildDetailEntry.value === null || buildDetailEntry.value.response === undefined || buildDetailEntry.value.response.response?.builds[0].buildStatus === 'IN_PROGRESS') {
      console.log(`get build details: ${buildId}`);
      const response = await BatchGetBuilds(credentials, buildId, region);
      await kv.set(
        [`${codeBuildProjectName}__detail-response`, buildId],
        { response },
      );
      // rate limitに備えてwait
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('already exists');
    }
  }

  const buildDetailEntries = kv.list<BatchGetBuildsCommandOutput>({prefix: [`${codeBuildProjectName}__detail-response`]})
  const buildDetailsArray:BatchGetBuildsCommandOutput[] = [];
  for await (const entry of buildDetailEntries) {
    if( entry.value.response?.builds[0]?.buildStatus === 'SUCCEEDED' ) buildDetailsArray.push(entry.value.response);
  }
  const buildDetailsArraySorted = buildDetailsArray.sort((a, b) => {
    if (a.builds && b.builds) {
      return (a.builds?.[0]?.buildNumber ?? 0) - (b.builds?.[0]?.buildNumber ?? 0);
    }
    return 0;
  });

  await Deno.writeTextFile(`../codeBuildResult/${codeBuildProjectName}.json`, JSON.stringify(buildDetailsArraySorted), {
    append: false,
  });
};