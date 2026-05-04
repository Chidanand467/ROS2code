import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';

const USER_ID_KEY = 'ros2learn_user_id';

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export interface UserProgress {
  lesson_id: string;
  completed: boolean;
  quiz_score: number | null;
  xp_earned: number;
}

export function useProgress() {
  const [userId] = useState(getOrCreateUserId);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (data) {
      const map: Record<string, UserProgress> = {};
      let xp = 0;
      for (const row of data) {
        map[row.lesson_id] = {
          lesson_id: row.lesson_id,
          completed: row.completed,
          quiz_score: row.quiz_score,
          xp_earned: row.xp_earned,
        };
        xp += row.xp_earned || 0;
      }
      setProgress(map);
      setTotalXp(xp);
    }

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileData) {
      setStreak(profileData.streak || 0);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const markLessonComplete = useCallback(async (lessonId: string, xp: number, quizScore: number | null = null) => {
    const existing = progress[lessonId];
    if (existing?.completed) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        quiz_score: quizScore,
        xp_earned: xp,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' });

    if (!error) {
      setProgress(prev => ({
        ...prev,
        [lessonId]: { lesson_id: lessonId, completed: true, quiz_score: quizScore, xp_earned: xp },
      }));
      setTotalXp(prev => prev + xp);
    }
  }, [userId, progress]);

  const isLessonComplete = useCallback((lessonId: string) => {
    return progress[lessonId]?.completed || false;
  }, [progress]);

  const getModuleProgress = useCallback((lessonIds: string[]) => {
    if (lessonIds.length === 0) return 0;
    const completed = lessonIds.filter(id => progress[id]?.completed).length;
    return Math.round((completed / lessonIds.length) * 100);
  }, [progress]);

  return {
    userId,
    progress,
    totalXp,
    streak,
    loading,
    markLessonComplete,
    isLessonComplete,
    getModuleProgress,
    refreshProgress: loadProgress,
  };
}
