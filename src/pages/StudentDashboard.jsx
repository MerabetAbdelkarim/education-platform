import React, { useContext, useEffect } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, role, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || role !== 'student')) {
            navigate('/login');
        }
    }, [user, role, loading, navigate]);

    if (loading) return <Text>Loading...</Text>;

    return (
        <Box maxW="lg" mx="auto" mt={8} p={6}>
            <VStack spacing={4}>
                <Heading>Student Dashboard</Heading>
                <Text>Welcome, {user?.email}!</Text>
                <Text>Your Student ID: {role === 'student' && (
                    <span>Loading...</span> // Fetch student_id from students table
                )}</Text>
                <Text>Here you can view your enrolled classes and lessons.</Text>
            </VStack>
        </Box>
    );
};

export default StudentDashboard;