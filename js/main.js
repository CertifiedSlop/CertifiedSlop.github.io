// Alpine.js Component for Repo App
function repoApp() {
    return {
        // State
        repos: [],
        filteredRepos: [],
        languages: [],
        allTopics: [],
        loading: true,
        error: false,
        selectedRepo: null,

        // Keyboard navigation
        focusedCardIndex: -1,
        showShortcutsModal: false,

        // Hero section
        typedText: '',
        taglines: [
            'We make slop. That\'s it.',
            'AI-powered tools & libraries',
            'Building the future, one repo at a time',
            'Open source • Czech Republic'
        ],
        currentTaglineIndex: 0,
        isTyping: true,
        typingTimeout: null,
        pauseTimeout: null,

        // Manual wiki allowlist - GitHub API's has_wiki is unreliable
        wikiAllowlist: ['websAIte', 'SQuAiL', 'AIuth', 'Slopix', 'Slop-Package-manager', 'MooAId', 'MooAIdroid', 'CalcAIdroid', 'WikAI', 'CertifiedSlop.github.io'],

        // Filters
        search: '',
        selectedLanguages: [],
        selectedTopics: [],
        licenseFilter: 'all',
        wikiFilter: false,
        sortOption: 'stars',

        // Cache
        CACHE_KEY: 'certifiedslop_repos_cache_v3',
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        
        // Computed stats
        get totalStars() {
            return this.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        },
        
        get totalForks() {
            return this.repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        },
        
        get topLanguage() {
            const langCounts = {};
            this.repos.forEach(repo => {
                if (repo.language) {
                    langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                }
            });
            const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
            return sorted[0]?.[0] || 'N/A';
        },
        
        // Initialize
        async init() {
            console.log('Initializing repo app...');
            this.parseURLParams();
            await this.fetchRepos();
            this.updateLastUpdated();
            this.startTypingEffect();
            this.initParticles();
            this.initKeyboardShortcuts();
        },

        // Parse URL parameters for filters
        parseURLParams() {
            const params = new URLSearchParams(window.location.search);

            // Search
            const search = params.get('q');
            if (search) this.search = search;

            // Languages (comma-separated)
            const langs = params.get('lang');
            if (langs) {
                this.selectedLanguages = langs.split(',').map(l => l.toLowerCase());
            }

            // Topics (comma-separated)
            const topics = params.get('topics');
            if (topics) {
                this.selectedTopics = topics.split(',').map(t => t.toLowerCase());
            }

            // License
            const license = params.get('license');
            if (license) this.licenseFilter = license;

            // Wiki
            const wiki = params.get('wiki');
            if (wiki === 'true') this.wikiFilter = true;

            // Sort
            const sort = params.get('sort');
            if (sort && ['stars', 'forks', 'updated', 'created', 'name'].includes(sort)) {
                this.sortOption = sort;
            }
        },

        // Update URL with current filters
        updateURL() {
            const params = new URLSearchParams();

            if (this.search) params.set('q', this.search);
            if (this.selectedLanguages.length > 0) params.set('lang', this.selectedLanguages.join(','));
            if (this.selectedTopics.length > 0) params.set('topics', this.selectedTopics.join(','));
            if (this.licenseFilter !== 'all') params.set('license', this.licenseFilter);
            if (this.wikiFilter) params.set('wiki', 'true');
            if (this.sortOption !== 'stars') params.set('sort', this.sortOption);

            const newURL = params.toString()
                ? `${window.location.pathname}?${params.toString()}`
                : window.location.pathname;

            window.history.replaceState({}, '', newURL);
        },

        // Keyboard shortcuts
        initKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Don't trigger shortcuts when typing in input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                // '/' to focus search
                if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    const searchInput = document.querySelector('input[x-model="search"]');
                    if (searchInput) searchInput.focus();
                }

                // '?' to show keyboard shortcuts modal
                if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.showShortcutsModal = true;
                }

                // Arrow keys to navigate cards (when not in modal)
                if (!this.selectedRepo && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    this.navigateCards(e.key);
                }

                // Enter to open selected card
                if (e.key === 'Enter' && this.focusedCardIndex >= 0 && !this.selectedRepo) {
                    const cards = document.querySelectorAll('article[role="button"]');
                    if (cards[this.focusedCardIndex]) {
                        this.selectedRepo = this.filteredRepos[this.focusedCardIndex];
                    }
                }
            });
        },

        // Navigate cards with arrow keys
        navigateCards(key) {
            const cards = document.querySelectorAll('article[role="button"]');
            if (cards.length === 0) return;

            const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

            switch (key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    this.focusedCardIndex = Math.min(this.focusedCardIndex + 1, cards.length - 1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.focusedCardIndex = Math.max(this.focusedCardIndex - 1, 0);
                    break;
            }

            // Update focus
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

        // Typing effect for hero tagline
        startTypingEffect() {
            const type = () => {
                const currentTagline = this.taglines[this.currentTaglineIndex];
                if (this.typedText.length < currentTagline.length) {
                    this.typedText = currentTagline.slice(0, this.typedText.length + 1);
                    this.typingTimeout = setTimeout(type, 50 + Math.random() * 50);
                } else {
                    this.isTyping = false;
                    this.pauseTimeout = setTimeout(() => {
                        this.pauseTimeout = setTimeout(() => {
                            this.typedText = '';
                            this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.taglines.length;
                            this.isTyping = true;
                            type();
                        }, 500);
                    }, 2000);
                }
            };
            type();
        },

        // Particle animation for hero background
        initParticles() {
            const canvas = document.getElementById('particle-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            let particles = [];
            let animationId;

            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = document.querySelector('header')?.offsetHeight || 600;
            };
            resize();
            window.addEventListener('resize', resize);

            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * 0.3;
                    this.vy = (Math.random() - 0.5) * 0.3;
                    this.size = Math.random() * 2 + 1;
                    this.color = `rgba(${168 + Math.random() * 50}, ${85 + Math.random() * 50}, ${247 + Math.random() * 50}, ${0.3 + Math.random() * 0.3})`;
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                }

                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
            }

            const init = () => {
                particles = [];
                const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            };

            const connect = () => {
                for (let a = 0; a < particles.length; a++) {
                    for (let b = a; b < particles.length; b++) {
                        const dx = particles[a].x - particles[b].x;
                        const dy = particles[a].y - particles[b].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 120) {
                            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 - distance / 800})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particles[a].x, particles[a].y);
                            ctx.lineTo(particles[b].x, particles[b].y);
                            ctx.stroke();
                        }
                    }
                }
            };

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                connect();

                animationId = requestAnimationFrame(animate);
            };

            init();
            animate();

            // Cleanup on page hide
            window.addEventListener('beforeunload', () => {
                cancelAnimationFrame(animationId);
            });
        },
        
        // Fetch repositories
        async fetchRepos() {
            console.log('Fetching repos...');
            this.loading = true;
            this.error = false;
            
            // Check cache
            const cached = this.getCachedData();
            if (cached) {
                console.log('Using cached data, count:', cached.length);
                this.repos = cached;
                this.processRepos();
                this.loading = false;
                return;
            }
            
            try {
                const response = await fetch(`https://api.github.com/orgs/CertifiedSlop/repos?per_page=100&type=all`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Raw repos from API:', data.length);
                
                // Filter out false positives
                this.repos = data.filter(repo => 
                    !repo.name.startsWith('GNU') && 
                    !repo.name.startsWith('MIT')
                );
                
                console.log('Filtered repos:', this.repos.length);
                
                // Cache results
                this.cacheData(this.repos);
                
                this.processRepos();
            } catch (err) {
                console.error('Error fetching repos:', err);
                this.error = true;
            } finally {
                this.loading = false;
            }
        },
        
        // Process repos after fetch
        processRepos() {
            // Extract unique languages
            const langSet = new Set();
            this.repos.forEach(repo => {
                if (repo.language) langSet.add(repo.language);
            });
            this.languages = Array.from(langSet);
            console.log('Languages:', this.languages);

            // Extract unique topics
            const topicSet = new Set();
            this.repos.forEach(repo => {
                if (repo.topics && repo.topics.length > 0) {
                    repo.topics.forEach(topic => topicSet.add(topic.toLowerCase()));
                }
            });
            this.allTopics = Array.from(topicSet).sort();
            console.log('Topics:', this.allTopics);

            // Initial filter
            this.filterRepos();
        },

        // Filter and sort
        filterRepos() {
            let result = [...this.repos];

            // Search filter
            if (this.search.trim()) {
                const searchLower = this.search.toLowerCase().trim();
                result = result.filter(repo =>
                    repo.name.toLowerCase().includes(searchLower) ||
                    (repo.description && repo.description.toLowerCase().includes(searchLower)) ||
                    (repo.topics && repo.topics.some(t => t.toLowerCase().includes(searchLower)))
                );
            }

            // Language filter (multi-select)
            if (this.selectedLanguages.length > 0) {
                result = result.filter(repo =>
                    repo.language && this.selectedLanguages.includes(repo.language.toLowerCase())
                );
            }

            // Topic filter (multi-select)
            if (this.selectedTopics.length > 0) {
                result = result.filter(repo =>
                    repo.topics && repo.topics.some(t => this.selectedTopics.includes(t.toLowerCase()))
                );
            }

            // License filter
            if (this.licenseFilter !== 'all') {
                result = result.filter(repo => {
                    const licenseType = this.getLicenseType(repo.license?.name);
                    if (this.licenseFilter === 'none') return !repo.license;
                    return licenseType === this.licenseFilter;
                });
            }

            // Wiki filter
            if (this.wikiFilter) {
                result = result.filter(repo => this.hasWiki(repo));
            }

            // Sort
            result.sort((a, b) => {
                switch (this.sortOption) {
                    case 'stars': return b.stargazers_count - a.stargazers_count;
                    case 'forks': return b.forks_count - a.forks_count;
                    case 'updated': return new Date(b.updated_at) - new Date(a.updated_at);
                    case 'created': return new Date(b.created_at) - new Date(a.created_at);
                    case 'name': return a.name.localeCompare(b.name);
                    default: return b.stargazers_count - a.stargazers_count;
                }
            });

            this.filteredRepos = result;
            console.log('Filtered repos count:', this.filteredRepos.length);

            // Update URL with current filters
            this.updateURL();
        },
        
        // Clear search
        clearSearch() {
            this.search = '';
            this.filterRepos();
        },

        // Toggle language selection
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

        // Toggle topic selection
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

        // Clear all filters
        clearFilters() {
            this.search = '';
            this.selectedLanguages = [];
            this.selectedTopics = [];
            this.licenseFilter = 'all';
            this.wikiFilter = false;
            this.sortOption = 'stars';
            this.filterRepos();
        },
        
        // Get license type for filtering
        getLicenseType(license) {
            if (!license) return 'none';
            if (license.includes('MIT')) return 'mit';
            if (license.includes('Affero')) return 'agpl';
            if (license.includes('General Public')) return 'gpl';
            return 'other';
        },
        
        // Get short license name
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

        // Check if repo has wiki (using allowlist since GitHub API is unreliable)
        hasWiki(repo) {
            return this.wikiAllowlist.includes(repo.name);
        },

        // Check if repo was updated within 7 days
        isRecentlyUpdated(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        },

        // Get language dot color
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
        
        // Format number
        formatNumber(num) {
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            return num.toString();
        },
        
        // Get relative time
        getRelativeTime(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
            return `${Math.floor(diffDays / 365)}y ago`;
        },
        
        // Copy URL
        async copyUrl(url) {
            try {
                await navigator.clipboard.writeText(url);
                this.showToast('URL copied to clipboard!');
            } catch (err) {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = url;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast('URL copied to clipboard!');
            }
        },

        // Copy shareable link with current filters
        async copyShareLink() {
            this.updateURL();
            const shareUrl = window.location.href;
            try {
                await navigator.clipboard.writeText(shareUrl);
                this.showToast('Share link copied!');
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast('Share link copied!');
            }
        },
        
        // Show toast
        showToast(message) {
            const event = new CustomEvent('toast', {
                detail: { id: Date.now(), message }
            });
            window.dispatchEvent(event);
        },
        
        // Cache functions
        getCachedData() {
            try {
                const cached = localStorage.getItem(this.CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < this.CACHE_DURATION) {
                        return data;
                    }
                }
            } catch (e) {
                console.error('Cache read error:', e);
            }
            return null;
        },
        
        cacheData(data) {
            try {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error('Cache write error:', e);
            }
        },
        
        // Update last updated timestamp
        updateLastUpdated() {
            const el = document.getElementById('last-updated');
            if (el) {
                el.textContent = `Last updated: ${new Date().toLocaleString()}`;
            }
        }
    }
}

// Register with Alpine when available
if (typeof document !== 'undefined') {
    document.addEventListener('alpine:init', () => {
        console.log('Alpine initialized');
    });
}
