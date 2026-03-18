// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const ORG_NAME = 'CertifiedSlop';
const CACHE_KEY = 'certifiedslop_repos_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Language color mappings
const languageColors = {
    'Python': 'python',
    'Kotlin': 'kotlin',
    'Rust': 'rust',
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Java': 'java',
    'Go': 'go',
    'Ruby': 'ruby'
};

// License abbreviations
const licenseAbbreviations = {
    'MIT License': 'MIT',
    'GNU Affero General Public License v3.0': 'AGPL-3.0',
    'GNU General Public License v3.0': 'GPL-3.0',
    'Apache License 2.0': 'Apache-2.0',
    'BSD 3-Clause License': 'BSD-3',
    'ISC License': 'ISC',
    'The Unlicense': 'Unlicense',
    'Mozilla Public License 2.0': 'MPL-2.0'
};

// State management
let allRepos = [];
let filteredRepos = [];
let languages = new Set();

// SVG Icons
const icons = {
    repo: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
    </svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
    </svg>`,
    fork: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
    </svg>`,
    wiki: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm10 1H2a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1z"/>
        <path d="M3 4a1 1 0 011-1h1a1 1 0 011 1v1H3V4zm0 3a1 1 0 011-1h1a1 1 0 011 1v1H3V7zm0 3a1 1 0 011-1h1a1 1 0 011 1v1H3v-1z"/>
    </svg>`,
    code: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z"/>
    </svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.75 2a.75.75 0 01.75.75V3h2.25a2.25 2.25 0 012.25 2.25v1.942c.365.049.75.058 1.125.058h.378a.75.75 0 010 1.5h-.378a12.144 12.144 0 01-2.25-.172v5.172a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 014.5 3h2.25V2.75A.75.75 0 017.75 2zm3 9.75a.75.75 0 00-1.5 0 .75.75 0 001.5 0zM4.5 4.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h7.5a.75.75 0 00.75-.75v-5.278a12.042 12.042 0 01-2.25.228V10a.75.75 0 01-1.5 0V7.25a.75.75 0 01.75-.75h3V5.25a.75.75 0 00-.75-.75h-7.5z"/>
    </svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
    </svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
    </svg>`
};

/**
 * Get cached data
 */
function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }
    } catch (error) {
        console.error('Error reading cache:', error);
    }
    return null;
}

/**
 * Cache data
 */
function cacheData(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching data:', error);
    }
}

/**
 * Fetch repositories from GitHub API
 */
