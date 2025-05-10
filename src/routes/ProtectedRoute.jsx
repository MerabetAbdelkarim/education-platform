import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { Spinner, Center } from '@chakra-ui/react'

const ProtectedRoute = ({ children, allowedRole }) => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const location = useLocation()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error
                if (session) {
                    // Get fresh user data with role information
                    const { data: { user } } = await supabase.auth.getUser()
                    setUser(user)
                }
            } catch (err) {
                console.error('Auth error:', err)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null)
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        )
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    // Check if user has the required role
    if (allowedRole && user.user_metadata?.role !== allowedRole) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute