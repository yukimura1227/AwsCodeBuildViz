import React from 'react';
import './App.css';
import type { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import { Chart } from "./Chart.tsx";

interface AppProps {
  group?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const localSettings = await import('../../environment.local.json').then(
  (module) => module.default.codebuildSettings
);
const globalSettings = await import('../../environment.json').then(
  (module) => module.default.codebuildSettings
);

const settings = localSettings ? localSettings : globalSettings;

const codeBuildResultJsons: {
  [key: string]: {
    setting: (typeof settings)[0];
    buildResult: BatchGetBuildsCommandOutput[];
  };
} = {};

await Promise.all(
  settings.map(async (setting) => {
    console.log(`../codeBuildResult/${setting.codeBuildProjectName}.json`);
    codeBuildResultJsons[setting.codeBuildProjectName] = {
      setting,
      buildResult: await import(
        `../../codeBuildResult/${setting.codeBuildProjectName}.json`
      ).then((module) => module.default),
    };
  })
);

export const App = ({ group, dateFrom, dateTo }: AppProps) => {
  return (
    <>
      {Object.keys(codeBuildResultJsons)
        .sort()
        .reverse() // TODO: implements sort function
        .map((key) => {
          // console.log(codeBuildResultJsons[key]);
          return Chart(codeBuildResultJsons[key].buildResult, key, group, dateFrom, dateTo);
        })}
    </>
  );
};