import React, { useContext } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, role, signOut } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: 'Signed out',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/');
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box bg="teal.500" p={4}>
            <Flex alignItems="center">
                <Heading size="md" color="white">
                    <Link to="/">EduApp</Link>
                </Heading>
                <Spacer />
                {user ? (
                    <>
                        <Box color="white" mr={4}>
                            {role === 'teacher' ? 'Teacher' : 'Student'}: {user.email}
                        </Box>
                        <Button colorScheme="teal" variant="outline" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            as={Link}
                            to="/login"
                            colorScheme="teal"
                            variant="outline"
                            mr={2}
                        >
                            Login
                        </Button>
                        <Button as={Link} to="/role-selection" colorScheme="teal">
                            Register
                        </Button>
                    </>
                )}
            </Flex>
        </Box>
    );
};

export default Navbar;