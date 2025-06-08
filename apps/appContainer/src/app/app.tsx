import * as React from 'react';
import AppContainer from './components/AppContainer';
import { Route, Routes } from 'react-router-dom';


export function App() {
  return (
    <React.Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<AppContainer/>} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
