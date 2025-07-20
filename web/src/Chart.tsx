import React from 'react';
import './App.css';

import { BuildPhaseType } from '@aws-sdk/client-codebuild';
import type { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  convertDateToDayString,
  convertDateToMonthString,
} from './lib/DateUtils.ts';
import { calculateAverage } from './lib/calculateAverage.ts';
import { unifyArray } from './lib/unifyArray.ts';

type BuildPhaseTypeStringType = (typeof buildPhaseTypeStrings)[0];
const buildPhaseTypeStrings = Object.values(BuildPhaseType);
const colorsets: {
  [key in BuildPhaseTypeStringType]?: {
    borderColor: string;
    backgroundColor: string;
  };
} = {};
buildPhaseTypeStrings.map((type) => {
  const randomRed: number = Math.floor(Math.random() * 255 + 1);
  const randomGreen: number = Math.floor(Math.random() * 255 + 1);
  const randomBlue: number = Math.floor(Math.random() * 255 + 1);
  colorsets[type] = {
    borderColor: `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`,
    backgroundColor: `rgb(${randomRed}, ${randomGreen}, ${randomBlue}, 0.5)`,
  };
});

export const Chart = (
  sortedCodebuildData: BatchGetBuildsCommandOutput[],
  codeBuildProjectName: string,
  initialGroup?: string,
  initialDateFrom?: Date,
  initialDateTo?: Date
) => {
  const GROUPING_TYPES = ["daily", "monthly", "none"] as const;
  type GroupingType = (typeof GROUPING_TYPES)[number];
  
  const getDefaultGrouping = (): GroupingType => {
    if (initialGroup && GROUPING_TYPES.includes(initialGroup as GroupingType)) {
      return initialGroup as GroupingType;
    }
    return 'monthly';
  };
  
  const getDefaultDateFrom = (): string => {
    return initialDateFrom ? convertDateToDayString(initialDateFrom) : convertDateToDayString(new Date());
  };
  
  const getDefaultDateTo = (): string => {
    return initialDateTo ? convertDateToDayString(initialDateTo) : convertDateToDayString(new Date());
  };
  
  const [groupingTypeState, setGroupingTypeState] =
    useState<GroupingType>(getDefaultGrouping());
  const [referenceDateFromState, setReferenceDateFromState] =
    useState(getDefaultDateFrom());
  const [referenceDateToState, setReferenceDateToState] = useState(
    getDefaultDateTo()
  );

  const initialCheckBoxes: { [key in BuildPhaseTypeStringType]?: boolean } = {};
  buildPhaseTypeStrings.map((phaseType) => {
    initialCheckBoxes[phaseType] = true;
  });

  const convertToLabel = (
    startTime: Date,
    buildNumber: number,
    convertType: 'daily' | 'monthly' | 'none'
  ) => {
    if (convertType === 'daily') {
      return convertDateToDayString(new Date(startTime));
    }
    if (convertType === 'monthly') {
      return convertDateToMonthString(new Date(startTime));
    }
    if(convertType === 'none') {
      return buildNumber.toString();
    }
  };

  const filteredCodebuildData = sortedCodebuildData.filter((entry) => {
    const targetDateTime = new Date(entry.builds![0].startTime!).getTime();
    return (
      new Date(referenceDateFromState).getTime() <= targetDateTime &&
      targetDateTime <=
        new Date(`${referenceDateToState}T23:59:59.999Z`).getTime()
    );
  });

  const noneLables    = unifyArray(
    filteredCodebuildData.map((entry) =>
      convertToLabel(entry.builds![0].startTime!, entry.builds?.[0].buildNumber!, "none")
    )
  ) as string[];
  const dailyLables = unifyArray(
    filteredCodebuildData.map((entry) =>
      convertToLabel(entry.builds![0].startTime!, entry.builds?.[0].buildNumber!, "daily")
    )
  ) as string[];
  const monthlyLables = unifyArray(
    filteredCodebuildData.map((entry) =>
      convertToLabel(entry.builds![0].startTime!, entry.builds?.[0].buildNumber!, "monthly")
    )
  ) as string[];
  const detectLabels = (groupingType: GroupingType) => {
    if (groupingType === 'daily') {
      return dailyLables;
    }
    if(groupingType === "none") {
      return noneLables;
    }
    return monthlyLables;
  };

  // console.log(labels);

  const codeBuildLabelAndDurations = filteredCodebuildData.map((entry) => {
    const durations: { [key in BuildPhaseTypeStringType]?: number } = {};
    buildPhaseTypeStrings.map((phaseType) => {
      const buildPhase = entry.builds![0].phases!.filter((value) => {
        return value.phaseType === phaseType;
      })[0];

      durations[phaseType] = buildPhase?.durationInSeconds
        ? buildPhase.durationInSeconds
        : 0;
    });
    // console.log({durations});

    return {
      label: convertToLabel(entry.builds![0].startTime!, entry.builds?.[0].buildNumber!, groupingTypeState),
      ...durations,
    };
  });
  // console.log({codeBuildLabelAndDurations});

  const codeBuildDurations = (target: BuildPhaseTypeStringType) => {
    return detectLabels(groupingTypeState).map((label) => {
      const durations = codeBuildLabelAndDurations
        .filter((entry) => {
          return entry.label === label;
        })
        .map((entry) => {
          return entry[target] || 0;
        });
      return calculateAverage(durations);
    });
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 10,
          },
        },
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
    const datasets = buildPhaseTypeStrings.map((buildPhase) => {
      return {
        label: buildPhase,
        data: codeBuildDurations(buildPhase),
        ...colorsets[buildPhase],
      };
    });
    return datasets;
  };

  const data = {
    labels: detectLabels(groupingTypeState),
    datasets: generateDataSet(),
  };

  return (
    <>
      <div className="filterControls">
        <label className="filterLabel">group by </label>
        <span className="">
          <select
            className="groupingSlectbox"
            value={groupingTypeState}
            onChange={(e) =>
              setGroupingTypeState(e.target.value as GroupingType)
            }
          >
            {GROUPING_TYPES.map((groupingType) => (
              <option value={groupingType}>{groupingType}</option>
            ))}
          </select>
        </span>
        <label className="filterLabel">ReferenceDate </label>
        <span className="dateInputWrap">
          <input
            className="dateInput"
            type="date"
            value={referenceDateFromState}
            min="2022-01-01"
            max="2030-12-31"
            onChange={(e) => setReferenceDateFromState(e.target.value)}
          />
        </span>
        〜
        <span className="dateInputWrap">
          <input
            className="dateInput"
            type="date"
            value={referenceDateToState}
            min="2022-01-01"
            max="2030-12-31"
            onChange={(e) => setReferenceDateToState(e.target.value)}
          />
        </span>
      </div>
      <Bar options={options} data={data} />
    </>
  );
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
