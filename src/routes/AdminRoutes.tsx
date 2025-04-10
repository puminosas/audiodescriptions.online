import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AIChat from '@/components/admin/ai-chat/AIChat';
import { useAuth } from '@/context/AuthContext';

// Import placeholders for routes that might not be fully implemented yet
const Analytics = () => <div className="p-4">Analytics Dashboard Coming Soon</div>;
const Users = () => <div className="p-4">User Management Coming Soon</div>;
const AudioFiles = () => <div className="p-4">Audio Files Management Coming Soon</div>;
const Purchases = () => <div className="p-4">Purchases Dashboard Coming Soon</div>;
const Documentation = () => <div className="p-4">Documentation Coming Soon</div>;
const Feedback = () => <div className="p-4">Feedback Management Coming Soon</div>;
const Settings = () => <div className="p-4">Settings Coming Soon</div>;

const AdminRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/ai-chat" replace />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/users" element={<Users />} />
        <Route path="/audio-files" element={<AudioFiles />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/ai-chat" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
