import React from 'react';
import {
    Box,
    Text,
    Heading,
    VStack,
    SimpleGrid,
} from '@chakra-ui/react';

const Feacher = () => {
    return (
        <Box bg="purple.800" w={"80%"} my={10} mx={"auto"} color="white"  p={10} borderRadius="xl">
            <SimpleGrid columns={[1, 3]} spacing={8}>
                <FeatureBox
                    title="Learn The Latest Skills"
                    text="Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a BC, making it over 2000 years old."
                    icon="🧠"
                />
                <FeatureBox
                    title="Get Ready For a Career"
                    text="Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a BC, making it over 2000 years old."
                    icon="💼"
                />
                <FeatureBox
                    title="Earn a Certificate"
                    text="Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a BC, making it over 2000 years old."
                    icon="📜"
                />
            </SimpleGrid>
        </Box>
    );
};

const FeatureBox = ({ title, text, icon }) => (
    <VStack align="start" spacing={4}>
        <Text fontSize="3xl">{icon}</Text>
        <Heading fontSize="lg">{title}</Heading>
        <Text fontSize="sm" color="gray.200">{text}</Text>
    </VStack>
);

export default Feacher;
