// Alpine.js Component for Repo App
function repoApp() {
    return {
        // State
        repos: [],
        filteredRepos: [],
        languages: [],
        loading: true,
        error: false,
        
        // Filters
        search: '',
        languageFilter: 'all',
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
            await this.fetchRepos();
            this.updateLastUpdated();
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
            
            // Language filter
            if (this.languageFilter !== 'all') {
                result = result.filter(repo => 
                    repo.language && repo.language.toLowerCase() === this.languageFilter.toLowerCase()
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
                result = result.filter(repo => repo.has_wiki);
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
        },
        
        // Clear search
        clearSearch() {
            this.search = '';
            this.filterRepos();
        },
        
        // Clear all filters
        clearFilters() {
            this.search = '';
            this.languageFilter = 'all';
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
