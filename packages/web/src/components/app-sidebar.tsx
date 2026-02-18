'use client';

import * as React from 'react';
import { Code2, Sparkles, FileText, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';

const navGroups = [
	{
		label: 'Create',
		items: [{ title: 'Generate', href: '/generate', icon: Sparkles }],
	},
	{
		label: 'Library',
		items: [{ title: 'Prompts', href: '/prompts', icon: FileText }],
	},
	{
		label: 'Settings',
		items: [{ title: 'Profile', href: '/profile', icon: UserCog }],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<Link href="/" className="flex items-center gap-2 overflow-hidden rounded-md hover:bg-sidebar-accent transition-colors">
					<div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
						<Code2 size={20} strokeWidth={2.5} />
					</div>
					<span className="font-bold text-lg tracking-tight text-foreground truncate group-data-[collapsible=icon]:hidden">CodePromptMaker</span>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
										tooltip={item.title}
									>
										<Link href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}
