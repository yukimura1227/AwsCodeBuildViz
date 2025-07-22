import type { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import { BuildPhaseType } from "@aws-sdk/client-codebuild";

export type codeBuildResult = {
  builds?: {
    buildNumber?: number;
    startTime?: Date;
    endTime?: Date;
    phases?: {
      durationInSeconds?: number;
      phaseType?: BuildPhaseType;
    }[];
  }[]
}
type codeBuildResults = {
  buildResults?: codeBuildResult[];
};

const localSettings = await import('../../../environment.local.json').then(
  (module) => {
    return module.default.codebuildSettings
  }
);
const globalSettings = await import('../../../environment.json').then(
  (module) => {
    return module.default.codebuildSettings
  }
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
  [key: string]: codeBuildResults;
} = {};
const settings = extractSettings();

await Promise.all(
  settings.map(async (setting) => {
    const temporaryBuildResult = await import(`../../../codeBuildResult/${setting.codeBuildProjectName}.json`)
      .then((module) => {
        return module.default;
      })
      .catch(() => {
        console.warn(`No build result found for ${setting.codeBuildProjectName}`);
        return [];
      }) as BatchGetBuildsCommandOutput[];
    if (!temporaryBuildResult) {
      console.warn(`No builds found for ${setting.codeBuildProjectName}`);
      return;
    }
    const buildResults: codeBuildResult[] = temporaryBuildResult.flatMap((buildResult) =>
      (buildResult.builds ?? []).map((build) => ({
        builds: [{
          buildNumber: build.buildNumber,
          startTime: build.startTime,
          endTime: build.endTime,
          phases: build.phases?.map((phase) => ({
            durationInSeconds: phase.durationInSeconds,
            phaseType: phase.phaseType as BuildPhaseType,
          })),
        }],
      }))
    );
    codeBuildResultJsons[setting.codeBuildProjectName] = { buildResults:  buildResults };
  })
);

/**
 * Load CodeBuild results for all configured projects
 */
export const loadCodeBuildResults = () => { 
  return codeBuildResultJsons;
}