import React, { useState, useContext } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    Heading,
    useToast,
} from '@chakra-ui/react';
import { supabase } from '../supabase';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser, setRole } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log("data", data)
            console.log("error", error)
            if (error) throw error;
            setUser(data.user);
            const { data: teacher } = await supabase
                .from('teachers')
                .select('teacher_id')
                .eq('user_id', data.user.id)
                .single();
            if (teacher) {
                setRole('teacher');
                navigate('/dashboard/teacher');
            } else {
                const { data: student } = await supabase
                    .from('students')
                    .select('student_pk')
                    .eq('user_id', data.user.id)
                    .single();
                if (student) {
                    setRole('student');
                    navigate('/dashboard/student');
                }
            }
            toast({
                title: 'Login successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
            <Heading mb={6}>Login</Heading>
            <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                    <Button
                        colorScheme="teal"
                        type="submit"
                        isLoading={loading}
                        width="full"
                    >
                        Login
                    </Button>
                </VStack>
            </form>
            <Text mt={4}>
                Don't have an account?{' '}
                <Button
                    variant="link"
                    colorScheme="teal"
                    onClick={() => navigate('/role-selection')}
                >
                    Register
                </Button>
            </Text>
        </Box>
    );
};

export default Login;