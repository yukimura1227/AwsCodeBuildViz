import React from 'react';
import './App.css';
import { Chart } from "./Chart.tsx";
import { loadCodeBuildResults } from "../../lib/loadCodeBuildData.ts";

interface AppProps {
  group?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Load CodeBuild data using shared function
const codeBuildResultJsons = await loadCodeBuildResults();

export const App = ({ group, dateFrom, dateTo }: AppProps) => {
  return (
    <React.Fragment>
      {Object.keys(codeBuildResultJsons)
        .sort()
        .reverse() // TODO: implements sort function
        .map((key) => {
          // console.log(codeBuildResultJsons[key]);
          return Chart(codeBuildResultJsons[key].buildResult, key, group, dateFrom, dateTo);
        })}
    </React.Fragment>
  );
};