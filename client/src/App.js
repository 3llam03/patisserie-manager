import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import NewRecipe from './pages/NewRecipe';
import Tasks from './pages/Tasks';
import Stock from './pages/Stock';
import MiseEnPlace from './pages/MiseEnPlace';
import Equipe from './pages/Equipe';
import Planning from './pages/Planning';
import ModeCuisine from './pages/ModeCuisine';
import Statistiques from './pages/Statistiques';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function ChefRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'head_chef' ? children : <Navigate to="/" />;
}

function AppRoutes() {
  const { user } = useAuth();
  const isCuisineMode = window.location.pathname === '/cuisine';

  return (
    <>
      {user && !isCuisineMode && <Navbar />}
      <Box sx={{ maxWidth: isCuisineMode ? '100%' : 1200, mx: 'auto', p: user && !isCuisineMode ? 3 : 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><RecipeList /></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/new" element={<ChefRoute><NewRecipe /></ChefRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
          <Route path="/mise-en-place" element={<ChefRoute><MiseEnPlace /></ChefRoute>} />
          <Route path="/equipe" element={<ChefRoute><Equipe /></ChefRoute>} />
          <Route path="/planning" element={<ChefRoute><Planning /></ChefRoute>} />
          <Route path="/cuisine" element={<ProtectedRoute><ModeCuisine /></ProtectedRoute>} />
          <Route path="/statistiques" element={<ChefRoute><Statistiques /></ChefRoute>} />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
