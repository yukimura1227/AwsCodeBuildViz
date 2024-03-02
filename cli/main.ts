import { BatchGetBuilds } from "./libs/BatchGetBuilds.ts";
import { ListBuilds } from "./libs/ListBuilds.ts";

const awsProfileName:string = Deno.args[0];
const codeBuildProjectName:string = Deno.args[1];

const kv = await Deno.openKv();

const buildIds = await ListBuilds(awsProfileName, codeBuildProjectName);

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

  const buildDetailEntry = await kv.get([`${codeBuildProjectName}__detail-response`, buildId])
  if( buildDetailEntry.value === null || buildDetailEntry.value?.response === undefined) {
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

const buildDetailEntries = kv.list({prefix: [`${codeBuildProjectName}__detail-response`]})
for await (const entry of buildDetailEntries) {
  console.log(entry.key);
  if(entry.value !== undefined) console.log(entry.value);
}