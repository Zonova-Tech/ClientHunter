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
    <aside className="w-full md:w-72 glass-sidebar flex flex-col md:h-screen md:sticky md:top-0 z-50 border-b border-white/5 md:border-b-0">
      {/* Logo Section */}
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter bg-clip-text">
              Client Hunter
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 hidden sm:block">
              Lead Generation CRM
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="md:flex-1 px-4 pb-4 md:pb-0 flex md:block gap-2 md:space-y-2 overflow-x-auto md:overflow-visible">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full md:w-full min-w-[180px] md:min-w-0 shrink-0 group flex items-center gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
              activeView === item.id
                ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {/* Active Indicator */}
            {activeView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            )}
            
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            
            <span className="flex-1 text-left font-bold tracking-tight text-sm uppercase whitespace-nowrap">
              {item.label}
            </span>

            {item.badge > 0 && (
              <span className={`min-w-[24px] h-6 flex items-center justify-center rounded-lg text-[10px] font-black tracking-tighter ${
                activeView === item.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Stats Panel */}
      <div className="p-6 hidden md:block">
        <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 space-y-5">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Real-time Metrics
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Hot Leads</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.hotLeads || 0}</span>
            </div>
            
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Contacted</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.contacted || 0}</span>
            </div>
            
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Total Pool</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.totalLeads || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-10 opacity-40 hidden md:block">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">
          Engineered in 🇱🇰
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
