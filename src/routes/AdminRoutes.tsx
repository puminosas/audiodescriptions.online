import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AIChat from '@/components/admin/ai-chat/AIChat';
import Analytics from '@/components/admin/analytics/Analytics';
import Users from '@/components/admin/users/Users';
import AudioFiles from '@/components/admin/audio-files/AudioFiles';
import Purchases from '@/components/admin/purchases/Purchases';
import Documentation from '@/components/admin/documentation/Documentation';
import Feedback from '@/components/admin/feedback/Feedback';
import Settings from '@/components/admin/settings/Settings';
import { useAuth } from '@/context/AuthContext';

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
