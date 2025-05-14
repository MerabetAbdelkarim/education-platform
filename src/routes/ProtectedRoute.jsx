
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const roleToDashboard = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
};

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, role } = useContext(AuthContext);
    const location = useLocation();
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRole && role !== allowedRole) {
        const correctPath = roleToDashboard[role] || '/';
        return <Navigate to={correctPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
