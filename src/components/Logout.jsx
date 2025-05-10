import { Button, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Logout() {
    const [message, setMessage] = useState('')

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('Logged out successfully!')
        }
    }

    return (
        <VStack spacing={4} p={6}>
            <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
            {message && <Text>{message}</Text>}
        </VStack>
    )
}
