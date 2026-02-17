import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    CalendarDays,
    Users,
    MapPin,
    Settings,
    LogOut,
    CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Define navigation items based on role
    const getNavItems = () => {
        const items = [
            {
                title: 'Overview',
                url: '/dashboard',
                icon: LayoutDashboard,
                roles: ['admin', 'vendor', 'user'],
            },
            {
                title: 'Bookings',
                url: '/dashboard/bookings',
                icon: CalendarDays,
                roles: ['admin', 'vendor', 'user'],
            },
            {
                title: 'Fleet',
                url: '/dashboard/fleet',
                icon: Car,
                roles: ['admin', 'vendor'],
            },
            {
                title: 'Tracking',
                url: '/dashboard/tracking',
                icon: MapPin,
                roles: ['admin', 'vendor', 'user'], // Users see their active ride
            },
            {
                title: 'Customers',
                url: '/dashboard/customers',
                icon: Users,
                roles: ['admin'],
            },
            {
                title: 'Payments',
                url: '/dashboard/payments',
                icon: CreditCard,
                roles: ['admin', 'vendor'],
            },
            {
                title: 'Settings',
                url: '/dashboard/settings',
                icon: Settings,
                roles: ['admin', 'vendor', 'user'],
            },
        ];

        return items.filter(item => item.roles.includes(user?.role || ''));
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Car className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Mallikarjuna</span>
                            <span className="text-xs text-muted-foreground">Travels</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {getNavItems().map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={location.pathname === item.url}
                                    tooltip={item.title}
                                >
                                    <Link to={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name?.slice(0, 2)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                                <AvatarFallback className="rounded-lg">
                                                    {user?.name?.slice(0, 2)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{user?.name}</span>
                                                <span className="truncate text-xs">{user?.email}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
