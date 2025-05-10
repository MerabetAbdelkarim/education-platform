import { Link } from "react-router-dom";
import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    useColorModeValue,
    Center,
    Container
} from "@chakra-ui/react";

const NotFoundPage = () => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "gray.100");

    return (
        <Container>
            <Center minH="100vh" bg={bgColor}>
                <VStack spacing={6} textAlign="center" px={4}>
                    <Box>
                        <Heading
                            as="h1"
                            size="4xl"
                            color="blue.500"
                            mb={2}
                            fontWeight="extrabold"
                        >
                            404
                        </Heading>
                        <Heading
                            as="h2"
                            size="xl"
                            color={headingColor}
                            fontWeight="semibold"
                        >
                            Page Not Found
                        </Heading>
                    </Box>

                    <Text fontSize="lg" color={textColor} maxW="md">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </Text>

                    <Button
                        as={Link}
                        to="/"
                        colorScheme="blue"
                        size="lg"
                        px={8}
                        py={6}
                        borderRadius="xl"
                        fontWeight="bold"
                        _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                    >
                        Go back home
                    </Button>
                </VStack>
            </Center>
        </Container>
    );
};

export default NotFoundPage;