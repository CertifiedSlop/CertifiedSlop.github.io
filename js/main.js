/**
 * CertifiedSlop.github.io - Main Application
 * Refactored for better modularity, performance, and maintainability
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    ORG_NAME: 'CertifiedSlop',
    API_BASE_URL: 'https://api.github.com',
    REPOS_PER_PAGE: 100,
    CACHE_KEY: 'certifiedslop_repos_cache_v4',
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
    RECENT_UPDATE_DAYS: 7
};

// ============================================================================
// UTILITY MODULE
// ============================================================================
const Utils = {
    /**
     * Debounce function to limit rate of execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format large numbers with k suffix
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    },

    /**
     * Get relative time string from date
     */
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    },

    /**
     * Get full date string for accessibility
     */
    getFullDate(dateString) {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Check if date is within recent days
     */
    isWithinDays(dateString, days) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    },

    /**
     * Safely get nested property with fallback
     */
    safeGet(obj, path, fallback = '') {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? fallback;
    },

    /**
     * Copy text to clipboard with fallback
     */
    async copyToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch {
            document.body.removeChild(textarea);
            return false;
        }
    }
};

// ============================================================================
// CACHE MODULE
// ============================================================================
const Cache = {
    get(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp >= CONFIG.CACHE_DURATION;

            return isExpired ? null : data;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.error('Cache write error:', error);
            return false;
        }
    },

    clear(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }
};

// ============================================================================
// API MODULE
// ============================================================================
const API = {
    /**
     * Extract rate limit info from response headers
     */
    extractRateLimitInfo(response) {
        return {
            remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
            reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
            limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0')
        };
    },

    /**
     * Calculate wait time for rate limit reset
     */
    getRateLimitWaitMinutes(resetTimestamp) {
        const resetTime = new Date(resetTimestamp * 1000);
        return Math.ceil((resetTime - new Date()) / 60000);
    },

    /**
     * Fetch repositories from GitHub API
     */
    async fetchRepos(orgName) {
        const url = `${CONFIG.API_BASE_URL}/orgs/${orgName}/repos?per_page=${CONFIG.REPOS_PER_PAGE}&type=all`;

        const response = await fetch(url);
        const rateLimitInfo = this.extractRateLimitInfo(response);

        if (!response.ok) {
            if (response.status === 403 && rateLimitInfo.remaining === 0) {
                throw {
                    type: 'RATE_LIMITED',
                    message: `Rate limit exceeded. Try again in ${API.getRateLimitWaitMinutes(rateLimitInfo.reset)} minutes.`,
                    ...rateLimitInfo
                };
            }
            throw {
                type: 'HTTP_ERROR',
                message: `HTTP error! status: ${response.status}`,
                status: response.status
            };
        }

        return {
            data: await response.json(),
            rateLimit: rateLimitInfo
        };
    }
};

// ============================================================================
// PARTICLE ANIMATION MODULE
// ============================================================================
const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    width: 0,
    height: 0,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', Utils.debounce(() => {
            this.resize();
            this.createParticles();
        }, 250));

        // Cleanup on page hide
        window.addEventListener('beforeunload', () => this.destroy());
    },

    resize() {
        this.width = window.innerWidth;
        this.height = document.querySelector('header')?.offsetHeight || 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    createParticles() {
        const particleCount = Math.min(
            CONFIG.PARTICLE_COUNT_BASE,
            Math.floor((this.width * this.height) / CONFIG.PARTICLE_DENSITY)
        );

        this.particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            color: `rgba(${168 + Math.random() * 50}, ${85 + Math.random() * 50}, ${247 + Math.random() * 50}, ${0.3 + Math.random() * 0.3})`
        }));
    },

    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
    },

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
    },

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 - distance / 800})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    },

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        this.drawConnections();
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
};

