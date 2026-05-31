import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";

const DashboardPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-4">🚨</div>
      <h1 className="text-2xl font-bold text-gray-100 mb-2">Incident Room</h1>
      <p className="text-gray-400">
        server + socket foundation ready.
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Dashboard will appear.
      </p>
    </div>
  </div>
);

const IncidentDetailPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-400">Incident detail </p>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────

const App = () => {
  return (
    
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          {/* Main dashboard — lists all incidents */}
          <Route path="/" element={<DashboardPage />} />

          {/* Incident detail — real-time updates + AI panel */}
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />

          {/* Catch-all — redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
};

export default App;
