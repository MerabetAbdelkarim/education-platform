import React from 'react';
import { Box, Heading, Text, Button, VStack, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
    const navigate = useNavigate();

    return (
        <Box maxW="lg" mx="auto" mt={12} p={6} textAlign="center">
            <VStack spacing={6}>
                <Heading>Choose Your Role</Heading>
                <Text fontSize="lg">Are you a teacher or a student?</Text>
                <SimpleGrid columns={[1, 2]} spacing={4}>
                    <Button
                        colorScheme="purple"
                        size="lg"
                        onClick={() => navigate('/register/teacher')}
                    >
                        Teacher
                    </Button>
                    <Button
                        colorScheme="purple"
                        size="lg"
                        onClick={() => navigate('/register/student')}
                    >
                        Student
                    </Button>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default RoleSelection;