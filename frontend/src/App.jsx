import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PerformanceMonitor from './components/dev/PerformanceMonitor';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Outras rotas serão adicionadas aqui */}
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <PerformanceMonitor />
      </Router>
    </AuthProvider>
  );
}

export default App;
