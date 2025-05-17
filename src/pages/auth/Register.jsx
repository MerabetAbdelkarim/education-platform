import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    Text,
} from '@chakra-ui/react';
import { supabase } from '../../supabase';
import { useNavigate, useParams } from 'react-router-dom';

const Register = () => {
    const { role } = useParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });
            if (authError) throw authError;
            if (role === 'teacher') {
                const { error: teacherError } = await supabase
                    .from('teachers')
                    .insert({
                        user_id: authData.user.id,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                    });
                if (teacherError) throw teacherError;
            } else {
                if (!studentId) throw new Error('Student ID is required');
                const { error: studentError } = await supabase
                    .from('students')
                    .insert({
                        user_id: authData.user.id,
                        studentId,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                    });
                console.log("studentError", studentError);
                if (studentError) throw studentError;
            }
            toast({
                title: 'Registration successful ',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/email-confirmation');
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
            <Heading mb={6}>{role === 'teacher' ? 'Teacher' : 'Student'} Registration</Heading>
            <form onSubmit={handleRegister}>
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
                    <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </FormControl>
                    {role === 'student' && (
                        <FormControl isRequired>
                            <FormLabel>Student ID</FormLabel>
                            <Input
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="e.g., STU001"
                            />
                        </FormControl>
                    )}
                    <Button
                        colorScheme="purple"
                        type="submit"
                        isLoading={loading}
                        width="full"
                    >
                        Register
                    </Button>
                </VStack>
            </form>
            <Text mt={4}>
                Already have an account?{' '}
                <Button
                    variant="link"
                    colorScheme="purple"
                    onClick={() => navigate('/login')}
                >
                    Login
                </Button>
            </Text>
        </Box>
    );
};

export default Register;