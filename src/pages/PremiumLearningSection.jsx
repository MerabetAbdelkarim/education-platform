import React from 'react';
import { Box, Flex, Image, Heading, Text, VStack, HStack, Icon, SimpleGrid } from '@chakra-ui/react';
import { FaHeart, FaGamepad } from 'react-icons/fa';
import ImgPremium from '../assets/image-premium.svg';
import ImgPremiumBg from '../assets/bg-cover-two.svg';

const PremiumLearningSection = () => {
    return (<>
        <Box bgImage={ImgPremiumBg} bgSize="cover" bgPosition="center" bgRepeat="no-repeat">
            <Flex py={"100px"} justify="center" gap={5} align="center" flexWrap="wrap" >
                <Box maxW="sm" mt={[8, 0]}>
                    <Image src={ImgPremium} alt="Girl Learning" borderRadius="md" />
                </Box>
                <Box maxW="sm" flex="1" pl={[0, null, 10]}>
                    <Heading as="h2" size="xl" mb={6}>
                        Premium <Text as="span" color="orange.400">Learning</Text> Experience
                    </Heading>
                    <VStack align="start" spacing={6}>
                        <HStack align="flex-start">
                            <Box boxSize={10} bg="purple.600" color="white" p={2} borderRadius="md">
                                <Icon as={FaHeart} boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Easily Accessible</Text>
                                <Text fontSize="sm" color="gray.500">
                                    Learning Will fell Very Comfortable With Courslab.
                                </Text>
                            </Box>
                        </HStack>

                        <HStack align="flex-start">
                            <Box boxSize={10} bg="purple.600" color="white" p={2} borderRadius="md">
                                <Icon as={FaGamepad} boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Fun learning expe</Text>
                                <Text fontSize="sm" color="gray.500">
                                    Learning Will fell Very Comfortable With Courslab.
                                </Text>
                            </Box>
                        </HStack>
                    </VStack>
                </Box>
            </Flex>
        </Box>
    </>
    );
};

export default PremiumLearningSection;