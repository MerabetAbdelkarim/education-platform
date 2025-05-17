import React from 'react';
import {
    Box,
    Text,
    Heading,
    Button,
    Flex,
    Image,
} from '@chakra-ui/react';
import ImgHero from '../../assets/hero-image.svg';
import ImgHeroBg from '../../assets/bg-cover.svg'
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <Box bgImage={ImgHeroBg} bgSize="cover" bgPosition="center" bgRepeat="no-repeat">
            <Flex py={"100px"} justify="center" gap={5} align="center" flexWrap="wrap" >
                <Box maxW="lg">
                    <Heading fontSize="4xl" mb={4}>
                        The <Text as="span" color="orange.400">Smart</Text> Choice For <Text as="span" color="orange.400">Future</Text>
                    </Heading>
                    <Text mb={6} color="gray.600">
                        Elearn is a global training provider based across the UK that specialises in accredited and bespoke training courses. We crush the...
                    </Text>
                    <Button as={Link} to="/role-selection" colorScheme="purple" size="lg">
                        Get Started
                    </Button>
                </Box>

                <Box maxW="lg" mt={[8, 0]}>
                    <Image src={ImgHero} alt="E-learning illustration" borderRadius="md" />
                </Box>
            </Flex>
        </Box>
    );
};

export default HeroSection;
