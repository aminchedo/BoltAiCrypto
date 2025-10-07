import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ComprehensiveDashboard from './pages/Dashboard/ComprehensiveDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Use the new comprehensive dashboard with sidebar as the main route */}
        <Route path="/" element={<ComprehensiveDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
