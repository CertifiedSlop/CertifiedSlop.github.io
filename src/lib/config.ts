// Configuration for Certified Slop website

export const CONFIG = {
  ORG_NAME: 'CertifiedSlop',
  API_BASE_URL: 'https://api.github.com',
  REPOS_PER_PAGE: 100,
  CACHE_KEY: 'certifiedslop_repos_cache_v6',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  WIKI_ALLOWLIST: [
    'websAIte', 'SQuAiL', 'AIuth', 'Slopix',
    'Slop-Package-manager', 'MooAId', 'MooAIdroid',
    'CalcAIdroid', 'WikAI', 'CertifiedSlop.github.io'
  ],
  EXCLUDED_REPO_PREFIXES: ['GNU', 'MIT'],
  TAGLINES: [
    "We make slop. That's it.",
    'AI-powered tools & libraries',
    'Building the future, one repo at a time',
    'Open source • Czech Republic'
  ],
  TYPING_SPEED: { MIN: 50, MAX: 100 },
  TAGLINE_PAUSE: 2000,
  TAGLINE_DELETE_DELAY: 500,
  PARTICLE_COUNT_BASE: 80,
  PARTICLE_DENSITY: 15000,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  MAX_TOPICS_DISPLAY: 20,
  RECENT_UPDATE_DAYS: 7,
  KONAMI_CODE: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  LOADING_MESSAGES: [
    'Training neural network...',
    'Petting digital dogs...',
    'Consulting the blockchain oracle...',
    'Generating AI-powered pixels...',
    'Calculating slop coefficient...',
    'Mining localStorage tokens...',
    'Feeding the particle system...',
    'Warming up the GPU...',
    'Performing unnecessary computations...',
    'Buffering the buffer...',
    'Optimizing already optimized code...',
    'Reading tea leaves...',
    'Asking the magic 8-ball...',
    'Compiling JavaScript to JavaScript...',
    'Installing more dependencies...'
  ],
  SENTIMENTS: ['😊 Happy', '🤔 Thoughtful', '🔥 Spicy', '😴 Sleepy', '🤖 Robotic', '🎉 Excited', '😎 Cool', '🧐 Sophisticated'],
  ACHIEVEMENTS: {
    first_scroll: { id: 'first_scroll', title: 'First Scroll', desc: 'You scrolled!', icon: '📜' },
    scroll_halfway: { id: 'scroll_halfway', title: 'Halfway There', desc: '50% scroll completion', icon: '🎯' },
    hover_master: { id: 'hover_master', title: 'Hover Master', desc: 'Hovered 10 repos', icon: '🖱️' },
    search_detective: { id: 'search_detective', title: 'Search Detective', desc: 'Used search functionality', icon: '🔍' },
    theme_explorer: { id: 'theme_explorer', title: 'Theme Explorer', desc: 'Changed the theme', icon: '🎨' },
    konami_master: { id: 'konami_master', title: 'Konami Master', desc: 'Entered the Konami code', icon: '🎮' },
    slop_critic: { id: 'slop_critic', title: 'Slop Critic', desc: 'Viewed slop scores', icon: '⭐' }
  }
} as const;

export type Achievement = typeof CONFIG.ACHIEVEMENTS[keyof typeof CONFIG.ACHIEVEMENTS];
export type Sentiment = typeof CONFIG.SENTIMENTS[number];
