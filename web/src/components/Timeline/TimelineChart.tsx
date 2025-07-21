import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { secondsSinceStartOfDay } from "../../lib/DateUtils.ts";
import { BatchGetBuildsCommandOutput } from "@aws-sdk/client-codebuild";
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface TimelineChartProps {
  codeBuildResults: BatchGetBuildsCommandOutput[];
  codeBuildProjectName: string;
}

export const TimelineChart = ({ codeBuildResults, codeBuildProjectName }: TimelineChartProps) => {
  console.log({ codeBuildResults, codeBuildProjectName });
  const options:ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 0,
      },
    },
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
    scales: {
      x: {
        min: 60*60* 0,
        max: 60*60* 24,
        ticks: {
          callback: (value: string|number, _index: number) => {
            const hours = Math.floor(Number(value) / 3600);
            const minutes = Math.floor((Number(value) % 3600) / 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          },
          stepSize: 60*60, // 1 hour
        },
      },
    },
  };

  const buildNumbers = codeBuildResults.map((result) => {
    const build = result.builds?.[0]
    return build ? build.buildNumber : 0;
  });
  const labels = buildNumbers.map((num) => `Build ${num}`);
  const generateDatasets = () => {
    return(
      [
        // This dataset is for the start time of the build
        {
          label: ``,
          data: codeBuildResults.map((result, index) => {
            const build = result.builds?.[0];
            if (!build || !build.startTime) return null;

            const startTime = new Date(build.startTime);
            return({
              x: secondsSinceStartOfDay(startTime),
              y: index + 1,
            });
          }),
          backgroundColor: 'rgba(255, 99, 132, 0)',
          stack: `Stack`,
       },
       {
          label: `Build`,
          data: codeBuildResults.map((result, index) => {
            const build = result.builds?.[0];
            if (!build || !build.startTime) return null;

            const duration = build.phases?.reduce((acc, phase) => {
              return acc + (phase.durationInSeconds || 0);
            }, 0) || 0;

            return({
              x: duration,
              y: index + 1,
            });
          }),
          backgroundColor: 'rgba(255, 99, 132, 1)',
          stack: `Stack`,
       },
    ]
    );
  };
  const datasets = generateDatasets();
  
  const data = {
    labels,
    datasets: datasets,
  };

  return (
    <React.Fragment>
      <Bar options={options} data={data} />
    </React.Fragment>
  );
}
