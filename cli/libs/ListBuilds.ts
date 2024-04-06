import { CodeBuildClient, ListBuildsForProjectCommand, ListBuildsForProjectCommandInput, ListBuildsForProjectCommandOutput } from "npm:@aws-sdk/client-codebuild";

const createClient = (credentials:unknown,region:string) => {
  const client = new CodeBuildClient({
    region: region,
    credentials: credentials,
  });
  return client;
};

const listBuildsOnce = async (client:unknown, buildIdsResult:string[], codeBuildProjectName: string, nextToken?: string) => {
  const input:ListBuildsForProjectCommandInput = {
    projectName: codeBuildProjectName,
    nextToken: nextToken,
  };
  const command = new ListBuildsForProjectCommand(input);

  const response:ListBuildsForProjectCommandOutput = await client.send(command);

  nextToken = response.nextToken;

  console.log({nextToken});
  console.log({length: response.ids.length});

  for(const buildId of response.ids) {
    buildIdsResult.push(buildId);
  }

  console.log(buildIdsResult.length);
  if(nextToken) await listBuildsOnce(client, buildIdsResult, codeBuildProjectName, nextToken);
}

export const ListBuilds = async (awsProfileName = 'default', codeBuildProjectName: string, region: string):Promise<string[]> => {
  const client = await createClient(awsProfileName, region);

  console.log('実行開始')
  const buildIdsResult:string[] = [];
  await listBuildsOnce(client, buildIdsResult, codeBuildProjectName);
  return buildIdsResult;
};