import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoofingPage from './pages/RoofingPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to the mock lead for demo purposes */}
        <Route path="/" element={<Navigate to="/roofing/apex-heritage" replace />} />
        
        {/* The dynamic roofing lead preview route */}
        <Route path="/roofing/:slug" element={<RoofingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
