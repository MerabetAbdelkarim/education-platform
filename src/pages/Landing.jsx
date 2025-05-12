import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <Box maxW="lg" mx="auto" mt={12} p={6} textAlign="center">
            <VStack spacing={6}>
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
            </VStack>
        </Box>
    );
};

export default Landing;