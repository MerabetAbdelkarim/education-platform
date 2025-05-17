import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    VStack,
    IconButton,
    useColorModeValue,
    TableContainer,
    useDisclosure,
} from '@chakra-ui/react';
import { MdAdd, MdDeleteOutline } from "react-icons/md";;
import { supabase } from '../../../../supabase';
import CreateClassModal from '../model/createClassModal';

const ClassesComponent = ({ classes, teacher, fetchClasses, setClasses }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headingColor = useColorModeValue("gray.800", "white");
    const hoverBgColor = useColorModeValue("gray.50", "gray.700");
    const descriptionColor = useColorModeValue("gray.600", "gray.300");

    const handleDeleteClass = async (classId) => {
        setIsLoading(true);
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', classId);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete class',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Success',
                description: 'Class deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await fetchClasses(teacher.id);
            if (selectedClass?.id === classId) {
                setSelectedClass(null);
                setStudents([]);
                setLessons([]);
            }
        }
        setIsLoading(false);
    };

    return (
        <Box p={8}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="md" color={headingColor}>
                            Your Classes
                        </Heading>
                        <Button
                            colorScheme="blue"
                            onClick={onOpen}
                            leftIcon={<MdAdd />}
                            size="sm"
                        >
                            Create Class
                        </Button>
                    </Flex>
                    {classes.length === 0 ? (
                        <Box
                            p={8}
                            textAlign="center"
                            borderWidth="1px"
                            borderRadius="lg"
                            borderColor={borderColor}
                        >
                            <Text mb={4} color={textColor}>
                                No classes found. Create a new class to get started.
                            </Text>
                            <Button
                                colorScheme="blue"
                                variant="outline"
                                onClick={onOpen}
                                size="sm"
                            >
                                Create Your First Class
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer
                            borderWidth="1px"
                            borderRadius="lg"
                            borderColor={borderColor}
                        >
                            <Table variant="simple" size="md">
                                <Thead bg={bgColor}>
                                    <Tr>
                                        <Th px={4} py={3}>Name</Th>
                                        <Th px={4} py={3}>Description</Th>
                                        <Th px={4} py={3} textAlign="right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {classes.map((cls) => (
                                        <Tr key={cls.id} _hover={{ bg: hoverBgColor }}>
                                            <Td px={4} py={3}>
                                                <Button
                                                    variant="link"
                                                    colorScheme="blue"
                                                    fontWeight="medium"
                                                    onClick={() => {
                                                        setSelectedClass(cls);
                                                        // fetchClassDetails(cls.id);
                                                    }}
                                                >
                                                    {cls.name}
                                                </Button>
                                            </Td>
                                            <Td px={4} py={3} color={descriptionColor}>
                                                {cls.description}
                                            </Td>
                                            <Td px={4} py={3} textAlign="right">
                                                <IconButton
                                                    icon={<MdDeleteOutline />}
                                                    aria-label={`Delete ${cls.name}`}
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClass(cls.id)}
                                                    isDisabled={isLoading}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </VStack >
            <CreateClassModal isOpen={isOpen} onClose={onClose} teacher={teacher} fetchClasses={fetchClasses} setClasses={setClasses} />
        </Box >
    );
};
export default ClassesComponent;