import {
  BatchGetBuildsCommand,
  type BatchGetBuildsCommandInput,
  type BatchGetBuildsCommandOutput,
  CodeBuildClient,
} from 'npm:@aws-sdk/client-codebuild';

const createClient = (
  credentials: unknown,
  region: string
): CodeBuildClient => {
  const client = new CodeBuildClient({
    region: region,
    credentials: credentials,
  });
  return client;
};

const getButchBuild = async (
  client: CodeBuildClient,
  buildId: string
): BatchGetBuildsCommandOutput => {
  const input: BatchGetBuildsCommandInput = {
    ids: [buildId],
  };
  const command = new BatchGetBuildsCommand(input);

  const response: BatchGetBuildsCommandOutput = await client.send(command);

  console.log(response);

  return response;
};

export const BatchGetBuilds = async (
  credentials: unknown,
  buildId: string,
  region: string
) => {
  const client = await createClient(credentials, region);

  return await getButchBuild(client, buildId);
};
