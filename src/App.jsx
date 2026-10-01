import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import TvDisplay from './pages/TvDisplay';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Rota da TV continua aberta e sem necessidade de login */}
        <Route path="/tv" element={<TvDisplay />} />
        
        {/* Rota de Login */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Rota do Dashboard protegida */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
