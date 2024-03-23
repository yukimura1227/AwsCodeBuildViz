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

type BuildPhaseTypeStringType = typeof buildPhaseTypeStrings[0];
type BuildPhaseTypeWithAllStringType = BuildPhaseTypeStringType | 'ALL';
const buildPhaseTypeStrings = Object.values(BuildPhaseType);
const buildPhaseTypeWithAllStrings = ['ALL', ...buildPhaseTypeStrings] as const;
const colorsets:{ [key in BuildPhaseTypeStringType]?: {borderColor:string, backgroundColor:string}} = {};
buildPhaseTypeStrings.map( (type) => {
  const randomRed:number   =  Math.floor(Math.random() * 255 + 1);
  const randomGreen:number =  Math.floor(Math.random() * 255 + 1);
  const randomBlue:number  =  Math.floor(Math.random() * 255 + 1);
  colorsets[type] = {
    borderColor: `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`,
    backgroundColor: `rgb(${randomRed}, ${randomGreen}, ${randomBlue}, 0.5)`,
  };
});

const Chart = (sortedCodebuildData: BatchGetBuildsCommandOutput[], title:string) => {
  const GROUPING_TYPES = ["daily", "monthly"] as const;
  type GroupingType = typeof GROUPING_TYPES[number];
  const [groupingTypeState, setGroupingTypeState] = useState<GroupingType>("monthly");

 const [displayTargetBuildPhaseState, setDisplayTargetBuildPhaseState] = useState<BuildPhaseTypeWithAllStringType>("ALL");
  const convertToLabel = (startTime:Date, convertType:"daily"|"monthly") => {
    if(convertType === "daily") {
      return convertDateToDayString(startTime);
    } else if(convertType === "monthly") {
      return convertDateToMonthString(startTime);
    }
  }

  const dailyLables   = unifyArray(
    sortedCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, "daily"))
  ) as string[];
  const monthlyLables = unifyArray(
    sortedCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, "monthly"))
  ) as string[];
  const detectLabels = (groupingType:GroupingType) => {
    if(groupingType === "daily") {
      return dailyLables;
    } else if(groupingType === "monthly") {
      return monthlyLables;
    } else {
      return monthlyLables;
    }
  };

  // console.log(labels);

  const codeBuildLabelAndDurations = sortedCodebuildData.map((entry) => {
    const durations:{ [key in BuildPhaseTypeWithAllStringType]?: number} = {};
    buildPhaseTypeStrings.map((phaseType) => {
      const buildPhase = entry.builds![0].phases!.filter((value) => {
        return value.phaseType === phaseType
      })[0];

      durations[phaseType] = buildPhase?.durationInSeconds ?  buildPhase.durationInSeconds : 0;
    });
    // console.log({durations});

    return {
      label: convertToLabel(entry.builds![0].startTime!, groupingTypeState),
      ...durations,
    };
  });
  // console.log({codeBuildLabelAndDurations});

  const codeBuildDurations = (target:BuildPhaseTypeStringType) => {
    return detectLabels(groupingTypeState).map((label) => {
      const durations = codeBuildLabelAndDurations.filter((entry) => {
        return entry.label === label;
      }).map((entry) => {
        return entry[target] || 0;
      });
      return calculateAverage(durations);
    })
  };

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

  const generateDataSet = ( (displayTarget:BuildPhaseTypeWithAllStringType) => {
    if(displayTarget === 'ALL') {
      const datasets = buildPhaseTypeStrings.map( (type) => {
        return {
          label: type,
          data: codeBuildDurations(type),
          ...colorsets[type],
        };
      });
      return datasets;
    } else {
      const datasets = [{
        label: displayTarget,
        data: codeBuildDurations(displayTarget),
        ...colorsets[displayTarget],
      }];
      return datasets;
    }
  });

  const data = {
    labels: detectLabels(groupingTypeState),
    datasets: generateDataSet(displayTargetBuildPhaseState),
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
          // console.log(codeBuildResultJsons[key]);
          return Chart(codeBuildResultJsons[key].buildResult, key);
        })
      }
    </>
  );
}
