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

const DeleteClassModal = ({ isOpen, onClose, teacher, setClasses, classId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const handleDeleteClass = async () => {
        if (!classId) return;
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
            // if (selectedClass?.id === classId) {
            //     setSelectedClass(null);
            //     setStudents([]);
            //     setLessons([]);
            // }
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
                <ModalHeader>Delete Class</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Are you sure you want to delete this class?
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="red"
                        mr={3}
                        onClick={handleDeleteClass}
                        isLoading={isLoading}
                    >
                        Delete
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

export default DeleteClassModal;