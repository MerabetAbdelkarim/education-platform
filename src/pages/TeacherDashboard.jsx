import React, { useState, useEffect, useContext } from 'react';
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
    Spinner,
    VStack,
    HStack,
    IconButton,
} from '@chakra-ui/react';
import { MdDeleteOutline  }  from "react-icons/md";;
import { supabase } from '../supabase';

import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TeacherDashboard = () => {
    const { user, role, loading: authLoading } = useContext(AuthContext);
    const [teacher, setTeacher] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
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
    const navigate = useNavigate();

    // Fetch teacher data
    useEffect(() => {
        if (authLoading) return;

        if (!user || role !== 'teacher') {
            navigate('/login');
            return;
        }

        const fetchTeacher = async () => {
            setIsLoading(true);
            const { data: teacherData, error } = await supabase
                .from('teachers')
                .select('id, first_name, last_name')
                .eq('user_id', user.id)
                .single();

            if (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load teacher profile',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }
            setTeacher(teacherData);
            await fetchClasses(teacherData.id);
            setIsLoading(false);
        };

        fetchTeacher();
    }, [user, role, authLoading, navigate, toast]);

    const fetchClasses = async (teacherId) => {
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const fetchClassDetails = async (classId) => {
        setIsLoading(true);
        // Fetch students
        const { data: studentData, error: studentError } = await supabase
            .from('class_enrollments')
            .select(`
        student_id,
        students(studentId, first_name, last_name),
        auth.users(email)
      `)
            .eq('class_id', classId);

        // Fetch lessons and generate signed URLs
        const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('id, name, pdf_path, created_at')
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
                    .createSignedUrl(lesson.pdf_path, 3600); // 1-hour expiry
                if (urlError) {
                    console.error('Error generating signed URL:', urlError);
                    return { ...lesson, pdf_url: null };
                }
                return { ...lesson, pdf_url: signedUrlData.signedUrl };
            })
        );

        setStudents(
            studentData.map((enrollment) => ({
                ...enrollment.students,
                email: enrollment.auth_users?.email,
            }))
        );
        setLessons(lessonsWithUrls);
        setIsLoading(false);
    };

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
            setIsClassModalOpen(false);
        }
        setIsLoading(false);
    };

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

        console.log("Student ID:", student.id);
        console.log("Selected Class ID:", selectedClass.id);

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

        const { error } = await supabase
            .from('lessons')
            .insert({
                class_id: selectedClass.id,
                name: newLesson.name,
                pdf_path: fileName,
            });

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to add lesson',
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

    if (authLoading || isLoading || !teacher) {
        return (
            <Flex justify="center" align="center" minH="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box p={8}>
            <VStack spacing={8} align="stretch">
                {/* Teacher Profile */}
                <Box>
                    <Flex justify="space-between" align="center">
                        <Heading size="lg">Teacher Dashboard</Heading>
                    </Flex>
                    <Text mt={2}>
                        Welcome, {teacher.first_name} {teacher.last_name} ({user.email})
                    </Text>
                </Box>

                {/* Classes Section */}
                <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Your Classes</Heading>
                        <Button colorScheme="blue" onClick={() => setIsClassModalOpen(true)}>
                            Create Class
                        </Button>
                    </Flex>
                    {classes.length === 0 ? (
                        <Text>No classes found. Create a new class to get started.</Text>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Description</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {classes.map((cls) => (
                                    <Tr key={cls.id}>
                                        <Td>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setSelectedClass(cls);
                                                    fetchClassDetails(cls.id);
                                                }}
                                            >
                                                {cls.name}
                                            </Button>
                                        </Td>
                                        <Td>{cls.description}</Td>
                                        <Td>
                                            <IconButton
                                                icon={<MdDeleteOutline  />}
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => handleDeleteClass(cls.id)}
                                                isDisabled={isLoading}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>

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
                                                    <Tr key={student.studentId}>
                                                        <Td>{student.studentId}</Td>
                                                        <Td>{student.first_name}</Td>
                                                        <Td>{student.last_name}</Td>
                                                        <Td>{student.email}</Td>
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
                                                                icon={<MdDeleteOutline  />}
                                                                colorScheme="red"
                                                                size="sm"
                                                                onClick={() => handleDeleteLesson(lesson.id, lesson.pdf_path)}
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

            {/* Create Class Modal */}
            < Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)}>
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
                            onClick={() => setIsClassModalOpen(false)}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >

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

export default TeacherDashboard;