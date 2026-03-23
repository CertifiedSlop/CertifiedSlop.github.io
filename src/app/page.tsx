'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONFIG, type Achievement, type Sentiment } from '@/lib/config';
import { debounce, formatNumber, getRelativeTime, getFullDate, isWithinDays, copyToClipboard, getMoodClass, getSentimentColor } from '@/lib/utils';

// Types
interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  license: { name: string; key: string } | null;
  updated_at: string;
  created_at: string;
}

interface Toast {
  id: number;
  message: string;
}

interface Notification {
  id: number | string;
  icon: string;
  title: string;
  desc: string;
}

// Sentiment analyzer
function analyzeSentiment(repo: Repo): Sentiment {
  const nameFactor = repo.name.length % CONFIG.SENTIMENTS.length;
  const starFactor = (repo.stargazers_count || 0) % 3;
  const combined = (nameFactor + starFactor) % CONFIG.SENTIMENTS.length;
  return CONFIG.SENTIMENTS[combined] as Sentiment;
}

// Slop score calculator
function calculateSlopScore(repo: Repo): number {
  const nameSlop = repo.name.includes('AI') ? 20 : 0;
  const descriptionSlop = repo.description ? Math.min(repo.description.length / 10, 20) : 10;
  const starSlop = Math.max(0, 30 - (repo.stargazers_count / 10));
  const topicSlop = Math.min((repo.topics?.length || 0) * 5, 20);
  const randomSlop = Math.random() * 10;
  const aiBonus = (repo.name.match(/AI/gi)?.length || 0) * 5;
  return Math.min(100, Math.round(nameSlop + descriptionSlop + starSlop + topicSlop + randomSlop + aiBonus));
}

function getSlopRating(score: number) {
  if (score >= 90) return { label: 'Maximum Slop', emoji: '🏆' };
  if (score >= 70) return { label: 'Premium Slop', emoji: '✨' };
  if (score >= 50) return { label: 'Certified Slop', emoji: '✅' };
  if (score >= 30) return { label: 'Questionable Slop', emoji: '🤔' };
  return { label: 'Not Enough Slop', emoji: '😢' };
}

// Achievement system
function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUnlock, setPendingUnlock] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('slop_achievements');
    if (stored) setUnlocked(JSON.parse(stored));
  }, []);

  const unlock = useCallback((achievementId: string) => {
    if (typeof window === 'undefined') return;
    setUnlocked(prev => {
      if (!prev.includes(achievementId)) {
        const newUnlocked = [...prev, achievementId];
        localStorage.setItem('slop_achievements', JSON.stringify(newUnlocked));
        return newUnlocked;
      }
      return prev;
    });
    setPendingUnlock(achievementId);
  }, []);

  // Handle notifications separately to avoid nested state updates
  useEffect(() => {
    if (!pendingUnlock) return;
    const achievement = CONFIG.ACHIEVEMENTS[pendingUnlock as keyof typeof CONFIG.ACHIEVEMENTS];
    if (achievement) {
      const notification = { id: Date.now(), ...achievement };
      setNotifications(prev => [...prev, notification]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 4000);
    }
    setPendingUnlock(null);
  }, [pendingUnlock]);

  const progress = Math.round((unlocked.length / Object.keys(CONFIG.ACHIEVEMENTS).length) * 100);

  return { unlocked, notifications, unlock, progress };
}

// Theme manager
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'darker' | 'darkest'>('dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('slop_theme') as 'dark' | 'darker' | 'darkest' | null;
    if (stored) setTheme(stored);
  }, []);

  const cycle = useCallback(() => {
    if (typeof window === 'undefined') return;
    setTheme(prev => {
      const themes: ('dark' | 'darker' | 'darkest')[] = ['dark', 'darker', 'darkest'];
      const next = themes[(themes.indexOf(prev) + 1) % themes.length];
      localStorage.setItem('slop_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, cycle };
}

// Konami code detector
function useKonamiCode(onActivate: () => void) {
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setSequence(prev => {
        const newSeq = [...prev, key].slice(-CONFIG.KONAMI_CODE.length);
        if (newSeq.join(',') === CONFIG.KONAMI_CODE.join(',')) {
          onActivate();
          return [];
        }
        return newSeq;
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);
}

// Scroll tracker
function useScrollTracker(onProgress: (progress: number) => void) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      onProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onProgress]);
}

// Particle system
function useParticleSystem() {
  const canvasRef = { current: null as HTMLCanvasElement | null };

  const init = useCallback((canvasId: string) => {
    if (typeof window === 'undefined') return;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 600;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      color: `rgba(${168 + Math.random() * 50}, ${85 + Math.random() * 50}, ${247 + Math.random() * 50}, ${0.3 + Math.random() * 0.3})`
    }));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return { init };
}

// Mouse trail
function useMouseTrail() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.id = 'mouse-trail-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];

    document.addEventListener('mousemove', (e) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          size: Math.random() * 4 + 2
        });
      }
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          particles.splice(i, 1);
        }
      }
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      canvas.remove();
    };
  }, []);
}

