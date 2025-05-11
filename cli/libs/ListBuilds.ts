import {
  CodeBuildClient,
  ListBuildsForProjectCommand,
  type ListBuildsForProjectCommandInput,
  type ListBuildsForProjectCommandOutput,
} from 'npm:@aws-sdk/client-codebuild';
import type { AwsCredentialIdentityProvider } from "npm:@aws-sdk/types";

const createClient = (credentials: AwsCredentialIdentityProvider, region: string) => {
  const client = new CodeBuildClient({
    region: region,
    credentials: credentials,
  });
  return client;
};

const listBuildsOnce = async (
  client: CodeBuildClient,
  buildIdsResult: string[],
  codeBuildProjectName: string,
  nextToken?: string
) => {
  const input: ListBuildsForProjectCommandInput = {
    projectName: codeBuildProjectName,
    nextToken: nextToken,
  };
  const command = new ListBuildsForProjectCommand(input);

  const response: ListBuildsForProjectCommandOutput =
    await client.send(command);

  const nextNextToken = response.nextToken;

  console.log({ nextToken });
  console.log({ length: response.ids.length });

  for (const buildId of response.ids) {
    buildIdsResult.push(buildId);
  }

  console.log(buildIdsResult.length);
  if (nextNextToken)
    await listBuildsOnce(
      client,
      buildIdsResult,
      codeBuildProjectName,
      nextNextToken
    );
};

export const ListBuilds = async (
  credentials: unknown,
  codeBuildProjectName: string,
  region: string
): Promise<string[]> => {
  const client = createClient(credentials, region);

  console.log('実行開始');
  const buildIdsResult: string[] = [];
  await listBuildsOnce(client, buildIdsResult, codeBuildProjectName);
  return buildIdsResult;
};
