import React from 'react';
import {
    Box,
    Flex,
    Heading,
} from '@chakra-ui/react';

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <Box bg="gray.100" py={4}>
            <Flex justifyContent={"flex-end"} px={20} >
                <Heading size="sm">© {year} EduApp</Heading>
            </Flex>
        </Box>
    );
};

export default Footer;