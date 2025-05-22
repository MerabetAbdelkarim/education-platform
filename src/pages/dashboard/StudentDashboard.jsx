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
    useToast,
    Spinner,
    VStack,
    Skeleton,
    SkeletonText,
} from '@chakra-ui/react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const StudentDashboard = () => {
    const { user, role, loading: authLoading } = useContext(AuthContext);
    const [student, setStudent] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [isStudentLoading, setIsStudentLoading] = useState(false);
    const [isClassesLoading, setIsClassesLoading] = useState(false);
    const [isLessonsLoading, setIsLessonsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    // Fetch student data
    useEffect(() => {
        if (authLoading) return;

        if (!user || role !== 'student') {
            navigate('/login');
            return;
        }

        const fetchStudent = async () => {
            setIsStudentLoading(true);
            const { data: studentData, error } = await supabase
                .from('students')
                .select('id, studentId, first_name, last_name')
                .eq('user_id', user.id)
                .single();

            if (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load student profile',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setIsStudentLoading(false);
                return;
            }
            setStudent(studentData);
            setIsStudentLoading(false);
            await fetchClasses(studentData.id);
        };

        fetchStudent();
    }, [user, role, authLoading, navigate, toast]);

    const fetchClasses = async (studentId) => {
        setIsClassesLoading(true);
        const { data, error } = await supabase
            .from('class_enrollments')
            .select(`
        class_id,
        classes(id, name, description, teacher_id, teachers(first_name, last_name))
      `)
            .eq('student_id', studentId)
            .order('class_id');

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to load classes',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } else {
            setClasses(
                data.map((enrollment) => ({
                    ...enrollment.classes,
                    teacher_name: `${enrollment.classes.teachers.first_name} ${enrollment.classes.teachers.last_name}`,
                }))
            );
        }
        setIsClassesLoading(false);
    };

    const fetchLessons = async (classId) => {
        setIsLessonsLoading(true);
        const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('id, name, pdf_url, created_at')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (lessonError) {
            toast({
                title: 'Error',
                description: 'Failed to load lessons',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsLessonsLoading(false);
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

        setLessons(lessonsWithUrls);
        setIsLessonsLoading(false);
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
                {/* Student Profile */}
                <Box>
                    <Skeleton isLoaded={!isStudentLoading} minHeight="40px">
                        <Flex justify="space-between" align="center">
                            <Heading size="lg">Student Dashboard</Heading>
                        </Flex>
                    </Skeleton>
                    <SkeletonText isLoaded={!isStudentLoading} mt={2} noOfLines={2} spacing="4">
                        {student && (
                            <>
                                <Text mt={2}>
                                    Welcome, {student.first_name} {student.last_name} ({user.email})
                                </Text>
                                <Text mt={1}>Student ID: {student.studentId}</Text>
                            </>
                        )}
                    </SkeletonText>
                </Box>

                {/* Enrolled Classes */}
                <Box>
                    <Skeleton isLoaded={!isClassesLoading} minHeight="40px">
                        <Heading size="md" mb={4}>
                            Your Classes
                        </Heading>
                    </Skeleton>
                    <Skeleton isLoaded={!isClassesLoading} minHeight="200px">
                        {classes.length === 0 ? (
                            <Text>You are not enrolled in any classes.</Text>
                        ) : (
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Description</Th>
                                        <Th>Teacher</Th>
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
                                                        fetchLessons(cls.id);
                                                    }}
                                                >
                                                    {cls.name}
                                                </Button>
                                            </Td>
                                            <Td>{cls.description}</Td>
                                            <Td>{cls.teacher_name}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </Skeleton>
                </Box>

                {/* Lessons for Selected Class */}
                {selectedClass && (
                    <Box>
                        <Skeleton isLoaded={!isLessonsLoading} minHeight="40px">
                            <Heading size="md" mb={4}>
                                Lessons for {selectedClass.name}
                            </Heading>
                        </Skeleton>
                        <Skeleton isLoaded={!isLessonsLoading} minHeight="200px">
                            {lessons.length === 0 ? (
                                <Text>No lessons available for this class.</Text>
                            ) : (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>PDF</Th>
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
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            )}
                        </Skeleton>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default StudentDashboard;
