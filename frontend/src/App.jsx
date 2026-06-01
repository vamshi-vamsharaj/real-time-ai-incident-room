import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import DashboardPage from './features/incidents/pages/DashboardPage';
import IncidentDetailPage from './features/incidents/pages/IncidentDetailPage';

const App = () => (
  <ThemeProvider>
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </ThemeProvider>
);

export default App;