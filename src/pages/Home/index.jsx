import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import PremiumLearningSection from './PremiumLearningSection';
import Feacher from './Feacher';
import HeroSection from './HeroSection';

const Home = () => {
    return (
        <Box >
            <HeroSection />
            <Feacher />
            <PremiumLearningSection />
        </Box>
    );
};

export default Home;