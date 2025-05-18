import React, { useState, useEffect } from 'react';
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
    HStack,
    IconButton,
    TableContainer,
} from '@chakra-ui/react';
import { MdDeleteOutline } from "react-icons/md";;
import { supabase } from '../../../../supabase';

const ClassDetails = ({ selectedClass }) => {
    const [students, setStudents] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', description: '' });
    const [newStudentId, setNewStudentId] = useState('');
    const [newLesson, setNewLesson] = useState({ name: '', pdf_file: null });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();



    useEffect(() => {
        const fetchClassDetails = async ({ classId }) => {
            setIsLoading(true);
            // Fetch students
            const { data: studentData, error: studentError } = await supabase
                .from('class_enrollments')
                .select(`student_id,students(studentId, first_name, last_name, email)`)
                .eq('class_id', classId);
            // Fetch lessons and generate signed URLs
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .select('id, name, pdf_url, created_at')
                .eq('class_id', classId)
                .order('created_at', { ascending: false });
            if (studentError || lessonError) {
                toast({
                    title: 'Error',
                    description: 'Failed to load class details',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setIsLoading(false);
                return;
            }

            // Generate signed URLs for lesson PDFs
            const lessonsWithUrls = await Promise.all(
                lessonData.map(async (lesson) => {
                    const { data: signedUrlData, error: urlError } = await supabase.storage
                        .from('lessons')
                        .createSignedUrl(lesson.pdf_url, 3600); // 1-hour expiry
                    if (urlError) {
                        console.error('Error generating signed URL:', urlError);
                        return { ...lesson, pdf_url: null };
                    }
                    return { ...lesson, pdf_url: signedUrlData.signedUrl };
                })
            );

            setStudents(studentData);

            setLessons(lessonsWithUrls);
            setIsLoading(false);
        };
        fetchClassDetails(selectedClass?.id)
    }, [selectedClass?.id])


    const handleEnrollStudent = async () => {
        setIsLoading(true);
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id')
            .eq('studentId', newStudentId)
            .single();

        if (studentError || !student) {
            toast({
                title: 'Error',
                description: 'Student not found',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }
        const { error } = await supabase
            .from('class_enrollments')
            .insert({
                class_id: selectedClass.id,
                student_id: student.id,
            });

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to enroll student',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Success',
                description: 'Student enrolled successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await fetchClassDetails(selectedClass.id);
            setNewStudentId('');
            setIsStudentModalOpen(false);
        }
        setIsLoading(false);
    };

    const handleAddLesson = async () => {
        console.log("Adding lesson:", newLesson);
        setIsLoading(true);
        if (!newLesson.pdf_file) {
            toast({
                title: 'Error',
                description: 'Please select a PDF file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        // Generate a unique file name
        const fileName = `${Date.now()}-${newLesson.pdf_file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('lessons')
            .upload(fileName, newLesson.pdf_file);
        if (uploadError) {
            toast({
                title: 'Error',
                description: 'Failed to upload PDF',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        const dataO = {
            class_id: selectedClass.id,
            name: newLesson.name,
            pdf_url: fileName,
        }
        console.log("Data to insert:", dataO);
        const { error } = await supabase
            .from('lessons')
            .insert({
                class_id: selectedClass.id,
                name: newLesson.name,
                pdf_url: fileName,
            });

        if (error) {
            console.log("error", error)
            toast({
                title: 'Error',
                description: error,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: 'Success',
                description: 'Lesson added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await fetchClassDetails(selectedClass.id);
            setNewLesson({ name: '', pdf_file: null });
            setIsLessonModalOpen(false);
        }
        setIsLoading(false);
    };

    const handleDeleteLesson = async (lessonId, pdfPath) => {
        setIsLoading(true);
        // Delete the lesson record
        const { error: deleteLessonError } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (deleteLessonError) {
            toast({
                title: 'Error',
                description: 'Failed to delete lesson',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        // Delete the PDF from storage
        const { error: deleteFileError } = await supabase.storage
            .from('lessons')
            .remove([pdfPath]);

        if (deleteFileError) {
            console.error('Error deleting PDF from storage:', deleteFileError);
            // Note: Lesson is already deleted, so we proceed
        }

        toast({
            title: 'Success',
            description: 'Lesson deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        await fetchClassDetails(selectedClass.id);
        setIsLoading(false);
    };

    return (
        <Box p={8}>
            <VStack spacing={8} align="stretch">

                {/* Class Details Section */}
                {
                    selectedClass && (
                        <Box>
                            <Heading size="md" mb={4}>
                                {selectedClass.name} Details
                            </Heading>
                            <VStack spacing={6} align="stretch">
                                {/* Students */}
                                <Box>
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <Heading size="sm">Enrolled Students</Heading>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => setIsStudentModalOpen(true)}
                                        >
                                            Enroll Student
                                        </Button>
                                    </Flex>
                                    {students.length === 0 ? (
                                        <Text>No students enrolled in this class.</Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Student ID</Th>
                                                    <Th>First Name</Th>
                                                    <Th>Last Name</Th>
                                                    <Th>Email</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {students.map((student) => (
                                                    <Tr key={student?.students?.studentId}>
                                                        <Td>{student?.students?.studentId}</Td>
                                                        <Td>{student?.students?.first_name}</Td>
                                                        <Td>{student?.students?.last_name}</Td>
                                                        <Td>{student?.students?.email}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </Box>

                                {/* Lessons */}
                                <Box>
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <Heading size="sm">Lessons</Heading>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => setIsLessonModalOpen(true)}
                                        >
                                            Add Lesson
                                        </Button>
                                    </Flex>
                                    {lessons.length === 0 ? (
                                        <Text>No lessons for this class.</Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Name</Th>
                                                    <Th>PDF</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {lessons.map((lesson) => (
                                                    <Tr key={lesson.id}>
                                                        <Td>{lesson.name}</Td>
                                                        <Td>
                                                            {lesson.pdf_url ? (
                                                                <a
                                                                    href={lesson.pdf_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    View PDF
                                                                </a>
                                                            ) : (
                                                                <Text color="red.500">PDF unavailable</Text>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                icon={<MdDeleteOutline />}
                                                                colorScheme="red"
                                                                size="sm"
                                                                onClick={() => handleDeleteLesson(lesson.id, lesson.pdf_url)}
                                                                isDisabled={isLoading}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </Box>
                            </VStack>
                        </Box>
                    )
                }
            </VStack >


            {/* Enroll Student Modal */}
            < Modal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Enroll Student</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Student Education ID</FormLabel>
                            <Input
                                value={newStudentId}
                                onChange={(e) => setNewStudentId(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={handleEnrollStudent}
                            isLoading={isLoading}
                        >
                            Enroll
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsStudentModalOpen(false)}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >

            {/* Add Lesson Modal */}
            < Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Lesson</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Lesson Name</FormLabel>
                                <Input
                                    value={newLesson.name}
                                    onChange={(e) =>
                                        setNewLesson({ ...newLesson, name: e.target.value })
                                    }
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>PDF File</FormLabel>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) =>
                                        setNewLesson({ ...newLesson, pdf_file: e.target.files[0] })
                                    }
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={handleAddLesson}
                            isLoading={isLoading}
                        >
                            Add
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsLessonModalOpen(false)}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </Box >
    );
};

export default ClassDetails;