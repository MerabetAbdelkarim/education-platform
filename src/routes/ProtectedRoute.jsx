
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const roleToDashboard = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
};

const ProtectedRoute = ({ children, allowedRole }) => {
    console.log("open ProtectedRoute");
    console.log("allowedRole", allowedRole);
    const { user, role } = useContext(AuthContext);

    const location = useLocation();

    console.log("user", user);
    console.log("role", role);
    console.log("location", location);
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user?.user_metadata?.email_verified) {
        return <Navigate to="/email-confirmation" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        const correctPath = roleToDashboard[role] || '/';
        return <Navigate to={correctPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
