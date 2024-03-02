import { CodeBuildClient, BatchGetBuildsCommand, BatchGetBuildsCommandInput, BatchGetBuildsCommandOutput } from "npm:@aws-sdk/client-codebuild";
import { fromSSO } from "npm:@aws-sdk/credential-providers";

const createClient = (awsProfileName:string):CodeBuildClient => {
  console.log(awsProfileName);
  const client = new CodeBuildClient({
    region: "ap-northeast-1",
    credentials: fromSSO({
      profile: awsProfileName,
    }),
  });
  return client;
};

const getButchBuild = async (client:CodeBuildClient, buildId:string):BatchGetBuildsCommandOutput => {
  const input:BatchGetBuildsCommandInput = {
    ids: [buildId],
  };
  const command = new BatchGetBuildsCommand(input);

  const response:BatchGetBuildsCommandOutput = await client.send(command);

  console.log(response);

  return response;
}

export const BatchGetBuilds = async (awsProfileName = 'default', buildId:string) => {
  const client = await createClient(awsProfileName);

  return await getButchBuild(client, buildId);
};