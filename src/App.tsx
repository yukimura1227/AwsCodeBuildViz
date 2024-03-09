import './App.css'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import { unifyArray } from './lib/unifyArray';
import { convertDateToDayString } from './lib/DateUtils';
import { calculateAverage } from './lib/claculateAverage';

const generateChart = (json: BatchGetBuildsCommandOutput[], title:string) => {
  const sortedCodebuildData = (json as BatchGetBuildsCommandOutput[]).sort((a, b) => {
    return a.builds![0].buildNumber! - b.builds![0].buildNumber!;
  });

  const convertToLabel = (startTime:Date, convertType:"daily") => {
    if(convertType === "daily") {
      return convertDateToDayString(startTime);
    }
  }

  // labelsは、日付部分を抜粋してユニークな配列にする
  const labels = unifyArray(
    sortedCodebuildData.map((entry) => convertToLabel(entry.builds![0].startTime!, "daily") )
  );

  console.log(labels);
  const codeBuildDateAndDurations = sortedCodebuildData.map((entry) => {
    // entry.builds![0].phasesのdurationInSecondを合計する
    const durationInSecondsSum = entry.builds![0].phases!.reduce((acc, cur) => {
      if (cur.durationInSeconds === undefined) return acc;
      return acc + cur.durationInSeconds!;
    }, 0);
    return { label: convertToLabel(entry.builds![0].startTime!, "daily"), durationInSecondsSum };
  });
  console.log(codeBuildDateAndDurations);

  // 日毎に平均を算出する
  const codeBuildDurations = labels.map((label) => {
    const durations = codeBuildDateAndDurations.filter((entry) => {
      return entry.label === label;
    }).map((entry) => {
      return entry.durationInSecondsSum;
    });
    return calculateAverage(durations);
  });

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
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'CodeBuildの実行時間',
        data: codeBuildDurations,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <Line options={options} data={data} />
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const codeBuildResultJsons:BatchGetBuildsCommandOutput[][] = [];

let settings = await import('../environment.local.json').then(module => module.default.codebuildSettings);
if(!settings) settings = await import('../environment.json').then(module => module.default.codebuildSettings);

settings.forEach( async (setting) => {
  console.log(`../codeBuildResult/${setting.codeBuildProjectName}.json`);
  codeBuildResultJsons.push(
    await import(`../codeBuildResult/${setting.codeBuildProjectName}.json`).then(module => module.default)
  );
});

export const App = () => {
  return (
    <>
      {
        codeBuildResultJsons.map((json, index) => {
          return generateChart(json, `プロジェクト${index}`);
        })
      }
    </>
  );
}
