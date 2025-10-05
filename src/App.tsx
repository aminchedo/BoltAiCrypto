import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  // Mock user data for direct dashboard access (no authentication required)
  const mockUser = {
    username: 'trader',
    email: 'trader@hts.local',
    is_admin: true
  };

  const handleLogout = () => {
    // No-op: logout functionality disabled in direct access mode
    console.log('Logout disabled - direct dashboard access mode');
  };

  return (
    <div className="App">
      <Dashboard user={mockUser} onLogout={handleLogout} />
    </div>
  );
}

export default App;