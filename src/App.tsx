import './App.css'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import { unifyArray } from './lib/unifyArray';
import { convertDateToDayString, convertDateToMonthString } from './lib/DateUtils';
import { calculateAverage } from './lib/claculateAverage';
import { useState } from 'react';
import { BuildPhaseType } from '@aws-sdk/client-codebuild';

const Chart = (json: BatchGetBuildsCommandOutput[], title:string) => {
  const sortedCodebuildData = (json as BatchGetBuildsCommandOutput[]).sort((a, b) => {
    return a.builds![0].buildNumber! - b.builds![0].buildNumber!;
  });

  const GROUPING_TYPES = ["daily", "monthly"] as const;
  type GroupingType = typeof GROUPING_TYPES[number];
  const [groupingTypeState, setGroupingTypeState] = useState<GroupingType>("monthly");

  type BuildPhaseTypeStringType = typeof buildPhaseTypeStrings[0];
  type BuildPhaseTypeWithAllStringType = BuildPhaseTypeStringType | 'ALL';
  const buildPhaseTypeStrings = Object.values(BuildPhaseType);
  const buildPhaseTypeWithAllStrings = ['ALL', ...buildPhaseTypeStrings] as const;
  const [displayTargetBuildPhaseState, setDisplayTargetBuildPhaseState] = useState<BuildPhaseTypeWithAllStringType>("ALL");

  const convertToLabel = (startTime:Date, convertType:"daily"|"monthly") => {
    if(convertType === "daily") {
      return convertDateToDayString(startTime);
    } else if(convertType === "monthly") {
      return convertDateToMonthString(startTime);
    }
  }

  // labelsは、日付部分を抜粋してユニークな配列にする
  const labels = unifyArray(
    sortedCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, groupingTypeState) )
  );

  console.log(labels);

  const codeBuildDateAndDurations = sortedCodebuildData.map((entry) => {

    const durations:{ [key in BuildPhaseTypeWithAllStringType]?: number} = {};
    buildPhaseTypeStrings.map((phaseType) => {
      const buildPhase = entry.builds![0].phases!.filter((value) => {
        return value.phaseType === phaseType
      })[0];

      if(buildPhase?.durationInSeconds) durations[phaseType] = buildPhase.durationInSeconds;
    });
    console.log({durations});

    // entry.builds![0].phasesのdurationInSecondを合計する
    const durationInSecondsSum = entry.builds![0].phases!.reduce((acc, cur) => {
      if (cur.durationInSeconds === undefined) return acc;
      return acc + cur.durationInSeconds!;
    }, 0);
    durations["ALL"] = durationInSecondsSum;

    return {
      label: convertToLabel(entry.builds![0].startTime!, groupingTypeState),
      ...durations,
    };
  });
  console.log({codeBuildDateAndDurations});

  const codeBuildDurations = (target:BuildPhaseTypeWithAllStringType) => {
    return labels.map((label) => {
      const durations = codeBuildDateAndDurations.filter((entry) => {
        return entry.label === label;
      }).map((entry) => {
        return entry[target] || 0;
      });
      return calculateAverage(durations);
    })
  };
  console.log(codeBuildDurations('ALL'));

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scale: {
      min: 0,
      max: 900,
      stepSize: 60,
      stacked: true,
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'CodeBuildの実行時間',
        data: codeBuildDurations(displayTargetBuildPhaseState),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <>
      <label>Grouping</label>
      <div className='selectbox'>
        <select value={groupingTypeState} onChange={ e => setGroupingTypeState(e.target.value as GroupingType)}>
          { GROUPING_TYPES.map((groupingType) => <option value={groupingType}>{groupingType}</option>) }
        </select>
      </div>
      <label>TargetPhase</label>
      <div className='selectbox'>
        <select value={displayTargetBuildPhaseState} onChange={ e => setDisplayTargetBuildPhaseState(e.target.value as BuildPhaseTypeWithAllStringType)}>
          { buildPhaseTypeWithAllStrings.map((phaseType) => <option value={phaseType}>{phaseType}</option>) }
        </select>
      </div>
      <Bar options={options} data={data} />
    </>
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

let settings = await import('../environment.local.json').then(module => module.default.codebuildSettings);
if(!settings) settings = await import('../environment.json').then(module => module.default.codebuildSettings);

const codeBuildResultJsons:{ [key: string]: {
  setting: typeof settings[0]
  buildResult: BatchGetBuildsCommandOutput[]
}} = {};

await Promise.all(
  settings.map(async setting => {
    console.log(`../codeBuildResult/${setting.codeBuildProjectName}.json`);
    codeBuildResultJsons[setting.codeBuildProjectName] = {
      setting,
      'buildResult': await import(`../codeBuildResult/${setting.codeBuildProjectName}.json`).then(module => module.default)
    }
  })
);

export const App = () => {
  return (
    <>
      {
        Object.keys(codeBuildResultJsons)
          .sort().reverse() // TODO: implements sort function
          .map((key) =>
        {
          console.log(codeBuildResultJsons[key]);
          return Chart(codeBuildResultJsons[key].buildResult, key);
        })
      }
    </>
  );
}
