import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';

const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const dateFromParam = urlParams.get('dateFrom');
  const dateToParam = urlParams.get('dateTo');
  const groupParam =  urlParams.get('group');

  return {
    group: groupParam ? groupParam : undefined,
    dateFrom: dateFromParam ? new Date(dateFromParam) : undefined,
    dateTo: dateToParam ? new Date(dateToParam) : undefined
  };
};

const queryParams = getQueryParams();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App 
      group={queryParams.group} 
      dateFrom={queryParams.dateFrom} 
      dateTo={queryParams.dateTo} 
    />
  </React.StrictMode>
);
