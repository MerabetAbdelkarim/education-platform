import { Box, Flex } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Layout = ({ children }) => {
    return (
        <Flex direction="column" minH="100vh">
            <Box as="header">
                <Navbar />
            </Box>
            <Box as="main" flex="1">
                {children}
            </Box>
            <Box as="footer">
                <Footer />
            </Box>
        </Flex>
    );
};

export default Layout;
