import React from 'react';
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
import { unifyArray } from './lib/unifyArray.ts';
import { convertDateToDayString, convertDateToMonthString } from './lib/DateUtils.ts';
import { calculateAverage } from './lib/claculateAverage.ts';
import { useState } from 'react';
import { BuildPhaseType } from '@aws-sdk/client-codebuild';

type BuildPhaseTypeStringType = typeof buildPhaseTypeStrings[0];
const buildPhaseTypeStrings = Object.values(BuildPhaseType);
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

const Chart = (sortedCodebuildData: BatchGetBuildsCommandOutput[], codeBuildProjectName:string) => {
  const GROUPING_TYPES = ["daily", "monthly"] as const;
  type GroupingType = typeof GROUPING_TYPES[number];
  const [groupingTypeState, setGroupingTypeState] = useState<GroupingType>("monthly");
  const [referenceDateFromState, setReferenceDateFromState] = useState("2024-01-01");
  const [referenceDateToState, setReferenceDateToState] = useState(new Date().toISOString().slice(0,10));

  const initialCheckBoxes:{ [key in BuildPhaseTypeStringType]?: boolean} = {};
  buildPhaseTypeStrings.map((phaseType) => {
    initialCheckBoxes[phaseType] = true;
  });

  const convertToLabel = (startTime:Date, convertType:"daily"|"monthly") => {
    if(convertType === "daily") {
      return convertDateToDayString(startTime);
    } else if(convertType === "monthly") {
      return convertDateToMonthString(startTime);
    }
  }

  const filteredCodebuildData = sortedCodebuildData.filter((entry) => {
    const targetDateTime = new Date(entry.builds![0].startTime!).getTime();
    return new Date(referenceDateFromState).getTime() <= targetDateTime && targetDateTime <= new Date(`${referenceDateToState}T23:59:59.999Z`).getTime();
  });

  const dailyLables   = unifyArray(
    filteredCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, "daily"))
  ) as string[];
  const monthlyLables = unifyArray(
    filteredCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, "monthly"))
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

  const codeBuildLabelAndDurations = filteredCodebuildData.map((entry) => {
    const durations:{ [key in BuildPhaseTypeStringType]?: number} = {};
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
        position: 'right' as const,
      },
      title: {
        display: true,
        text: codeBuildProjectName,
      },
    },
    scale: {
      min: 0,
      max: 900,
      stepSize: 60,
      stacked: true,
    },
  };

  const generateDataSet = () => {
    const datasets = buildPhaseTypeStrings.map( (buildPhase) => {
      return {
        label: buildPhase,
        data: codeBuildDurations(buildPhase),
        ...colorsets[buildPhase],
      }
    });
    return datasets;
  };

  const data = {
    labels: detectLabels(groupingTypeState),
    datasets: generateDataSet(),
  };

  return (
    <>
      <div className='filterControls'>
        <label className='filterLabel'>group by </label>
        <span className=''>
          <select className='groupingSlectbox' value={groupingTypeState} onChange={ e => setGroupingTypeState(e.target.value as GroupingType)}>
            { GROUPING_TYPES.map((groupingType) => <option value={groupingType}>{groupingType}</option>) }
          </select>
        </span>
        <label className='filterLabel'>ReferenceDate </label>
        <span className='dateInputWrap'>
          <input className='dateInput' type="date" value={referenceDateFromState} min="2022-01-01" max="2030-12-31" onChange={(e) => setReferenceDateFromState(e.target.value)} />
        </span>
        〜
        <span className='dateInputWrap'>
          <input className='dateInput' type="date" value={referenceDateToState} min="2022-01-01" max="2030-12-31" onChange={(e) => setReferenceDateToState(e.target.value)} />
        </span>
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

const localSettings = await import('../../environment.local.json').then(module => module.default.codebuildSettings);
const globalSettings = await import('../../environment.json').then(module => module.default.codebuildSettings);

const settings = localSettings ? localSettings : globalSettings

const codeBuildResultJsons:{ [key: string]: {
  setting: typeof settings[0]
  buildResult: BatchGetBuildsCommandOutput[]
}} = {};

await Promise.all(
  settings.map(async setting => {
    console.log(`../codeBuildResult/${setting.codeBuildProjectName}.json`);
    codeBuildResultJsons[setting.codeBuildProjectName] = {
      setting,
      'buildResult': await import(`../../codeBuildResult/${setting.codeBuildProjectName}.json`).then(module => module.default)
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
