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
const codeBuildResultJsons = loadCodeBuildResults();

export const App = ({ group, dateFrom, dateTo }: AppProps) => {
  return (
    <React.Fragment>
      {Object.keys(codeBuildResultJsons)
        .sort()
        .reverse() // TODO: implements sort function
        .map((key) => {
          return Chart(codeBuildResultJsons[key].buildResults!, key, group, dateFrom, dateTo);
        })}
    </React.Fragment>
  );
};