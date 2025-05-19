import React, { useContext } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Img,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ImgLogo from '../assets/logo.svg'

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
        <Box bg="white" p={4} borderBottom={"1px solid #e2e8f0"}>
            <Flex alignItems="center">
                <Heading size="md" color='purple.800'>
                    <HStack>
                        <Img src={ImgLogo} width={8} />
                        <Link to="/">LegalVision</Link>
                    </HStack>
                </Heading>
                <Spacer />
                {user ? (
                    <>
                        <Box color="black" mr={4}>
                            {role === 'teacher' ? 'Teacher' : 'Student'}: {user.email}
                        </Box>
                        <Button colorScheme="red" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            as={Link}
                            to="/login"
                            colorScheme='purple'
                            variant="outline"
                            mr={2}
                        >
                            Login
                        </Button>
                        <Button as={Link} to="/role-selection" colorScheme='purple' >
                            Register
                        </Button>
                    </>
                )}
            </Flex>
        </Box>
    );
};

export default Navbar;