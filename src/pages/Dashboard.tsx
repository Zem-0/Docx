import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign,
  Users,
  CreditCard,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard = () => {

  const stats = [
    { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, changeType: 'positive' as const },
    { name: 'Active Users', value: '2,350', change: '+180.1%', icon: Users, changeType: 'positive' as const },
    { name: 'Sales', value: '12,234', change: '+19%', icon: CreditCard, changeType: 'positive' as const },
    { name: 'Pending Orders', value: '573', change: '-2.5%', icon: Activity, changeType: 'negative' as const },
  ];
  
  return (
    <DashboardLayout>
      <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
              <div className={`w-8 h-8 ${stat.changeType === 'positive' ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                <span className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
