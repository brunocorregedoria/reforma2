import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  FolderOpen, 
  ClipboardList, 
  Package, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Home,
      roles: []
    },
    {
      name: 'Projetos',
      path: '/projects',
      icon: FolderOpen,
      roles: []
    },
    {
      name: 'Ordens de Serviço',
      path: '/work-orders',
      icon: ClipboardList,
      roles: []
    },
    {
      name: 'Materiais',
      path: '/materials',
      icon: Package,
      roles: ['admin', 'gestor', 'tecnico']
    },
    {
      name: 'Fornecedores',
      path: '/vendors',
      icon: Users,
      roles: ['admin', 'gestor']
    },
    {
      name: 'Relatórios',
      path: '/reports',
      icon: BarChart3,
      roles: ['admin', 'gestor']
    },
    {
      name: 'Configurações',
      path: '/settings',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

