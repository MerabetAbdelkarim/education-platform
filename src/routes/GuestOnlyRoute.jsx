import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const roleToDashboard = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
};

const GuestOnlyRoute = ({ children }) => {
    const { user, role } = useContext(AuthContext);

    if (user && user?.user_metadata?.email_verified) {
        const redirectPath = roleToDashboard[role] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default GuestOnlyRoute;
