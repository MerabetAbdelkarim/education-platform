import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import HomePage from './HomePage';
import PremiumLearningSection from './PremiumLearningSection';
import Feacher from './Feacher';
import Footer from '../components/Footer';

const Landing = () => {
    return (
        <Box >
            {/* <VStack spacing={6}>
                <Heading>Welcome to EduApp</Heading>
                <Text fontSize="lg">
                    Join our platform to access educational resources, create classes, or learn with expert teachers.
                </Text>
                <Button as={Link} to="/role-selection" colorScheme="teal" size="lg">
                    Get Started
                </Button>
                <Text>
                    Already have an account?{' '}
                    <Button as={Link} to="/login" variant="link" colorScheme="teal">
                        Login
                    </Button>
                </Text>
            </VStack> */}
            <HomePage />
            <Feacher />
            <PremiumLearningSection />
            <Footer />
        </Box>
    );
};

export default Landing;