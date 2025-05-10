import { useState } from 'react';
import { Box, Button, Input, Select, Text, VStack } from '@chakra-ui/react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return alert('Login error: ' + error.message);

            // Get role from users table
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (userData?.role === 'teacher') navigate('/teacher');
            else navigate('/student');
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) return alert('Signup error: ' + error.message);

            // Insert into custom users table
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: data.user.id, role }]);

            if (insertError) return alert('Insert user role error: ' + insertError.message);

            alert('Account created! Please check your email for confirmation.');
        }
    };

    return (
        <Box p={8} maxW="md" mx="auto">
            <Text fontSize="2xl" mb={4}>{isLogin ? 'Login' : 'Create Account'}</Text>

            {!isLogin && (
                <Select mb={3} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">طالب</option>
                    <option value="teacher">أستاذ</option>
                </Select>
            )}

            <Input
                placeholder="Email"
                mb={3}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Password"
                mb={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <VStack spacing={2}>
                <Button colorScheme="blue" onClick={handleSubmit}>
                    {isLogin ? 'Login' : 'Sign Up'}
                </Button>
                <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Create new account' : 'Already have an account? Login'}
                </Button>
            </VStack>
        </Box>
    );
};

export default Auth;
