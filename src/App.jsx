import React from 'react';
import { ChakraProvider, Text } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import RoleSelection from './components/RoleSelection';
import Register from './components/Register';
import Login from './components/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;