// ============================================================================
// TYPING EFFECT MODULE
// ============================================================================
const TypingEffect = {
    element: null,
    text: '',
    index: 0,
    isTyping: true,
    timeouts: [],

    init(elementSelector, taglines = CONFIG.TAGLINES) {
        this.element = document.querySelector(elementSelector);
        if (!this.element) return;

        this.taglines = taglines;
        this.currentTaglineIndex = 0;
        this.type();
    },

    type() {
        if (!this.element) return;

        const currentTagline = this.taglines[this.currentTaglineIndex];

        if (this.isTyping) {
            if (this.text.length < currentTagline.length) {
                this.text = currentTagline.slice(0, this.text.length + 1);
                this.element.textContent = this.text;
                const delay = CONFIG.TYPING_SPEED.MIN + Math.random() * (CONFIG.TYPING_SPEED.MAX - CONFIG.TYPING_SPEED.MIN);
                this.timeouts.push(setTimeout(() => this.type(), delay));
            } else {
                this.isTyping = false;
                this.timeouts.push(setTimeout(() => this.type(), CONFIG.TAGLINE_PAUSE));
            }
        } else {
            if (this.text.length > 0) {
                this.text = currentTagline.slice(0, this.text.length - 1);
                this.element.textContent = this.text;
                this.timeouts.push(setTimeout(() => this.type(), 30));
            } else {
                this.isTyping = true;
                this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.taglines.length;
                this.timeouts.push(setTimeout(() => this.type(), CONFIG.TAGLINE_DELETE_DELAY));
            }
        }
    },

    destroy() {
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts = [];
    }
};

// ============================================================================
// KEYBOARD SHORTCUTS MODULE
// ============================================================================
const KeyboardShortcuts = {
    handlers: {},

    init(handlers) {
        this.handlers = handlers;

        document.addEventListener('keydown', (e) => {
            // Ignore when typing in input/textarea
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            const key = e.key.toLowerCase();

            // '/' to focus search
            if (key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.handlers.onFocusSearch?.();
            }

            // '?' to show shortcuts
            if (key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.handlers.onShowShortcuts?.();
            }

            // Arrow keys for navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (!this.handlers.isModalOpen?.()) {
                    e.preventDefault();
                    this.handlers.onNavigate?.(e.key);
                }
            }

            // Enter to open
            if (key === 'Enter' && !this.handlers.isModalOpen?.()) {
                const focusedIndex = this.handlers.getFocusedIndex?.();
                if (focusedIndex >= 0) {
                    this.handlers.onOpen?.(focusedIndex);
                }
            }

            // Escape to close modals
            if (key === 'Escape') {
                this.handlers.onClose?.();
            }
        });
    }
};

// ============================================================================
// URL STATE MODULE
// ============================================================================
const URLState = {
    parse() {
        const params = new URLSearchParams(window.location.search);
        return {
            search: params.get('q') || '',
            languages: params.get('lang')?.split(',').filter(Boolean) || [],
            topics: params.get('topics')?.split(',').filter(Boolean) || [],
            license: params.get('license') || 'all',
            wiki: params.get('wiki') === 'true',
            sort: params.get('sort') || 'stars'
        };
    },

    update(state) {
        const params = new URLSearchParams();

        if (state.search) params.set('q', state.search);
        if (state.languages?.length > 0) params.set('lang', state.languages.join(','));
        if (state.topics?.length > 0) params.set('topics', state.topics.join(','));
        if (state.license !== 'all') params.set('license', state.license);
        if (state.wiki) params.set('wiki', 'true');
        if (state.sort !== 'stars') params.set('sort', state.sort);

        const newURL = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({}, '', newURL);
    }
};

