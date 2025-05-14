import { Route, Routes } from "react-router-dom";
import Landing from "../pages/Landing";
import RoleSelection from "../components/RoleSelection";
import Register from "../components/Register";
import Login from "../components/Login";
import EmailConfirmation from "../components/EmailConfirmation";
import StudentDashboard from "../pages/StudentDashboard";
import TeacherDashboard from "../pages/TeacherDashboard";
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
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
        </Routes>
    );
};

export default AppRoutes;