async function fetchRepos() {
    // Check cache first
    const cached = getCachedData();
    if (cached) {
        console.log('Using cached data');
        return cached;
    }

    try {
        const response = await fetch(`${GITHUB_API_BASE}/orgs/${ORG_NAME}/repos?per_page=100&type=all`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // Filter out license name entries (false positives from API)
        const filtered = repos.filter(repo => 
            !repo.name.startsWith('GNU') && 
            !repo.name.startsWith('MIT')
        );
        
        // Cache the results
        cacheData(filtered);
        
        return filtered;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

/**
 * Format number with K suffix for thousands
 */
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * Get language badge class
 */
function getLanguageClass(language) {
    if (!language) return '';
    return languageColors[language] || '';
}

/**
 * Get abbreviated license name
 */
function getLicenseAbbreviation(license) {
    if (!license) return '';
    return licenseAbbreviations[license] || license.replace(' License', '');
}

/**
 * Get license type for filtering
 */
function getLicenseType(license) {
    if (!license) return 'none';
    if (license.includes('MIT')) return 'mit';
    if (license.includes('Affero')) return 'agpl';
    if (license.includes('General Public')) return 'gpl';
    return 'other';
}

/**
 * Format date to relative time
 */
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Create repo card HTML
 */
function createRepoCard(repo) {
    const description = repo.description || 'No description provided';
    const language = repo.language;
    const languageClass = getLanguageClass(repo.language);
    const license = repo.license ? repo.license.name : null;
    const shortLicense = getLicenseAbbreviation(license);
    const hasWiki = repo.has_wiki;
    const topics = repo.topics || [];
    const updatedAt = getRelativeTime(repo.updated_at);
    
    return `
        <article class="repo-card" role="listitem" data-repo-name="${repo.name.toLowerCase()}">
            <div class="repo-header">
                <a href="${repo.html_url}" class="repo-name" target="_blank" rel="noopener noreferrer">
                    ${icons.repo}
                    ${repo.name}
                </a>
                <div class="repo-actions">
                    ${hasWiki ? `
                        <a href="${repo.html_url}/wiki" class="wiki-link" target="_blank" rel="noopener noreferrer" title="View Wiki">
                            ${icons.wiki} Wiki
                        </a>
                    ` : ''}
                    <button class="wiki-link copy-url-btn" data-url="${repo.html_url}" title="Copy URL">
                        ${icons.copy}
                    </button>
                </div>
            </div>
            
            <p class="repo-description">${description}</p>
            
            ${topics.length > 0 ? `
                <div class="repo-topics">
                    ${topics.slice(0, 5).map(topic => 
                        `<span class="topic-tag">${topic}</span>`
                    ).join('')}
                </div>
            ` : ''}
            
            <div class="repo-meta">
                ${language ? `
                    <span class="badge badge-language ${languageClass}" title="Primary Language">
                        ${language}
                    </span>
                ` : ''}
                
                ${license ? `
                    <span class="badge badge-license" title="${license}">
                        ${shortLicense}
                    </span>
                ` : ''}
                
                <span class="badge badge-stat" title="Stars">
                    ${icons.star} ${formatNumber(repo.stargazers_count)}
                </span>
                
                <span class="badge badge-stat" title="Forks">
                    ${icons.fork} ${formatNumber(repo.forks_count)}
                </span>
            </div>
            
            <p class="repo-updated" title="Updated: ${new Date(repo.updated_at).toLocaleDateString()}">
                ${icons.calendar} Updated ${updatedAt}
            </p>
        </article>
    `;
}

/**
 * Populate language filter dropdown
 */
function populateLanguageFilter(repos) {
    const select = document.getElementById('language-filter');
    const languageCounts = {};
    
    repos.forEach(repo => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            languages.add(repo.language);
        }
    });
    
    // Sort languages by count
    const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang);
    
    sortedLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.toLowerCase();
        option.textContent = `${lang} (${languageCounts[lang]})`;
        select.appendChild(option);
    });
}

/**
 * Calculate and display organization stats
 */
function displayOrgStats(repos) {
    const statsContainer = document.getElementById('org-stats');
    
    const totalRepos = repos.length;
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Find most used language
    const languageCounts = {};
    repos.forEach(repo => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });
    const topLanguage = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    statsContainer.innerHTML = `
        <span class="stat-badge">
            ${icons.repo}
            <span class="stat-value">${totalRepos}</span> repos
        </span>
        <span class="stat-badge">
            ${icons.star}
            <span class="stat-value">${formatNumber(totalStars)}</span> stars
        </span>
        <span class="stat-badge">
            ${icons.fork}
            <span class="stat-value">${formatNumber(totalForks)}</span> forks
        </span>
        <span class="stat-badge">
            <span class="stat-value">${topLanguage}</span> top language
        </span>
    `;
}

/**
 * Filter and sort repositories
 */
