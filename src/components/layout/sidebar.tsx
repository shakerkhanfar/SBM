import { NavLink } from 'react-router';
import { Home, Mic, MessageSquare, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/voice-agent', icon: Mic, label: 'Voice Agent' },
  { to: '/chatbot', icon: MessageSquare, label: 'Chatbot' },
  { to: '/call-history', icon: Phone, label: 'Call History' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar-background transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <span className="text-lg font-bold">SBM Demo</span>}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
