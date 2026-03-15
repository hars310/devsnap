import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SnapshotDetail from './pages/SnapshotDetail.jsx';
import DiffView from './pages/DiffView.jsx';

export default function App() {
  // Single source of truth for auth — checked once on load
  const [isAuthed, setIsAuthed] = useState(
    () => !!localStorage.getItem('devsnap_api_key')
  );

  const handleAuthenticated = () => setIsAuthed(true);

  const handleLogout = () => {
    localStorage.removeItem('devsnap_api_key');
    setIsAuthed(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page — always accessible */}
        <Route
          path="/"
          element={
            isAuthed
              ? <Navigate to="/dashboard" replace />
              : <HomePage onAuthenticated={handleAuthenticated} />
          }
        />

        {/* Authenticated routes */}
        <Route
          path="/dashboard"
          element={
            isAuthed
              ? <Dashboard onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/snapshot/:id"
          element={
            isAuthed
              ? <SnapshotDetail />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/diff"
          element={
            isAuthed
              ? <DiffView />
              : <Navigate to="/" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}