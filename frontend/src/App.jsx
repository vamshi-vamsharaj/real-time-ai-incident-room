import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './features/incidents/pages/DashboardPage';
import IncidentDetailPage from './features/incidents/pages/IncidentDetailPage';

const App = () => (
  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>
    </BrowserRouter>
 
);

export default App;