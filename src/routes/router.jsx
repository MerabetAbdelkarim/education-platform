import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Home/index';
import RoleSelection from '../pages/auth/RoleSelection';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import EmailConfirmation from '../pages/auth/EmailConfirmation';
import StudentDashboard from '../pages/StudentDashboard';
import TeacherDashboard from '../pages/TeacherDashboard';
import GuestOnlyRoute from './GuestOnlyRoute';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/404';

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <GuestOnlyRoute>
                        <Landing />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/role-selection"
                element={
                    <GuestOnlyRoute>
                        <RoleSelection />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/register/:role"
                element={
                    <GuestOnlyRoute>
                        <Register />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <GuestOnlyRoute>
                        <Login />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/email-confirmation"
                element={
                    <GuestOnlyRoute>
                        <EmailConfirmation />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/dashboard/student"
                element={
                    <ProtectedRoute allowedRole="student">
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/teacher"
                element={
                    <ProtectedRoute allowedRole="teacher">
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="*"
                element={
                    <NotFoundPage />
                }
            />
        </Routes>
    );
};

export default AppRoutes;
