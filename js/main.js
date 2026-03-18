// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const ORG_NAME = 'CertifiedSlop';

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
    </svg>`
};

/**
 * Fetch repositories from GitHub API
 */
async function fetchRepos() {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/orgs/${ORG_NAME}/repos?per_page=100&type=all`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // Filter out license name entries (false positives from API)
        return repos.filter(repo => 
            !repo.name.startsWith('GNU') && 
            !repo.name.startsWith('MIT')
        );
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
 * Create repo card HTML
 */
function createRepoCard(repo) {
    const description = repo.description || 'No description provided';
    const language = repo.language || 'Unknown';
    const languageClass = getLanguageClass(repo.language);
    const license = repo.license ? repo.license.name : 'No license';
    const hasWiki = repo.has_wiki;
    
    // Truncate long license names
    const shortLicense = license.length > 20 
        ? license.replace('GNU ', '').replace('General Public License', 'GPL').replace('Affero ', 'AGPL ')
        : license;
    
    return `
        <article class="repo-card">
            <div class="repo-header">
                <a href="${repo.html_url}" class="repo-name" target="_blank" rel="noopener noreferrer">
                    ${icons.repo}
                    ${repo.name}
                </a>
                ${hasWiki ? `
                    <a href="${repo.html_url}/wiki" class="wiki-link" target="_blank" rel="noopener noreferrer" title="View Wiki">
                        ${icons.wiki} Wiki
                    </a>
                ` : ''}
            </div>
            
            <p class="repo-description">${description}</p>
            
            <div class="repo-meta">
                ${language !== 'Unknown' ? `
                    <span class="badge badge-language ${languageClass}">
                        ${language}
                    </span>
                ` : ''}
                
                ${license !== 'No license' ? `
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
        </article>
    `;
}

/**
 * Render repositories to the grid
 */
function renderRepos(repos) {
    const grid = document.getElementById('repos-grid');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    // Hide loading, show grid
    loading.style.display = 'none';
    
    if (repos.length === 0) {
        grid.innerHTML = '<p class="no-repos">No repositories found.</p>';
        return;
    }
    
    // Sort repos: pinned first (by stars), then alphabetically
    const sortedRepos = [...repos].sort((a, b) => {
        // Prioritize repos with more stars
        if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
        }
        // Then sort alphabetically
        return a.name.localeCompare(b.name);
    });
    
    grid.innerHTML = sortedRepos.map(createRepoCard).join('');
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
 * Initialize the page
 */
async function init() {
    try {
        const repos = await fetchRepos();
        renderRepos(repos);
    } catch (error) {
        showError();
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
