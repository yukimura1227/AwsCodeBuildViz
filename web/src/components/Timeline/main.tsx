import React from 'react';
import ReactDOM from 'react-dom/client';
import { TimelineChart } from './TimelineChart.tsx';
import type { BatchGetBuildsCommandOutput } from '@aws-sdk/client-codebuild/dist-types/commands/BatchGetBuildsCommand';
import { convertDateToDayString } from "../../lib/DateUtils.ts";
import { loadCodeBuildResults } from "../../lib/loadCodeBuildData.ts";
import '../index.css';

// Load CodeBuild data using shared function
const codeBuildResultJsons = await loadCodeBuildResults();

const App = () => {
  const [referenceDate, setReferenceDate] = React.useState(new Date()); 
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceDate(new Date(event.target.value));
  };

  const filterCodeBuildResults = (results: BatchGetBuildsCommandOutput[]) => {
    return results.filter((result) => {
      const startTime = new Date(result.builds![0].startTime!);
      return (
        startTime >= new Date(`${convertDateToDayString(referenceDate)}T00:00:00.000Z`) &&
        startTime <= new Date(`${convertDateToDayString(referenceDate)}T23:59:59.999Z`)
      );
    });
  };

  return (
    <React.Fragment>
        <label className="filterLabel">ReferenceDate </label>
        <span className="dateInputWrap">
          <input
            type="date"
            value={referenceDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
          />
        </span>
      {Object.keys(codeBuildResultJsons)
        .sort()
        .reverse()
        .map((key) => {
          return (
            <TimelineChart
              key={key}
              codeBuildResults={filterCodeBuildResults(codeBuildResultJsons[key].buildResult)}
              codeBuildProjectName={key}
            />
          );
        })}
    </React.Fragment>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
