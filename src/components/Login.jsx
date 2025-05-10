import { useState } from 'react'
import { supabase } from '../supabase/client'
import { Input, Button, VStack, Text } from '@chakra-ui/react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleLogin = async () => {
        setError('')
        setSuccess('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
        } else {
            setSuccess('Logged in successfully!')
        }
    }

    return (
        <VStack spacing={4} p={6}>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button onClick={handleLogin} colorScheme="green">Login</Button>
            {error && <Text color="red.500">{error}</Text>}
            {success && <Text color="green.500">{success}</Text>}
        </VStack>
    )
}
