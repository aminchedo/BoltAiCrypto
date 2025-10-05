import Dashboard from './components/Dashboard';

function App() {
  // Direct dashboard access - no authentication
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;