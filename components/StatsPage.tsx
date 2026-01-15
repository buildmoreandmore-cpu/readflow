
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold">Reading Stats</h1>
          <div className="w-12 sm:w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className={`p-3 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-[10px] sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-0.5 sm:mb-1`}>Total Words</div>
            <div className="text-lg sm:text-3xl font-bold text-amber-500">{totalWordsRead.toLocaleString()}</div>
          </div>
          <div className={`p-3 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-[10px] sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-0.5 sm:mb-1`}>Time Spent</div>
            <div className="text-lg sm:text-3xl font-bold text-amber-500">{formatTime(totalTimeSeconds)}</div>
          </div>
          <div className={`p-3 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className={`text-[10px] sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-0.5 sm:mb-1`}>Avg Speed</div>
            <div className="text-lg sm:text-3xl font-bold text-amber-500">{avgWPM} <span className="text-xs sm:text-lg font-normal">WPM</span></div>
          </div>
        </div>

        {/* Chart */}
        <div className={`p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <h2 className="font-semibold mb-4 sm:mb-6 text-sm sm:text-base">Last 7 Days</h2>

          {sessions.length === 0 ? (
            <div className={`text-center py-8 sm:py-12 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <p className="text-sm sm:text-base">No reading sessions yet.</p>
              <p className="text-xs sm:text-sm mt-2">Complete a reading session to see your stats here.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-40">
              {chartData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                  <div className="w-full flex flex-col items-center">
                    {day.words > 0 && (
                      <span className={`text-[8px] sm:text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-0.5 sm:mb-1`}>
                        {day.words >= 1000 ? `${(day.words/1000).toFixed(1)}k` : day.words}
                      </span>
                    )}
                    <div
                      className={`w-full max-w-[32px] sm:max-w-full rounded-t transition-all ${
                        day.words > 0 ? 'bg-amber-500' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                      }`}
                      style={{
                        height: `${Math.max((day.words / maxWords) * 100, day.words > 0 ? 8 : 4)}px`
                      }}
                    />
                  </div>
                  <span className={`text-[9px] sm:text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {day.shortDate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WPM Trend */}
        {sessions.length > 0 && (
          <div className={`p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Speed Trend</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className={`h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    style={{ width: `${Math.min((avgWPM / 500) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[9px] sm:text-xs text-zinc-500">
                  <span>0</span>
                  <span className="hidden sm:inline">250 WPM (Average)</span>
                  <span className="sm:hidden">250</span>
                  <span className="hidden sm:inline">500+ WPM</span>
                  <span className="sm:hidden">500+</span>
                </div>
              </div>
            </div>
            <p className={`text-xs sm:text-sm mt-3 sm:mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {avgWPM < 200 && "You're building a solid foundation. Keep practicing to increase your speed."}
              {avgWPM >= 200 && avgWPM < 300 && "You're reading at an average pace. Push a bit faster to challenge yourself."}
              {avgWPM >= 300 && avgWPM < 400 && "Great speed! You're reading faster than most people."}
              {avgWPM >= 400 && "Excellent! You're in the top tier of readers."}
            </p>
          </div>
        )}

        {/* Recent Sessions */}
        <div className={`p-4 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Recent Sessions</h2>

          {sessions.length === 0 ? (
            <p className={`text-center py-6 sm:py-8 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              No sessions recorded yet.
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-100'}`}
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {session.documentTitle || 'Reading Session'}
                    </div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {new Date(session.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-amber-500 font-semibold text-sm sm:text-base">{session.averageWPM} <span className="text-xs">WPM</span></div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {session.wordsRead >= 1000 ? `${(session.wordsRead/1000).toFixed(1)}k` : session.wordsRead} words
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className={`font-medium text-sm sm:text-base ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Training Tip</div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
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
