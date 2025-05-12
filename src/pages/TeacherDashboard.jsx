import React, { useContext, useEffect } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user, role, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || role !== 'teacher')) {
            navigate('/login');
        }
    }, [user, role, loading, navigate]);

    if (loading) return <Text>Loading...</Text>;

    return (
        <Box maxW="lg" mx="auto" mt={8} p={6}>
            <VStack spacing={4}>
                <Heading>Teacher Dashboard</Heading>
                <Text>Welcome, {user?.email}!</Text>
                <Text>Here you can manage your classes and lessons.</Text>
            </VStack>
        </Box>
    );
};

export default TeacherDashboard;