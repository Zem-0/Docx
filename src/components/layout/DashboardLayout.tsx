import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Settings, 
  Menu,
  X,
  DollarSign,
  LogOut,
  Search,
  Users
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });
      window.location.href = '/';
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Research Agent', href: '/research-agent', icon: Search, current: location.pathname.startsWith('/research-agent') },
    { name: 'Docx Summarizer', href: '/documents', icon: FileText, current: location.pathname === '/documents' },
    { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname.startsWith('/settings') },
  ];
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center h-20 px-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Docx</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-transform transform hover:scale-105 ${
              item.current
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-6 h-6 ${item.current ? 'text-blue-600' : 'text-gray-400'}`} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 m-4 border-t border-gray-100 pt-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">{user?.user_metadata?.full_name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="lg" className="w-full text-base" onClick={handleSignOut}>
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen(false)}>
                          <span className="sr-only">Close sidebar</span>
                          <X className="h-6 w-6 text-white" />
                      </button>
                  </div>
                  <SidebarContent />
              </div>
              <div className="flex-shrink-0 w-14"></div>
          </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
              <div className="flex flex-col h-0 flex-1 bg-white">
                  <SidebarContent />
              </div>
          </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none py-8 px-4 sm:px-6 lg:px-8">
            <button type="button" className="lg:hidden p-1 mb-4 -ml-1 rounded-md text-gray-700" onClick={() => setSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
            </button>
            {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 