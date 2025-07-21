import type { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';

const localSettings = await import('../../../environment.local.json').then(
  (module) => module.default.codebuildSettings
);
const globalSettings = await import('../../../environment.json').then(
  (module) => module.default.codebuildSettings
);
interface CodeBuildSetting {
  credentials: {
    sso?: {
      awsProfileName: string;
    };
    accessToken?: {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_SESSION_TOKEN?: string;
    };
  };
  region: string;
  codeBuildProjectName: string;
}

interface SettingsFile {
  codebuildSettings: CodeBuildSetting[];
}

/**
 * Load settings from environment files, preferring local over global
 */
const extractSettings = (): CodeBuildSetting[] => {
  if (localSettings) {
    return localSettings;
  }
  return globalSettings;
};

const codeBuildResultJsons: {
  [key: string]: {
    buildResult: BatchGetBuildsCommandOutput[];
  };
} = {};

const settings = extractSettings();

await Promise.all(
  settings.map(async (setting) => {
    codeBuildResultJsons[setting.codeBuildProjectName] = {
      buildResult: await import(
        `../../../codeBuildResult/${setting.codeBuildProjectName}.json`
      ).then((module) => module.default),
    };
  })
);

/**
 * Load CodeBuild results for all configured projects
 */
export const loadCodeBuildResults = () => { 
  return codeBuildResultJsons;
}