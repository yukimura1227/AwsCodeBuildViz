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
}