function filterAndSortRepos() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const languageFilter = document.getElementById('language-filter').value;
    const licenseFilter = document.getElementById('license-filter').value;
    const wikiFilter = document.getElementById('wiki-filter').checked;
    const sortOption = document.getElementById('sort-select').value;
    
    filteredRepos = allRepos.filter(repo => {
        // Search filter
        const matchesSearch = !searchTerm || 
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
            (repo.topics && repo.topics.some(t => t.toLowerCase().includes(searchTerm)));
        
        // Language filter
        const matchesLanguage = languageFilter === 'all' || 
            (repo.language && repo.language.toLowerCase() === languageFilter);
        
        // License filter
        const repoLicenseType = getLicenseType(repo.license?.name);
        let matchesLicense = true;
        if (licenseFilter === 'none') {
            matchesLicense = !repo.license;
        } else if (licenseFilter !== 'all') {
            matchesLicense = repoLicenseType === licenseFilter;
        }
        
        // Wiki filter
        const matchesWiki = !wikiFilter || repo.has_wiki;
        
        return matchesSearch && matchesLanguage && matchesLicense && matchesWiki;
    });
    
    // Sort
    filteredRepos.sort((a, b) => {
        switch (sortOption) {
            case 'stars':
                return b.stargazers_count - a.stargazers_count;
            case 'forks':
                return b.forks_count - a.forks_count;
            case 'updated':
                return new Date(b.updated_at) - new Date(a.updated_at);
            case 'created':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return b.stargazers_count - a.stargazers_count;
        }
    });
    
    renderRepos();
    updateClearSearchButton();
}

/**
 * Render repositories to the grid
 */
function renderRepos() {
    const grid = document.getElementById('repos-grid');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const noResults = document.getElementById('no-results');
    
    if (filteredRepos.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    grid.innerHTML = filteredRepos.map(createRepoCard).join('');
    
    // Update last updated timestamp
    updateLastUpdated();
}

/**
 * Update clear search button visibility
 */
function updateClearSearchButton() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    clearBtn.style.display = searchInput.value ? 'flex' : 'none';
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('language-filter').value = 'all';
    document.getElementById('license-filter').value = 'all';
    document.getElementById('wiki-filter').checked = false;
    document.getElementById('sort-select').value = 'stars';
    filterAndSortRepos();
}

/**
 * Show error state
 */
function showError() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    loading.style.display = 'none';
    error.style.display = 'block';
}

/**
 * Hide error state
 */
function hideError() {
    const error = document.getElementById('error');
    error.style.display = 'none';
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" aria-label="Close notification">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
}

/**
 * Copy URL to clipboard
 */
async function copyToClipboard(url) {
    try {
        await navigator.clipboard.writeText(url);
        showToast('URL copied to clipboard!', 'success');
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('URL copied to clipboard!', 'success');
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterAndSortRepos);
    
    // Clear search button
    const clearBtn = document.getElementById('clear-search');
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAndSortRepos();
        searchInput.focus();
    });
    
    // Filters
    document.getElementById('language-filter').addEventListener('change', filterAndSortRepos);
    document.getElementById('license-filter').addEventListener('change', filterAndSortRepos);
    document.getElementById('wiki-filter').addEventListener('change', filterAndSortRepos);
    
    // Sort
    document.getElementById('sort-select').addEventListener('change', filterAndSortRepos);
    
    // Clear filters button
    document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);
    
    // Retry button
    document.getElementById('retry-btn').addEventListener('click', init);
    
    // Copy URL buttons (event delegation)
    document.getElementById('repos-grid').addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-url-btn');
        if (copyBtn) {
            const url = copyBtn.dataset.url;
            copyToClipboard(url);
        }
    });
    
    // Keyboard navigation for filters
    document.querySelectorAll('.filter-select, .sort-select, .search-input').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                el.blur();
            }
        });
    });
}

/**
 * Initialize the page
 */
async function init() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('repos-grid');
    
    hideError();
    loading.style.display = 'block';
    grid.innerHTML = '';
    
    try {
        allRepos = await fetchRepos();
        filteredRepos = [...allRepos];
        
        // Display organization stats
        displayOrgStats(allRepos);
        
        // Populate language filter
        populateLanguageFilter(allRepos);
        
        // Initial render
        renderRepos();
        
        // Initialize event listeners
        initEventListeners();
        
    } catch (error) {
        showError();
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
