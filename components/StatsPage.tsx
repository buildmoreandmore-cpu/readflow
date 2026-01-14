
import React from 'react';
import { ReadingSession, AppConfig } from '../types';

interface StatsPageProps {
  sessions: ReadingSession[];
  onBack: () => void;
  config: AppConfig;
}

const StatsPage: React.FC<StatsPageProps> = ({ sessions, onBack, config }) => {
  const isDark = config.theme === 'DARK';

  // Calculate aggregate stats
  const totalWordsRead = sessions.reduce((sum, s) => sum + s.wordsRead, 0);
  const totalTimeSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const avgWPM = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.averageWPM, 0) / sessions.length)
    : 0;

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = new Date(session.startedAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ReadingSession[]>);

  // Get last 7 days of stats for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString();
  });

  const chartData = last7Days.map(date => {
    const daySessions = sessionsByDate[date] || [];
    return {
      date,
      shortDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      words: daySessions.reduce((sum, s) => sum + s.wordsRead, 0),
      avgWPM: daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + s.averageWPM, 0) / daySessions.length)
        : 0,
      sessions: daySessions.length,
    };
  });

  const maxWords = Math.max(...chartData.map(d => d.words), 1);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b] text-[#f5f5f4]' : 'bg-[#faf9f7] text-[#1c1c1c]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-[#0a0a0b]/95' : 'bg-[#faf9f7]/95'} backdrop-blur-md border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Reading Stats</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>Total Words</div>
            <div className="text-3xl font-bold text-amber-500">{totalWordsRead.toLocaleString()}</div>
          </div>
          <div className={`p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>Time Spent</div>
            <div className="text-3xl font-bold text-amber-500">{formatTime(totalTimeSeconds)}</div>
          </div>
          <div className={`p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>Avg Speed</div>
            <div className="text-3xl font-bold text-amber-500">{avgWPM} <span className="text-lg font-normal">WPM</span></div>
          </div>
        </div>

        {/* Chart */}
        <div className={`p-6 rounded-xl mb-8 ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <h2 className="font-semibold mb-6">Last 7 Days</h2>

          {sessions.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <p>No reading sessions yet.</p>
              <p className="text-sm mt-2">Complete a reading session to see your stats here.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {chartData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    {day.words > 0 && (
                      <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-1`}>
                        {day.words.toLocaleString()}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t transition-all ${
                        day.words > 0 ? 'bg-amber-500' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                      }`}
                      style={{
                        height: `${Math.max((day.words / maxWords) * 120, day.words > 0 ? 8 : 4)}px`
                      }}
                    />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {day.shortDate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WPM Trend */}
        {sessions.length > 0 && (
          <div className={`p-6 rounded-xl mb-8 ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <h2 className="font-semibold mb-4">Speed Trend</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className={`h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    style={{ width: `${Math.min((avgWPM / 500) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  <span>0 WPM</span>
                  <span>250 WPM (Average)</span>
                  <span>500+ WPM</span>
                </div>
              </div>
            </div>
            <p className={`text-sm mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {avgWPM < 200 && "You're building a solid foundation. Keep practicing to increase your speed."}
              {avgWPM >= 200 && avgWPM < 300 && "You're reading at an average pace. Push a bit faster to challenge yourself."}
              {avgWPM >= 300 && avgWPM < 400 && "Great speed! You're reading faster than most people."}
              {avgWPM >= 400 && "Excellent! You're in the top tier of readers."}
            </p>
          </div>
        )}

        {/* Recent Sessions */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <h2 className="font-semibold mb-4">Recent Sessions</h2>

          {sessions.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              No sessions recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-100'}`}
                >
                  <div>
                    <div className="font-medium">
                      {session.documentTitle || 'Reading Session'}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {new Date(session.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-500 font-semibold">{session.averageWPM} WPM</div>
                    <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {session.wordsRead.toLocaleString()} words
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Training Tip</div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                For best results, train for 10-15 minutes daily at a slightly challenging speed.
                Consistency beats intensity for building lasting reading skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
