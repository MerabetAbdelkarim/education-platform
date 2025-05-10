import { useNavigate, useLocation } from 'react-router-dom'
import { Button, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react'

export default function ChooseRole() {
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || '/'

    const handleChoose = (role) => {
        if (location.state?.from) {
            navigate('/login', {
                state: {
                    role,
                    returnTo: from
                }
            })
        } else {
            navigate('/register', { state: { role } })
        }
    }

    return (
        <VStack spacing={6} mt={20} px={4}>
            {location.state?.from && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Please login as {location.state.from.includes('teacher') ? 'teacher' : 'student'} to access this page
                </Alert>
            )}

            <Heading textAlign="center">Who are you?</Heading>

            <Button
                colorScheme="teal"
                size="lg"
                onClick={() => handleChoose('student')}
            >
                I am a Student
            </Button>

            <Button
                colorScheme="blue"
                size="lg"
                onClick={() => handleChoose('teacher')}
            >
                I am a Teacher
            </Button>
        </VStack>
    )
}