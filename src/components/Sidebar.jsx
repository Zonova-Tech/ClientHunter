import React from 'react';
import { 
  Search, 
  Users, 
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

/**
 * Sidebar Component
 * Navigation between Search and Pipeline views
 */
const Sidebar = ({ activeView, onViewChange, stats }) => {
  const navItems = [
    {
      id: 'search',
      label: 'Find Leads',
      icon: Search,
      description: 'Search for potential clients'
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Users,
      description: 'Manage saved leads',
      badge: stats?.totalLeads || 0
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Client Hunter</h1>
            <p className="text-xs text-slate-500">Lead Generation CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeView === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Stats Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Stats
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm">Hot Leads</span>
              </div>
              <span className="text-white font-semibold">{stats?.hotLeads || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm">Contacted</span>
              </div>
              <span className="text-white font-semibold">{stats?.contacted || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Total Leads</span>
              </div>
              <span className="text-white font-semibold">{stats?.totalLeads || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-center">
          <p className="text-xs text-slate-600">
            Built for Web Agencies 🇱🇰
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
