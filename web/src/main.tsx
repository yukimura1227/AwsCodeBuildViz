import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';

const getGroupFromQuery = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('group');
};

const groupParam = getGroupFromQuery();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App group={groupParam} />
  </React.StrictMode>
);