// ============================================================================
// REPOSITORY HELPERS
// ============================================================================
const RepoHelpers = {
    hasWiki(repo) {
        return CONFIG.WIKI_ALLOWLIST.includes(repo.name);
    },

    isRecentlyUpdated(dateString) {
        return Utils.isWithinDays(dateString, CONFIG.RECENT_UPDATE_DAYS);
    },

    getLicenseType(license) {
        if (!license) return 'none';
        if (license.includes('MIT')) return 'mit';
        if (license.includes('Affero')) return 'agpl';
        if (license.includes('General Public')) return 'gpl';
        return 'other';
    },

    getLicenseShort(license) {
        const abbreviations = {
            'MIT License': 'MIT',
            'GNU Affero General Public License v3.0': 'AGPL-3.0',
            'GNU General Public License v3.0': 'GPL-3.0',
            'Apache License 2.0': 'Apache-2.0',
            'BSD 3-Clause License': 'BSD-3',
            'ISC License': 'ISC'
        };
        return abbreviations[license] || license.replace(' License', '');
    },

    getLanguageDotColor(language) {
        const colors = {
            'Python': 'bg-blue-400',
            'Kotlin': 'bg-purple-400',
            'Rust': 'bg-orange-400',
            'JavaScript': 'bg-yellow-400',
            'TypeScript': 'bg-blue-500',
            'Java': 'bg-red-400',
            'Go': 'bg-cyan-400',
            'Ruby': 'bg-pink-400'
        };
        return colors[language] || 'bg-gray-400';
    },

    filterRepos(repos, filters) {
        let result = [...repos];
        const { search, languages, topics, license, wiki } = filters;

        // Search filter
        if (search?.trim()) {
            const searchLower = search.toLowerCase().trim();
            result = result.filter(repo =>
                repo.name.toLowerCase().includes(searchLower) ||
                repo.description?.toLowerCase().includes(searchLower) ||
                repo.topics?.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        // Language filter
        if (languages?.length > 0) {
            const lowerLangs = languages.map(l => l.toLowerCase());
            result = result.filter(repo =>
                repo.language && lowerLangs.includes(repo.language.toLowerCase())
            );
        }

        // Topic filter
        if (topics?.length > 0) {
            const lowerTopics = topics.map(t => t.toLowerCase());
            result = result.filter(repo =>
                repo.topics?.some(t => lowerTopics.includes(t.toLowerCase()))
            );
        }

        // License filter
        if (license && license !== 'all') {
            result = result.filter(repo => {
                const repoLicense = this.getLicenseType(repo.license?.name);
                return license === 'none' ? !repo.license : repoLicense === license;
            });
        }

        // Wiki filter
        if (wiki) {
            result = result.filter(repo => this.hasWiki(repo));
        }

        return result;
    },

    sortRepos(repos, sortOption) {
        const sorted = [...repos];
        switch (sortOption) {
            case 'stars':
                return sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
            case 'forks':
                return sorted.sort((a, b) => b.forks_count - a.forks_count);
            case 'updated':
                return sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            case 'created':
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    },

    extractLanguages(repos) {
        return [...new Set(repos.filter(r => r.language).map(r => r.language))].sort();
    },

    extractTopics(repos) {
        const topicSet = new Set();
        repos.forEach(repo => {
            repo.topics?.forEach(topic => topicSet.add(topic.toLowerCase()));
        });
        return [...topicSet].sort();
    },

    computeStats(repos) {
        const langCounts = {};
        let totalStars = 0;
        let totalForks = 0;

        repos.forEach(repo => {
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            }
        });

        const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

        return {
            totalStars,
            totalForks,
            topLanguage: sortedLangs[0]?.[0] || 'N/A',
            repoCount: repos.length
        };
    }
};

// ============================================================================
// MAIN ALPINE.JS COMPONENT
// ============================================================================
function repoApp() {
    return {
        // State
        repos: [],
        filteredRepos: [],
        languages: [],
        allTopics: [],
        loading: true,
        error: false,
        errorMessage: '',
        errorType: null,
        selectedRepo: null,
        rateLimitInfo: null,

        // UI State
        focusedCardIndex: -1,
        showShortcutsModal: false,
        toasts: [],

        // Filters
        search: '',
        selectedLanguages: [],
        selectedTopics: [],
        licenseFilter: 'all',
        wikiFilter: false,
        sortOption: 'stars',

        // Typing effect
        typedText: '',

        // Computed stats
        get totalStars() {
            return RepoHelpers.computeStats(this.repos).totalStars;
        },

        get totalForks() {
            return RepoHelpers.computeStats(this.repos).totalForks;
        },

        get topLanguage() {
            return RepoHelpers.computeStats(this.repos).topLanguage;
        },

        get repoCount() {
            return this.repos.length;
        },

        // Initialize
        async init() {
            console.log('[App] Initializing...');

            // Initialize modules
            ParticleSystem.init('particle-canvas');
            TypingEffect.init('[x-text="typedText"]');

            // Setup keyboard shortcuts
            KeyboardShortcuts.init({
                onFocusSearch: () => this.focusSearch(),
                onShowShortcuts: () => { this.showShortcutsModal = true; },
                onNavigate: (key) => this.navigateCards(key),
                onOpen: (index) => this.openRepo(index),
                onClose: () => this.closeModals(),
                isModalOpen: () => this.selectedRepo !== null || this.showShortcutsModal,
                getFocusedIndex: () => this.focusedCardIndex
            });

            // Load initial state from URL
            this.loadFromURL();

            // Fetch repositories
            await this.fetchRepos();

            // Update timestamp
            this.updateLastUpdated();

            console.log('[App] Initialization complete');
        },

        // Search management
        focusSearch() {
            const searchInput = document.querySelector('input[x-model="search"]');
            searchInput?.focus();
        },

        clearSearch() {
            this.search = '';
            this.filterRepos();
        },

        // URL state management
        loadFromURL() {
            const state = URLState.parse();
            this.search = state.search;
            this.selectedLanguages = state.languages;
            this.selectedTopics = state.topics;
            this.licenseFilter = state.license;
            this.wikiFilter = state.wiki;
            this.sortOption = state.sort;
        },

        updateURL() {
            URLState.update({
                search: this.search,
                languages: this.selectedLanguages,
                topics: this.selectedTopics,
                license: this.licenseFilter,
                wiki: this.wikiFilter,
                sort: this.sortOption
            });
        },

        // Repository fetching
        async fetchRepos() {
            console.log('[App] Fetching repositories...');
            this.loading = true;
            this.error = false;

            // Check cache first
            const cached = Cache.get(CONFIG.CACHE_KEY);
            if (cached) {
                console.log(`[Cache] Hit: ${cached.length} repos`);
                this.repos = cached;
                this.processRepos();
                this.loading = false;
                return;
            }

            try {
                const { data, rateLimit } = await API.fetchRepos(CONFIG.ORG_NAME);

                // Filter out excluded repos
                this.repos = data.filter(repo =>
                    !CONFIG.EXCLUDED_REPO_PREFIXES.some(prefix => repo.name.startsWith(prefix))
                );

                console.log(`[API] Fetched: ${this.repos.length} repos`);

                // Cache results
                Cache.set(CONFIG.CACHE_KEY, this.repos);

                // Store rate limit info
                this.rateLimitInfo = rateLimit;
                this.checkRateLimitStatus();

                this.processRepos();
            } catch (error) {
                console.error('[API] Error:', error);

                if (error.type === 'RATE_LIMITED') {
                    this.errorType = 'RATE_LIMITED';
                    this.errorMessage = error.message;

                    // Try to use stale cache
                    const staleCache = Cache.get(CONFIG.CACHE_KEY);
                    if (staleCache) {
                        this.repos = staleCache;
                        this.processRepos();
                        this.error = false;
                        this.showToast('Using cached data (API rate limit exceeded)');
                        return;
                    }
                }

                this.error = true;
                this.errorMessage = error.message || 'Failed to load repositories';
            } finally {
                this.loading = false;
            }
        },

        checkRateLimitStatus() {
            if (this.rateLimitInfo?.remaining && this.rateLimitInfo.remaining < 10) {
                console.warn(`[Rate Limit] Low remaining: ${this.rateLimitInfo.remaining}`);
                if (this.rateLimitInfo.reset) {
                    const waitMinutes = API.getRateLimitWaitMinutes(this.rateLimitInfo.reset);
                    console.warn(`[Rate Limit] Resets in ${waitMinutes} minutes`);
                }
            }
        },

        // Process repositories
        processRepos() {
            this.languages = RepoHelpers.extractLanguages(this.repos);
            this.allTopics = RepoHelpers.extractTopics(this.repos);
            this.filterRepos();
        },

        // Filter and sort
        filterRepos: Utils.debounce(function() {
            const filters = {
                search: this.search,
                languages: this.selectedLanguages,
                topics: this.selectedTopics,
                license: this.licenseFilter,
                wiki: this.wikiFilter
            };

            let result = RepoHelpers.filterRepos(this.repos, filters);
            result = RepoHelpers.sortRepos(result, this.sortOption);

            this.filteredRepos = result;
            this.focusedCardIndex = result.length > 0 ? 0 : -1;
            this.updateURL();

            console.log(`[Filter] Results: ${result.length} repos`);
        }, CONFIG.DEBOUNCE_DELAY),

        // Filter actions
        toggleLanguage(lang) {
            const lower = lang.toLowerCase();
            const index = this.selectedLanguages.indexOf(lower);
            if (index > -1) {
                this.selectedLanguages.splice(index, 1);
            } else {
                this.selectedLanguages.push(lower);
            }
            this.filterRepos();
        },

        toggleTopic(topic) {
            const lower = topic.toLowerCase();
            const index = this.selectedTopics.indexOf(lower);
            if (index > -1) {
                this.selectedTopics.splice(index, 1);
            } else {
                this.selectedTopics.push(lower);
            }
            this.filterRepos();
        },

        clearFilters() {
            this.search = '';
            this.selectedLanguages = [];
            this.selectedTopics = [];
            this.licenseFilter = 'all';
            this.wikiFilter = false;
            this.sortOption = 'stars';
            this.filterRepos();
        },

        // Keyboard navigation
        navigateCards(key) {
            const cards = document.querySelectorAll('article[role="button"]');
            if (cards.length === 0) return;

            const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
            let newIndex = this.focusedCardIndex;

            switch (key) {
                case 'ArrowRight':
                    newIndex = Math.min(this.focusedCardIndex + 1, cards.length - 1);
                    break;
                case 'ArrowLeft':
                    newIndex = Math.max(this.focusedCardIndex - 1, 0);
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(this.focusedCardIndex + cols, cards.length - 1);
                    break;
                case 'ArrowUp':
                    newIndex = Math.max(this.focusedCardIndex - cols, 0);
                    break;
            }

            this.focusedCardIndex = newIndex;
            this.updateCardFocus(cards);
        },

        updateCardFocus(cards) {
            cards.forEach((card, i) => {
                if (i === this.focusedCardIndex) {
                    card.focus();
                    card.classList.add('ring-2', 'ring-purple-500');
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    card.classList.remove('ring-2', 'ring-purple-500');
                }
            });
        },

        openRepo(index) {
            const cards = document.querySelectorAll('article[role="button"]');
            if (cards[index]) {
                this.selectedRepo = this.filteredRepos[index];
            }
        },

        closeModals() {
            this.selectedRepo = null;
            this.showShortcutsModal = false;
        },

        // Share functionality
        async copyShareLink() {
            this.updateURL();
            const shareUrl = window.location.href;
            const success = await Utils.copyToClipboard(shareUrl);
            this.showToast(success ? 'Share link copied!' : 'Failed to copy link');
        },

        async copyUrl(url) {
            const success = await Utils.copyToClipboard(url);
            this.showToast(success ? 'URL copied to clipboard!' : 'Failed to copy URL');
        },

        // Toast notifications
        showToast(message) {
            const id = Date.now();
            this.toasts.push({ id, message });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, CONFIG.TOAST_DURATION);
        },

        // Utility methods (exposed to template)
        formatNumber: Utils.formatNumber,
        getRelativeTime: Utils.getRelativeTime,
        getFullDate: Utils.getFullDate,
        isRecentlyUpdated: RepoHelpers.isRecentlyUpdated.bind(RepoHelpers),
        hasWiki: RepoHelpers.hasWiki.bind(RepoHelpers),
        getLicenseShort: RepoHelpers.getLicenseShort.bind(RepoHelpers),
        getLanguageDotColor: RepoHelpers.getLanguageDotColor.bind(RepoHelpers),

        // Update timestamp
        updateLastUpdated() {
            const el = document.getElementById('last-updated');
            if (el) {
                el.textContent = `Last updated: ${new Date().toLocaleString()}`;
            }
        }
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================
if (typeof document !== 'undefined') {
    document.addEventListener('alpine:init', () => {
        console.log('[Alpine] Initialized');
    });
}
