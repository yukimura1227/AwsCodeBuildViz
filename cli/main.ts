import { BatchGetBuildsCommandOutput } from "npm:@aws-sdk/client-codebuild";
import { BatchGetBuilds } from "./libs/BatchGetBuilds.ts";
import { ListBuilds } from "./libs/ListBuilds.ts";

let settings = await import('../environment.local.json', { with: { type: "json" } });
if(!settings) settings = await import('../environment.json', { with: { type: "json" } });

settings.default.codebuildSettings.forEach( async (setting) => {
  const awsProfileName:string       = setting.awsProfileName;
  const codeBuildProjectName:string = setting.codeBuildProjectName;
  const region:string               = setting.region;

  const kv = await Deno.openKv();
  const buildIds = await ListBuilds(awsProfileName, codeBuildProjectName, region);

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
    if( buildDetailEntry.value === null || buildDetailEntry.value.response === undefined) {
      console.log(`get build details: ${buildId}`);
      const response = await BatchGetBuilds(awsProfileName, buildId);
      await kv.set(
        [`${codeBuildProjectName}__detail-response`, buildId],
        { response },
      );
      // rate limitに備えて0.1秒待つ
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.log('already exists');
    }
  }

  const buildDetailEntries = kv.list<BatchGetBuildsCommandOutput>({prefix: [`${codeBuildProjectName}__detail-response`]})
  const buildDetailsArray:BatchGetBuildsCommandOutput[] = [];
  for await (const entry of buildDetailEntries) {
    buildDetailsArray.push(entry.value.response);
  }
  const buildDetailsArraySorted = buildDetailsArray.sort((a, b) => {
    return a.builds[0].buildNumber - b.builds[0].buildNumber;
  });

  await Deno.writeTextFile(`../codeBuildResult/${codeBuildProjectName}.json`, JSON.stringify(buildDetailsArraySorted), {
    append: false,
  });
});