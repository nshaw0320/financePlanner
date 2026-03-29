import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp, DollarSign } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/family',    icon: Users,           label: 'Family' },
  { to: '/income',    icon: TrendingUp,       label: 'Income' },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <DollarSign size={22} className="text-blue-600" />
        <span className="font-semibold text-gray-900 text-base">Family Budget</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
