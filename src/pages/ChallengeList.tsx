import { useState, useMemo } from 'react';
import { challenges, difficultyColors, categoryColors, type Difficulty, type Category, type Challenge } from '../data/challenges';

interface ChallengeListProps {
  solvedIds: Set<string>;
  onSelect: (id: string) => void;
  onBack: () => void;
  totalXp: number;
}

export function ChallengeList({ solvedIds, onSelect, onBack, totalXp }: ChallengeListProps) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'All'>('All');
  const [catFilter, setCatFilter] = useState<Category | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      if (diffFilter !== 'All' && c.difficulty !== diffFilter) return false;
      if (catFilter !== 'All' && c.category !== catFilter) return false;
      if (statusFilter === 'Solved' && !solvedIds.has(c.id)) return false;
      if (statusFilter === 'Unsolved' && solvedIds.has(c.id)) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [diffFilter, catFilter, statusFilter, search, solvedIds]);

  const solvedCount = challenges.filter(c => solvedIds.has(c.id)).length;
  const easySolved = challenges.filter(c => c.difficulty === 'Easy' && solvedIds.has(c.id)).length;
  const medSolved = challenges.filter(c => c.difficulty === 'Medium' && solvedIds.has(c.id)).length;
  const hardSolved = challenges.filter(c => c.difficulty === 'Hard' && solvedIds.has(c.id)).length;
  const easyTotal = challenges.filter(c => c.difficulty === 'Easy').length;
  const medTotal = challenges.filter(c => c.difficulty === 'Medium').length;
  const hardTotal = challenges.filter(c => c.difficulty === 'Hard').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={onBack} className="text-surface-400 hover:text-surface-200 mb-6 flex items-center gap-2 text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-surface-50 mb-3">ROS2Code</h1>
        <p className="text-surface-400 text-lg">Practice what you have learned. Write real ROS2 Python code, run it in the browser, and watch the robot respond.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-surface-50">{solvedCount}/{challenges.length}</p>
          <p className="text-xs text-surface-500">Solved</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success-500">{easySolved}/{easyTotal}</p>
          <p className="text-xs text-surface-500">Easy</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent-500">{medSolved}/{medTotal}</p>
          <p className="text-xs text-surface-500">Medium</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-error-500">{hardSolved}/{hardTotal}</p>
          <p className="text-xs text-surface-500">Hard</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search challenges..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-600 focus:outline-none focus:border-primary-500/50 w-64 transition-colors"
        />
        <select
          value={diffFilter}
          onChange={e => setDiffFilter(e.target.value as Difficulty | 'All')}
          className="bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-300 focus:outline-none focus:border-primary-500/50"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as Category | 'All')}
          className="bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-300 focus:outline-none focus:border-primary-500/50"
        >
          <option value="All">All Categories</option>
          <option value="Nodes">Nodes</option>
          <option value="Topics">Topics</option>
          <option value="Services">Services</option>
          <option value="Actions">Actions</option>
          <option value="Parameters">Parameters</option>
          <option value="Navigation">Navigation</option>
          <option value="Integration">Integration</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'All' | 'Solved' | 'Unsolved')}
          className="bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-300 focus:outline-none focus:border-primary-500/50"
        >
          <option value="All">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>
      </div>

      {/* Challenge Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 w-10">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 w-24">Difficulty</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 w-28">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 w-16">XP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ch => {
              const solved = solvedIds.has(ch.id);
              return (
                <tr
                  key={ch.id}
                  onClick={() => onSelect(ch.id)}
                  className="border-b border-surface-800/50 hover:bg-surface-800/30 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    {solved ? (
                      <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-surface-700" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-200 group-hover:text-primary-400 transition-colors">{ch.order}. {ch.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[ch.difficulty]}`}>
                      {ch.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[ch.category]}`}>
                      {ch.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-surface-400">+{ch.xp}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-surface-500 text-sm">No challenges match your filters.</div>
        )}
      </div>
    </div>
  );
}
