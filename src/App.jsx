import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/router';
import Footer from './components/Footer';


function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
          <Footer />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;