// Main App Component
export default function Home() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSlopScores, setShowSlopScores] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hoverCount, setHoverCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [discoMode, setDiscoMode] = useState(false);

  const { unlocked, notifications, unlock, progress: achievementProgress } = useAchievements();
  const { theme, cycle: cycleTheme } = useTheme();
  const particleSystem = useParticleSystem();
  useMouseTrail();

  // Show loading state on server and initial client render
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-purple-400 animate-pulse">Loading slop...</div>
      </div>
    );
  }

  // Typing effect
  useEffect(() => {
    let index = 0;
    let currentTagline = 0;
    let isTyping = true;
    const taglines = CONFIG.TAGLINES;

    function type() {
      if (isTyping) {
        if (index < taglines[currentTagline].length) {
          setTypedText(taglines[currentTagline].slice(0, index + 1));
          index++;
          setTimeout(type, 50 + Math.random() * 50);
        } else {
          isTyping = false;
          setTimeout(type, 2000);
        }
      } else {
        if (index > 0) {
          setTypedText(taglines[currentTagline].slice(0, index - 1));
          index--;
          setTimeout(type, 30);
        } else {
          isTyping = true;
          currentTagline = (currentTagline + 1) % taglines.length;
          setTimeout(type, 500);
        }
      }
    }
    type();
  }, []);

  // Loading message rotation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % CONFIG.LOADING_MESSAGES.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Konami code
  useKonamiCode(() => {
    unlock('konami_master');
    setDiscoMode(true);
    showToast('🎮 DISCO MODE ACTIVATED! 🎮');
    setTimeout(() => setDiscoMode(false), 10000);
  });

  // Scroll tracker
  useScrollTracker((progress) => {
    setScrollProgress(progress);
  });

  // Unlock scroll achievements
  useEffect(() => {
    if (scrollProgress >= 10 && !unlocked.includes('first_scroll')) {
      unlock('first_scroll');
    }
    if (scrollProgress >= 50 && !unlocked.includes('scroll_halfway')) {
      unlock('scroll_halfway');
    }
  }, [scrollProgress, unlocked, unlock]);

  // Initialize particle system
  useEffect(() => {
    particleSystem.init('particle-canvas');
  }, [particleSystem]);

  // Fetch repos
  useEffect(() => {
    async function fetchRepos() {
      setLoading(true);
      setError(false);

      const cached = localStorage.getItem(CONFIG.CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CONFIG.CACHE_DURATION) {
          setRepos(data);
          setFilteredRepos(data);
          setLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/orgs/${CONFIG.ORG_NAME}/repos?per_page=${CONFIG.REPOS_PER_PAGE}&type=all`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const filtered = data.filter((repo: Repo) =>
          !CONFIG.EXCLUDED_REPO_PREFIXES.some(prefix => repo.name.startsWith(prefix))
        );
        setRepos(filtered);
        setFilteredRepos(filtered);
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ data: filtered, timestamp: Date.now() }));
      } catch {
        setError(true);
        setErrorMessage('Failed to load repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  // Search filter
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      if (value.trim()) {
        const searchLower = value.toLowerCase();
        setFilteredRepos(repos.filter(repo =>
          repo.name.toLowerCase().includes(searchLower) ||
          repo.description?.toLowerCase().includes(searchLower) ||
          repo.topics?.some(t => t.toLowerCase().includes(searchLower))
        ));
      } else {
        setFilteredRepos(repos);
      }
    }, 300),
    [repos]
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  // Unlock search achievement
  useEffect(() => {
    if (search.trim() && !unlocked.includes('search_detective')) {
      unlock('search_detective');
    }
  }, [search, unlocked, unlock]);

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleHover = () => {
    setHoverCount(prev => prev + 1);
  };

  // Unlock hover achievement
  useEffect(() => {
    if (hoverCount >= 10 && !unlocked.includes('hover_master')) {
      unlock('hover_master');
    }
  }, [hoverCount, unlocked, unlock]);

  const languages = useMemo(() =>
    [...new Set(repos.filter(r => r.language).map(r => r.language as string))].sort(),
    [repos]
  );

  const allTopics = useMemo(() =>
    [...new Set(repos.flatMap(r => r.topics || []).map(t => t.toLowerCase()))].sort(),
    [repos]
  );

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  return (
    <>
      {/* Disco mode */}
      {discoMode && <div className="fixed inset-0 pointer-events-none z-[10000] animate-[disco_0.5s_linear_infinite]" />}

      {/* Scroll progress */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-[10000] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

      {/* Achievement notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-4 right-4 z-[10001] flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-2xl"
          >
            <span className="text-2xl">{notification.icon}</span>
            <div>
              <p className="font-semibold text-sm">Achievement Unlocked!</p>
              <p className="text-xs text-white/80">{notification.title}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-primary to-blue-900/40 bg-[length:200%_200%] animate-gradient" />
        <canvas id="particle-canvas" className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ zIndex: 1 }}>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <img
                src="https://avatars.githubusercontent.com/u/265597819?v=4"
                alt="Certified Slop organization avatar"
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white/10 shadow-2xl animate-float"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Certified Slop
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-400 italic mb-2 min-h-[2rem]">
              {typedText}<span className="animate-pulse">|</span>
            </p>

            <p className="text-gray-500 mb-8 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
              Czech Republic
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
              {repos.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" /></svg>
                    <span className="text-white font-semibold">{repos.length}</span>
                    <span className="text-gray-400 text-sm">repos</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>
                    <span className="text-white font-semibold">{formatNumber(totalStars)}</span>
                    <span className="text-gray-400 text-sm">stars</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
                    <span className="text-white font-semibold">{formatNumber(totalForks)}</span>
                    <span className="text-gray-400 text-sm">forks</span>
                  </div>
                </>
              )}
            </div>

            <a href="https://github.com/CertifiedSlop" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature bar */}
        <section className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={cycleTheme} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 12a4 4 0 100-8 4 4 0 000 8zM8 1.5a6.5 6.5 0 010 13c-1.355 0-2.618-.37-3.713-1.016a.75.75 0 01.363-1.398A5.002 5.002 0 008 13a5 5 0 100-10 .75.75 0 010-1.5z" /></svg>
              <span className="text-sm font-medium capitalize">{theme}</span>
            </button>
            <button onClick={() => setShowAchievements(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl">
              <span className="text-sm font-medium">Achievements ({achievementProgress}%)</span>
            </button>
            <button onClick={() => setShowSlopScores(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
              <span className="text-sm font-medium">Slop Scores™</span>
            </button>
          </div>
        </section>

        {/* Search */}
        <section className="mb-10">
          <div className="relative max-w-3xl mx-auto mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-14 pr-12 py-4 bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-lg"
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <section className="py-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl mb-8">
              <svg className="w-6 h-6 text-purple-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="text-purple-300 font-medium animate-pulse">{CONFIG.LOADING_MESSAGES[loadingMessageIndex]}</span>
            </div>
          </section>
        )}

        {/* Error */}
        {error && !loading && (
          <section className="py-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load repositories</h3>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl">
              Retry
            </button>
          </section>
        )}

        {/* No results */}
        {!loading && !error && filteredRepos.length === 0 && repos.length > 0 && (
          <section className="py-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No repositories found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search.</p>
            <button onClick={() => setSearch('')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl">
              Clear search
            </button>
          </section>
        )}

        {/* Repo grid */}
        {!loading && !error && filteredRepos.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => {
              const sentiment = analyzeSentiment(repo);
              const slopScore = calculateSlopScore(repo);
              const slopRating = getSlopRating(slopScore);

              return (
                <article
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  onMouseEnter={handleHover}
                  className={`group bg-card hover:bg-card-hover rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer card-shine relative overflow-hidden ${getMoodClass(sentiment)}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 bg-purple-500/10 text-xs rounded-lg border border-purple-500/20 ${getSentimentColor(sentiment)}`}>
                      {sentiment}
                    </span>
                    <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg border border-green-500/20">
                      {slopRating.emoji} {slopRating.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg text-purple-400 hover:text-purple-300 mb-2">{repo.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 min-h-[3rem]">{repo.description || 'No description provided'}</p>

                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.topics.slice(0, 4).map(topic => (
                        <span key={topic} className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>
                      {formatNumber(repo.stargazers_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
                      {formatNumber(repo.forks_count)}
                    </span>
                    <span className="ml-auto">{getRelativeTime(repo.updated_at)}</span>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Selected repo modal */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedRepo(null)}>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-card rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRepo.name}</h2>
                  <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    {selectedRepo.html_url}
                  </a>
                </div>
                <button onClick={() => setSelectedRepo(null)} className="p-2 text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" /></svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-300 text-lg mb-6">{selectedRepo.description || 'No description provided'}</p>
                <div className="flex gap-3">
                  <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl">
                    View on GitHub
                  </a>
                  {selectedRepo.topics && selectedRepo.topics.map(topic => (
                    <span key={topic} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm rounded-lg border border-purple-500/20">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-white/10 rounded-xl shadow-xl"
            >
              <span className="text-sm text-gray-300">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
