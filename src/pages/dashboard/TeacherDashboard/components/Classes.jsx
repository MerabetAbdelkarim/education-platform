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
    VStack,
    IconButton,
    useColorModeValue,
    TableContainer,
    useDisclosure,
} from '@chakra-ui/react';
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import CreateClassModal from '../model/createClassModal';
import DeleteClassModal from '../model/DeleteClassModal';

const ClassesComponent = ({ classes, teacher, setClasses, setSelectedClass }) => {

    const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const [selectedClassId, setSelectedClassId] = useState(null);

    const handleOpenDelete = (classId) => {
        setSelectedClassId(classId);
        onOpenDelete();
    };

    const bgColor = useColorModeValue("gray.50", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headingColor = useColorModeValue("gray.800", "white");
    const hoverBgColor = useColorModeValue("gray.50", "gray.700");
    const descriptionColor = useColorModeValue("gray.600", "gray.300");

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
                            onClick={onOpenCreate}
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
                                onClick={onOpenCreate}
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
                                                    onClick={() => handleOpenDelete(cls.id)}
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
            <CreateClassModal isOpen={isOpenCreate} onClose={onCloseCreate} teacher={teacher} setClasses={setClasses} />
            <DeleteClassModal isOpen={isOpenDelete} onClose={onCloseDelete} teacher={teacher} classId={selectedClassId} setClasses={setClasses} />
        </Box >
    );
};
export default ClassesComponent;