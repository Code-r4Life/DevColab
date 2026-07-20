import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Avatar } from '../ui';
import { cn } from '../../assets/utils';
import NotificationBell from '../NotificationBell.jsx';

export const TopBar = ({ breadcrumbs = [] }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    if (event.key !== 'Enter') return;
    const query = search.trim();
    if (!query) return;
    navigate(`/projects?query=${encodeURIComponent(query)}`);
  };

  const normalizedCrumbs = breadcrumbs.map((crumb) => (typeof crumb === 'string' ? { label: crumb } : crumb));

  return (
    <header className="h-14 sticky top-0 z-30 flex items-center justify-between px-6 border-b border-light-border dark:border-dark-border bg-[#f8f8fa] dark:bg-[#070709]">
      <div className="flex items-center gap-3">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs text-zinc-700 dark:text-zinc-400 font-medium">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className="text-zinc-700 dark:text-zinc-400 hover:text-primary transition-colors"
          >
            DevCollab
          </button>
          {normalizedCrumbs.map((crumb, idx) => (
            <Fragment key={`${crumb.label}-${idx}`}>
              <ChevronRight size={14} className="mx-1 text-zinc-500 dark:text-zinc-600" />
              {crumb.to ? (
                <button 
                  type="button" 
                  onClick={() => navigate(crumb.to)} 
                  className="text-zinc-700 dark:text-zinc-400 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={cn(idx === normalizedCrumbs.length - 1 ? "text-black dark:text-white font-semibold" : "text-zinc-700 dark:text-zinc-400 hover:text-primary cursor-pointer transition-colors")}>
                  {crumb.label}
                </span>
              )}
            </Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearch}
            className="bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border text-zinc-950 dark:text-zinc-50 px-9 py-1.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* --- INTEGRATED NOTIFICATION COMPONENT --- */}
          <NotificationBell />

          <button
            type="button"
            onClick={() => navigate('/settings/profile')}
            className="flex items-center gap-2 text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-zinc-900 dark:text-white">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{user?.role}</p>
            </div>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
};