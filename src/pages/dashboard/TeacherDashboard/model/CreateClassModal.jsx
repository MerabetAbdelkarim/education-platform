import React, { useState } from 'react';
import {
    Flex,
    Button,
    Input,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { supabase } from '../../../../supabase';

const CreateClassModal = ({ isOpen, onClose, teacher, setClasses }) => {
    const [newClass, setNewClass] = useState({ name: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const handleCreateClass = async () => {
        setIsLoading(true);
        const { error } = await supabase
            .from('classes')
            .insert({
                teacher_id: teacher.id,
                name: newClass.name,
                description: newClass.description,
            });

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to create class',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Success',
                description: 'Class created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await fetchClasses(teacher.id);
            setNewClass({ name: '', description: '' });
            onClose()
        }
        setIsLoading(false);
    };
    const fetchClasses = async (teacherId) => {
        const { data, error } = await supabase
            .from('classes')
            .select('id, name, description')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });
        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to load classes',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            setClasses(data);
        }
    };
    return (
        < Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New Class</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Class Name</FormLabel>
                            <Input
                                value={newClass.name}
                                onChange={(e) =>
                                    setNewClass({ ...newClass, name: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Input
                                value={newClass.description}
                                onChange={(e) =>
                                    setNewClass({ ...newClass, description: e.target.value })
                                }
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        mr={3}
                        onClick={handleCreateClass}
                        isLoading={isLoading}
                    >
                        Create
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
};

export default CreateClassModal;