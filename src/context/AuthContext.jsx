import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const getSession = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('Error getting session:', sessionError);
                setLoading(false);
                return;
            }

            if (session) {
                setUser(session.user);
                try {
                    // Check if user is a teacher
                    const { data: teacher, error: teacherError } = await supabase
                        .from('teachers')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .single();
                    if (teacherError && teacherError.code !== 'PGRST116') {
                        console.error('Error checking teacher:', teacherError);
                    }
                    if (teacher) {
                        setRole('teacher');
                        setLoading(false);
                        return;
                    }

                    // Check if user is a student
                    const { data: student, error: studentError } = await supabase
                        .from('students')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .single();
                    if (studentError && studentError.code !== 'PGRST116') {
                        console.error('Error checking student:', studentError);
                    }
                    if (student) {
                        setRole('student');
                    }
                } catch (error) {
                    console.error('Error fetching role:', error);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error in getSession:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') {
                getSession();
            } else if (event === 'SIGNED_OUT') {
                setRole(null);
                setLoading(false);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setRole(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, role, setRole, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;