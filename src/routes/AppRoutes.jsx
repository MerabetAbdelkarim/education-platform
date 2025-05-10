import { Routes, Route } from 'react-router-dom'
import Teacher from '../pages/Teacher'
import Student from '../pages/Student'
import ProtectedRoute from './ProtectedRoute'
import ChooseRole from '../components/ChooseRole'
import Login from '../components/Login'
import Register from '../components/Register'
import NotFoundPage from '../pages/404'


const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<ChooseRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
            path="/teacher"
            element={
                <ProtectedRoute allowedRole="teacher">
                    <Teacher />
                </ProtectedRoute>
            }
        />

        <Route
            path="/student"
            element={
                <ProtectedRoute allowedRole="student">
                    <Student />
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
)

export default AppRoutes