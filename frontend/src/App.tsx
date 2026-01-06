import React from 'react';
import { useStore } from './store';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import CaseWorkspace from './pages/CaseWorkspace';

function App() {
  const { isAuthenticated, currentCase } = useStore();

  // Route to appropriate view based on authentication and case selection
  if (!isAuthenticated) {
    return <Login />;
  }

  if (currentCase) {
    return <CaseWorkspace />;
  }

  return <Dashboard />;
}

export default App;
