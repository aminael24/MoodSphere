import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Background from "./components/Background.jsx";
import Badges from "./pages/Badges.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { ForgotPassword, ResetPassword, VerifyEmail } from "./pages/PasswordPages.jsx";
import Feed from "./pages/Feed.jsx";
import Explore from "./pages/Explore.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Journal from "./pages/Journal.jsx";
import Therapist from "./pages/Therapist.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomView from "./pages/RoomView.jsx";
import AdminOverview from "./pages/Admin.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminPosts from "./pages/AdminPosts.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import Notifications from "./pages/Notifications.jsx";
function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page center"><p className="text-dim">Chargement…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page center"><p className="text-dim">…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/feed" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page center"><p className="text-dim">…</p></div>;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/feed"} replace />;
  return children;
}
function Shell({ children }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Background />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Privé (utilisateur normal) */}
          <Route path="/badges" element={<Private><Shell><Badges /></Shell></Private>} />
          <Route path="/feed" element={<Private><Shell><Feed /></Shell></Private>} />
          <Route path="/explore" element={<Private><Shell><Explore /></Shell></Private>} />
          <Route path="/dashboard" element={<Private><Shell><Dashboard /></Shell></Private>} />
          <Route path="/profile" element={<Private><Shell><Profile /></Shell></Private>} />
          <Route path="/u/:id" element={<Private><Shell><UserProfile /></Shell></Private>} />
          <Route path="/journal" element={<Private><Shell><Journal /></Shell></Private>} />
          <Route path="/therapist" element={<Private><Shell><Therapist /></Shell></Private>} />
          <Route path="/rooms" element={<Private><Shell><Rooms /></Shell></Private>} />
          <Route path="/rooms/:slug" element={<Private><Shell><RoomView /></Shell></Private>} />
<Route path="/notifications" element={<Notifications />} />
          {/* Admin */}
          <Route path="/admin" element={<AdminOnly><Shell><AdminOverview /></Shell></AdminOnly>} />
          <Route path="/admin/users" element={<AdminOnly><Shell><AdminUsers /></Shell></AdminOnly>} />
          <Route path="/admin/posts" element={<AdminOnly><Shell><AdminPosts /></Shell></AdminOnly>} />
          <Route path="/admin/reports" element={<AdminOnly><Shell><AdminReports /></Shell></AdminOnly>} />
<Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}