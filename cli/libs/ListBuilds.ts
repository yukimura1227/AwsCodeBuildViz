import { CodeBuildClient, ListBuildsForProjectCommand, ListBuildsForProjectCommandInput, ListBuildsForProjectCommandOutput } from "npm:@aws-sdk/client-codebuild";
import { fromSSO } from "npm:@aws-sdk/credential-providers";

const createClient = (awsProfileName:string) => {
  console.log(awsProfileName);
  const client = new CodeBuildClient({
    region: "ap-northeast-1",
    credentials: fromSSO({
      profile: awsProfileName,
    }),
  });
  return client;
};

const listBuildsOnce = async (client:unknown, awsProfileName = 'default', codeBuildProjectName: string, nextToken?: string) => {
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
    console.log(buildId);
  }

  if(nextToken) listBuildsOnce(client, awsProfileName, codeBuildProjectName, nextToken);
}

export const ListBuilds = async (awsProfileName = 'default', codeBuildProjectName: string) => {
  const client = await createClient(awsProfileName);

  console.log('実行開始')
  listBuildsOnce(client, awsProfileName, codeBuildProjectName);
};