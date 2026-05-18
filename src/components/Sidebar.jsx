import React from 'react';
import { Search, GitBranch, Crosshair, Flame, MessageCircle, Users, Zap } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, stats }) => {
  const navItems = [
    { id: 'search', label: 'Find leads', icon: Search },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, badge: stats?.totalLeads || 0 },
  ];

  return (
    <aside
      className="w-full md:w-[260px] flex md:flex-col md:h-screen md:sticky md:top-0 z-50 shrink-0"
      style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
    >
      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-3 shrink-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary)' }}
        >
          <Crosshair className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="hidden sm:block">
          <div className="text-[17px] font-semibold tracking-tight leading-tight">ClientHunter</div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Lead generation</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 mt-2 flex md:block gap-1 md:gap-0 md:space-y-1 flex-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md transition-colors min-w-[160px]"
              style={{
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-elevated)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="flex items-center gap-3 text-[15px]">
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </span>
              {item.badge > 0 && (
                <span
                  className="text-[12px] px-2 py-0.5 rounded font-mono"
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-elevated)',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats — desktop only */}
      <div className="mt-auto mx-4 mb-2 hidden md:block">
        <div className="surface-elevated rounded-lg p-4">
          <div
            className="text-[12px] uppercase tracking-wider mb-3 font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            This week
          </div>
          <div className="space-y-2.5">
            <StatRow icon={<Flame className="w-4 h-4" style={{ color: 'var(--hot)' }} />} label="Hot leads" value={stats?.hotLeads || 0} />
            <StatRow icon={<MessageCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />} label="Contacted" value={stats?.contacted || 0} />
            <StatRow icon={<Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />} label="Total pool" value={stats?.totalLeads || 0} />
          </div>
        </div>
      </div>

      {/* Outreach Console — de-emphasized link, separated from daily flow */}
      <div
        className="hidden md:block px-4 pb-4 pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={() => onViewChange('outreach')}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors"
          style={{
            color: activeView === 'outreach' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeView === 'outreach' ? 500 : 400,
          }}
          onMouseEnter={(e) => {
            if (activeView !== 'outreach') e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'outreach') e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="text-[13px]">Outreach Console</span>
        </button>
      </div>
    </aside>
  );
};

const StatRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
      {icon}
      {label}
    </span>
    <span className="text-[15px] font-semibold font-mono">{value}</span>
  </div>
);

export default Sidebar;
