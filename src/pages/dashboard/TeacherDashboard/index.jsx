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
    useColorModeValue,
    TableContainer,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from '@chakra-ui/react';
import { MdAdd, MdDeleteOutline } from "react-icons/md";;
import { supabase } from '../../../supabase';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { AdvancedTable } from '../../../components/Table';
import ClassesComponent from './components/Classes';
import ClassDetails from './components/ClassDetails';

const TeacherDashboard = () => {
    const { user, role, loading: authLoading } = useContext(AuthContext);
    const [teacher, setTeacher] = useState(null);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
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
                <Box>
                    <Flex justify="space-between" align="center">
                        <Heading size="lg">Teacher Dashboard</Heading>
                    </Flex>
                    <Text mt={2}>
                        Welcome, {teacher.first_name} {teacher.last_name} ({user.email})
                    </Text>
                </Box>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink>Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbItem>
                        <BreadcrumbLink color={!selectedClass && 'purple.500'} onClick={() => setSelectedClass(null)}>Classes</BreadcrumbLink>
                    </BreadcrumbItem>
                    {selectedClass &&
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink color='purple.500' href='#'>ClassDetails</BreadcrumbLink>
                        </BreadcrumbItem>
                    }
                </Breadcrumb>
                {
                    selectedClass ?
                        <ClassDetails selectedClass={selectedClass} /> :
                        <ClassesComponent classes={classes} teacher={teacher} setClasses={setClasses} setSelectedClass={setSelectedClass} />
                }

            </VStack >
        </Box >
    );
};

export default TeacherDashboard;