import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  CreditCard,
  X,
  Database,
  BarChart2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMediaQuery } from '@/hooks/use-media-query';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  
  // Use the useMediaQuery hook with a default value to prevent errors
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile, mobileSidebarOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile, mobileSidebarOpen]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return path !== '/admin' && location.pathname.startsWith(path);
  };
  
  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      {/* Mobile menu button - improved positioning and visibility */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="shadow-md hover:shadow-lg bg-background/80 backdrop-blur-sm"
          aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar - improved mobile behavior */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[85%] max-w-[280px] bg-card/95 backdrop-blur-md border-r 
        flex flex-col h-full shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:relative md:w-64
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold gradient-text">Audio Descriptions</h2>
            <p className="text-sm text-muted-foreground">Administration Portal</p>
          </div>
          {/* Close button visible only on mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden"
              aria-label="Close menu"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col h-full overflow-hidden">
          <div className="space-y-1 flex-1 overflow-auto py-4 px-3">
            <Link to="/admin/ai-chat" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/ai-chat") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>AI Chat</span>
              </Button>
            </Link>
            <Link to="/admin/analytics" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/analytics") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Live Analytics</span>
              </Button>
            </Link>
            <Link to="/admin/users" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/users") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </Button>
            </Link>
            <Link to="/admin/audio-files" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/audio-files") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Audio Files</span>
              </Button>
            </Link>
            <Link to="/admin/purchases" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/purchases") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Purchases</span>
              </Button>
            </Link>
            <Link to="/admin/documentation" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/documentation") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <Database className="mr-2 h-4 w-4" />
                <span>Data</span>
              </Button>
            </Link>
            <Link to="/admin/feedback" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/feedback") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Feedback</span>
              </Button>
            </Link>
            <Link to="/admin/settings" onClick={() => isMobile && setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/settings") ? "secondary" : "ghost"} 
                className="w-full justify-start mb-2"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
          
          <div className="mt-auto p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Overlay to close sidebar on mobile - improved with animation */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main content - improved padding on mobile */}
      <div className="flex-1 overflow-hidden w-full h-full">
        <main className="h-full overflow-auto pt-16 pb-4 px-4 md:pt-6 md:p-6 bg-background/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
