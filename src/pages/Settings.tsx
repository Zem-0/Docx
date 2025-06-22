import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Shield, Key, Camera } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Settings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingName(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });
        if (error) {
            toast({ title: 'Error updating name', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Your name has been updated.' });
        }
        setIsUpdatingName(false);
    };
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
            return;
        }
        if (!password) {
            toast({ title: 'Error', description: 'Password cannot be empty.', variant: 'destructive' });
            return;
        }
        setIsUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            toast({ title: 'Error updating password', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Your password has been updated.' });
            setPassword('');
            setConfirmPassword('');
        }
        setIsUpdatingPassword(false);
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-lg text-gray-600 mt-2">Manage your account and preferences.</p>
            </div>

            <div className="flex space-x-4 border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>This is how others will see you on the site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold">{user?.user_metadata?.full_name}</p>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <form onSubmit={handleNameUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isUpdatingName}>
                                    {isUpdatingName ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'security' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const SettingsPageContainer = () => {
  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
};

export default SettingsPageContainer; 