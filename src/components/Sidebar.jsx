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
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30 group-hover:scale-110 group-hover:shadow-fuchsia-500/50 transition-all duration-500">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 tracking-tighter">
              Client Hunter
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-fuchsia-400/70 hidden sm:block">
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
                ? 'bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-transparent text-fuchsia-200 shadow-[inset_0_0_30px_rgba(232,121,249,0.10)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            {/* Active Indicator */}
            {activeView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 via-fuchsia-500 to-pink-500 shadow-[0_0_15px_rgba(232,121,249,0.6)]" />
            )}

            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeView === item.id ? 'scale-110 text-fuchsia-300' : 'group-hover:scale-110'}`} />

            <span className="flex-1 text-left font-bold tracking-tight text-sm uppercase whitespace-nowrap">
              {item.label}
            </span>

            {item.badge > 0 && (
              <span className={`min-w-[24px] h-6 flex items-center justify-center rounded-lg text-[10px] font-black tracking-tighter ${
                activeView === item.id
                  ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/40'
                  : 'bg-slate-800/80 text-slate-300'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Stats Panel */}
      <div className="p-6 hidden md:block">
        <div className="rounded-3xl p-6 border border-white/10 space-y-5 backdrop-blur-xl"
             style={{ background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.25) 0%, rgba(15, 23, 42, 0.45) 100%)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-violet-300">
            Real-time Metrics
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-300" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Hot Leads</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.hotLeads || 0}</span>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Contacted</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.contacted || 0}</span>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-cyan-300" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Total Pool</span>
              </div>
              <span className="text-sm font-black text-white">{stats?.totalLeads || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-10 opacity-50 hidden md:block">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 text-center">
          Engineered in 🇱🇰
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
