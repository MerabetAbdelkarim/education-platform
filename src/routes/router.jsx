import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Home/index';
import RoleSelection from '../pages/auth/RoleSelection';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import EmailConfirmation from '../pages/auth/EmailConfirmation';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard/indexTwo';
import GuestOnlyRoute from './GuestOnlyRoute';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/404';
import Layout from '../Layout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <GuestOnlyRoute>
                        <Layout>
                            <Landing />
                        </Layout>
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/role-selection"
                element={
                    <GuestOnlyRoute>
                        <Layout>
                            <RoleSelection />
                        </Layout>
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/register/:role"
                element={
                    <GuestOnlyRoute>
                        <Layout>
                            <Register />
                        </Layout>
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <GuestOnlyRoute>
                        <Layout>
                            <Login />
                        </Layout>
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/email-confirmation"
                element={
                    <GuestOnlyRoute>
                        <Layout>
                            <EmailConfirmation />
                        </Layout>
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="/dashboard/student"
                element={
                    <ProtectedRoute allowedRole="student">
                        <Layout>
                            <StudentDashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/teacher"
                element={
                    <ProtectedRoute allowedRole="teacher">
                        <Layout>
                            <TeacherDashboard />
                        </Layout>
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
