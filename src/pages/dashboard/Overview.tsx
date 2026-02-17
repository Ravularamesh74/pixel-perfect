import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/ui/chart'; // Need to create a chart component or reuse existing if available in Shadcn charts?
// Shadcn 'chart' in file list was big file. Let's assume rechart wrapper.
// Actually, for now, let's keep it simple with stats cards.

import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';

export default function DashboardOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine endpoint based on role or just generic dashboard endpoint
                // Our backend has /dashboard/stats for admin
                // For user, we might want /customers/:id/stats

                let endpoint = '/dashboard/stats';
                if (user?.role === 'user') {
                    endpoint = `/customers/${user.id}/stats`;
                }

                const res = await api.get(endpoint);
                setStats(res.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (user?.role === 'user') {
        const data = stats?.stats || {};
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{data.totalSpent?.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.totalBookings}</div>
                        </CardContent>
                    </Card>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                    {data.recentBookings?.map((booking: any) => (
                        <Card key={booking._id} className="flex items-center justify-between p-4">
                            <div>
                                <h4 className="font-semibold">{booking.carId?.name || "Car"}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.dropoffDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {booking.status}
                                </span>
                                <div className="font-bold mt-1">₹{booking.totalAmount}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Admin/Vendor View
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats?.totalRevenue?.value?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +₹{stats?.totalRevenue?.monthly?.toLocaleString()} this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeBookings?.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingApprovals?.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fleet Availability</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.fleet?.availability}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.fleet?.available} available / {stats?.fleet?.total} total
                        </p>
                    </CardContent>
                </Card>
            </div>
            {/* Add Chart Here Later */}
        </div>
    );
}

// Simple Car icon component since lucide-react export might vary
function CarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    )
}
