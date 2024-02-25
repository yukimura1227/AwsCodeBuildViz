import { ListBuilds } from "./libs/ListBuilds.ts";

const awsProfileName:string = Deno.args[0];
const codeBuildProjectName:string = Deno.args[1];

const buildIds = await ListBuilds(awsProfileName, codeBuildProjectName);

console.log(buildIds);
