import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Portfolio from './pages/Portfolio';
import Training from './pages/Training';
import Backtest from './pages/Backtest';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import AIPage from './pages/AIPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="training" element={<Training />} />
          <Route path="backtest" element={<Backtest />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
