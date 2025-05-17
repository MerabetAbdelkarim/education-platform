import { Box, Text, Button, Link, VStack, Divider, Center, Img } from "@chakra-ui/react";
import ImageConf from "../../assets/confirmation.png";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {  useNavigate } from "react-router-dom";

const EmailConfirmation = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    return (
        <Center minH="calc(100vh - 72px)" bg="gray.100">
            <Box
                maxW="md"
                w="full"
                p={6}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
            >
                <VStack spacing={4}>
                    <Img
                        src={ImageConf}
                        alt="image of email confirmation"
                        boxSize="100px"
                        mb={4}
                    />
                    <Text fontSize="xl" fontWeight="bold">
                        Email Confirmation
                    </Text>
                    <Text>
                        We have sent email to <Text as="span" fontWeight="semibold">{user?.email}</Text> to confirm the validity of our email address. After receiving the email follow the link provided to complete your registration.
                    </Text>
                    <Divider />
                    <Text>
                        Go to login page after confirming your email address.
                        <Link
                            as="button"
                            color="blue.500"
                            fontWeight="bold"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Center>
    );
};

export default EmailConfirmation;