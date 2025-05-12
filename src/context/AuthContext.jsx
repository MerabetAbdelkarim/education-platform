import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: teacher } = await supabase
                    .from('education_app.teachers')
                    .select('teacher_id')
                    .eq('user_id', session.user.id)
                    .single();
                if (teacher) {
                    setRole('teacher');
                } else {
                    const { data: student } = await supabase
                        .from('education_app.students')
                        .select('student_pk')
                        .eq('user_id', session.user.id)
                        .single();
                    if (student) setRole('student');
                }
            }
            setLoading(false);
        };

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') {
                getSession();
            } else if (event === 'SIGNED_OUT') {
                setRole(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};