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
    Skeleton,
    SkeletonText,
    VStack,
    HStack,
    IconButton,
} from '@chakra-ui/react';
import { MdDeleteOutline } from 'react-icons/md';
import { supabase } from '../../../supabase';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

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
    const [isTeacherLoading, setIsTeacherLoading] = useState(false);
    const [isClassesLoading, setIsClassesLoading] = useState(false);
    const [isClassDetailsLoading, setIsClassDetailsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
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
            setIsTeacherLoading(true);
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
                setIsTeacherLoading(false);
                return;
            }
            setTeacher(teacherData);
            setIsTeacherLoading(false);
            await fetchClasses(teacherData.id);
        };

        fetchTeacher();
    }, [user, role, authLoading, navigate, toast]);

    const fetchClasses = async (teacherId) => {
        setIsClassesLoading(true);
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
        setIsClassesLoading(false);
    };

    const fetchClassDetails = async (classId) => {
        setIsClassDetailsLoading(true);
        // Fetch students
        const { data: studentData, error: studentError } = await supabase
            .from('class_enrollments')
            .select(`student_id, students(studentId, first_name, last_name, email)`)
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
            setIsClassDetailsLoading(false);
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
        setIsClassDetailsLoading(false);
    };

    const handleCreateClass = async () => {
        setIsActionLoading(true);
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
        setIsActionLoading(false);
    };

    const handleDeleteClass = async (classId) => {
        setIsActionLoading(true);
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
        setIsActionLoading(false);
    };

    const handleEnrollStudent = async () => {
        setIsActionLoading(true);
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
            setIsActionLoading(false);
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
        setIsActionLoading(false);
    };

    const handleAddLesson = async () => {
        setIsActionLoading(true);
        if (!newLesson.pdf_file) {
            toast({
                title: 'Error',
                description: 'Please select a PDF file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsActionLoading(false);
            return;
        }

        // Sanitize the file name to remove non-ASCII characters
        const sanitizeFileName = (name) => {
            // Replace non-ASCII characters with an underscore or remove them
            const sanitized = name
                .normalize('NFKD') // Decompose Unicode characters
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                .replace(/[^\w\s.-]/g, '') // Remove non-alphanumeric characters (except spaces, dots, and hyphens)
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase(); // Convert to lowercase for consistency
            return sanitized;
        };

        // Generate a unique file name
        const originalFileName = newLesson.pdf_file.name;
        const sanitizedFileName = sanitizeFileName(originalFileName);
        console.log("sanitizedFileName",sanitizedFileName)
        const fileExtension = originalFileName.split('.').pop();
        const fileName = `${Date.now()}-${sanitizedFileName}.${fileExtension}`;
        console.log("fileName",fileName)
        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('lessons')
            .upload(fileName, newLesson.pdf_file);

        if (uploadError) {
            console.error('Upload error:', uploadError); // Log detailed error for debugging
            toast({
                title: 'Error',
                description: `Failed to upload PDF: ${uploadError.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setIsActionLoading(false);
            return;
        }

        // Insert the lesson record into the database
        const { error } = await supabase
            .from('lessons')
            .insert({
                class_id: selectedClass.id,
                name: newLesson.name,
                pdf_url: fileName,
            });

        if (error) {
            toast({
                title: 'Error',
                description: error.message,
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
        setIsActionLoading(false);
    };

    const handleDeleteLesson = async (lessonId, pdfPath) => {
        setIsActionLoading(true);
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
            setIsActionLoading(false);
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
        setIsActionLoading(false);
    };

    if (authLoading) {
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
                    <Skeleton isLoaded={!isTeacherLoading} minHeight="40px">
                        <Flex justify="space-between" align="center">
                            <Heading size="lg">Teacher Dashboard</Heading>
                        </Flex>
                    </Skeleton>
                    <SkeletonText isLoaded={!isTeacherLoading} mt={2} noOfLines={2} spacing="4">
                        {teacher && (
                            <Text mt={2}>
                                Welcome, {teacher.first_name} {teacher.last_name} ({user.email})
                            </Text>
                        )}
                    </SkeletonText>
                </Box>

                {/* Classes Section */}
                <Box>
                    <Skeleton isLoaded={!isClassesLoading} minHeight="40px">
                        <Flex justify="space-between" align="center" mb={4}>
                            <Heading size="md">Your Classes</Heading>
                            <Button
                                colorScheme="blue"
                                onClick={() => setIsClassModalOpen(true)}
                                isDisabled={isActionLoading}
                            >
                                Create Class
                            </Button>
                        </Flex>
                    </Skeleton>
                    <Skeleton isLoaded={!isClassesLoading} minHeight="200px">
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
                                                    isDisabled={isActionLoading}
                                                >
                                                    {cls.name}
                                                </Button>
                                            </Td>
                                            <Td>{cls.description}</Td>
                                            <Td>
                                                <IconButton
                                                    icon={<MdDeleteOutline />}
                                                    colorScheme="red"
                                                    size="sm"
                                                    onClick={() => handleDeleteClass(cls.id)}
                                                    isDisabled={isActionLoading}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </Skeleton>
                </Box>

                {/* Class Details Section */}
                {selectedClass && (
                    <Box>
                        <Skeleton isLoaded={!isClassDetailsLoading} minHeight="40px">
                            <Heading size="md" mb={4}>
                                {selectedClass.name} Details
                            </Heading>
                        </Skeleton>
                        <VStack spacing={6} align="stretch">
                            {/* Students */}
                            <Box>
                                <Skeleton isLoaded={!isClassDetailsLoading} minHeight="40px">
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <Heading size="sm">Enrolled Students</Heading>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => setIsStudentModalOpen(true)}
                                            isDisabled={isActionLoading}
                                        >
                                            Enroll Student
                                        </Button>
                                    </Flex>
                                </Skeleton>
                                <Skeleton isLoaded={!isClassDetailsLoading} minHeight="200px">
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
                                </Skeleton>
                            </Box>

                            {/* Lessons */}
                            <Box>
                                <Skeleton isLoaded={!isClassDetailsLoading} minHeight="40px">
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <Heading size="sm">Lessons</Heading>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => setIsLessonModalOpen(true)}
                                            isDisabled={isActionLoading}
                                        >
                                            Add Lesson
                                        </Button>
                                    </Flex>
                                </Skeleton>
                                <Skeleton isLoaded={!isClassDetailsLoading} minHeight="200px">
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
                                                                isDisabled={isActionLoading}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </Skeleton>
                            </Box>
                        </VStack>
                    </Box>
                )}
            </VStack>

            {/* Create Class Modal */}
            <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)}>
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
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
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
                            isLoading={isActionLoading}
                        >
                            Create
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsClassModalOpen(false)}
                            isDisabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)}>
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
                            isLoading={isActionLoading}
                        >
                            Enroll
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsStudentModalOpen(false)}
                            isDisabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)}>
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
                                    onChange={(e) => setNewLesson({ ...newLesson, name: e.target.value })}
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
                            isLoading={isActionLoading}
                        >
                            Add
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsLessonModalOpen(false)}
                            isDisabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TeacherDashboard;