import { CodeBuildClient, } from 'npm:@aws-sdk/client-codebuild';
import type { AwsCredentialIdentityProvider } from "npm:@aws-sdk/types";

export const CreateCodeBuildClient = (credentials: AwsCredentialIdentityProvider, region: string) => {
  const client = new CodeBuildClient({
    region: region,
    credentials: credentials,
  });
  return client;
};