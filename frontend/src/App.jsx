import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Public pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import MyRegistrations from "./pages/MyRegistrations";
import BookmarkedEvents from "./pages/BookmarkedEvents";

// Organiser pages
import OrganiserDashboard from "./pages/OrganiserDashboard";
import CreateEvent from "./pages/CreateEvent";
import OrganiserRegistrationRequests from "./pages/OrganiserRegistrationRequests";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";

// Not Found
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Common Authenticated Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/registrations"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <MyRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/bookmarks"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <BookmarkedEvents />
            </ProtectedRoute>
          }
        />

        {/* Organiser Routes */}
        <Route
          path="/organiser/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Organiser", "Admin"]}>
              <OrganiserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/create-event"
          element={
            <ProtectedRoute allowedRoles={["Organiser", "Admin"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/event/:eventId/registrations"
          element={
            <ProtectedRoute allowedRoles={["Organiser", "Admin"]}>
              <OrganiserRegistrationRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
