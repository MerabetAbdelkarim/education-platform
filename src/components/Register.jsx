import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { Input, Button, VStack, Text } from '@chakra-ui/react'

export default function Register() {
    const [searchParams] = useSearchParams()
    const roleFromURL = searchParams.get('role') || 'student'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [role, setRole] = useState(roleFromURL)

    useEffect(() => {
        setRole(roleFromURL)
    }, [roleFromURL])

    const handleRegister = async () => {
        setError('')
        setSuccess('')

        const { data, error } = await supabase.auth.signUp({ email, password })

        if (error) {
            setError(error.message)
            return
        }

        const user = data.user
        if (user) {
            const { error: insertError } = await supabase.from('users').insert({
                id: user.id,
                full_name: fullName,
                role: role,
            })

            if (insertError) {
                setError('Insert error: ' + insertError.message)
            } else {
                setSuccess('Account created successfully. Check your email.')
            }
        }
    }

    return (
        <VStack spacing={4} p={6}>
            <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button onClick={handleRegister} colorScheme="blue">Register as {role}</Button>
            {error && <Text color="red.500">{error}</Text>}
            {success && <Text color="green.500">{success}</Text>}
        </VStack>
    )
}
