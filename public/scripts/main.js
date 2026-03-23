// Certified Slop - Client-side JavaScript
const CONFIG = window.SLOP_CONFIG || {};
const REPOS = window.REPOS || [];

// State
let hoverCount = 0;
let scrollProgress = 0;
let unlockedAchievements = JSON.parse(localStorage.getItem('slop_achievements') || '[]');
let currentTheme = localStorage.getItem('slop_theme') || 'dark';

// Achievement System
function unlockAchievement(id) {
  if (!unlockedAchievements.includes(id)) {
    unlockedAchievements.push(id);
    localStorage.setItem('slop_achievements', JSON.stringify(unlockedAchievements));
    const achievement = CONFIG.ACHIEVEMENTS[id];
    if (achievement) {
      showAchievementNotification(achievement);
      updateAchievementProgress();
    }
  }
}

function showAchievementNotification(achievement) {
  const container = document.getElementById('achievement-notifications');
  const notification = document.createElement('div');
  notification.className = 'flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/30 animate-slide-up border border-white/10';
  notification.innerHTML = `
    <span class="text-3xl">${achievement.icon}</span>
    <div>
      <p class="font-bold text-sm text-white">Achievement Unlocked!</p>
      <p class="text-xs text-white/80">${achievement.title}</p>
    </div>
  `;
  container.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function updateAchievementProgress() {
  const progress = Math.round((unlockedAchievements.length / Object.keys(CONFIG.ACHIEVEMENTS).length) * 100);
  document.getElementById('achievement-progress').textContent = progress;
  document.getElementById('modal-achievement-progress').textContent = progress;
}

function renderAchievementsModal() {
  const unlockedContainer = document.getElementById('unlocked-achievements');
  const lockedContainer = document.getElementById('locked-achievements');

  unlockedContainer.innerHTML = '';
  lockedContainer.innerHTML = '';

  Object.values(CONFIG.ACHIEVEMENTS).forEach(achievement => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    const html = `
      <div class="flex items-center gap-3 p-4 rounded-2xl transition-all ${isUnlocked ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500/50' : 'bg-gray-500/10 border border-gray-500/30 opacity-50'}">
        <span class="text-4xl ${isUnlocked ? '' : 'grayscale'} transition-transform ${isUnlocked ? 'hover:scale-110' : ''}">${achievement.icon}</span>
        <div>
          <p class="font-semibold ${isUnlocked ? 'text-green-400' : 'text-gray-400'}">${achievement.title}</p>
          <p class="text-xs text-gray-500 mt-0.5">${achievement.desc}</p>
        </div>
      </div>
    `;
    if (isUnlocked) {
      unlockedContainer.innerHTML += html;
    } else {
      lockedContainer.innerHTML += html;
    }
  });
}

// Theme System
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('slop_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('current-theme').textContent = theme;
}

function cycleTheme() {
  const themes = ['dark', 'darker', 'darkest'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  applyTheme(nextTheme);
  unlockAchievement('theme_explorer');
}

// Toast Notifications
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'flex items-center gap-3 px-5 py-4 bg-card border border-white/10 rounded-2xl shadow-xl animate-slide-up';
  toast.innerHTML = `<span class="text-sm text-gray-300 font-medium">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Typing Effect
function initTypingEffect() {
  const taglineElement = document.querySelector('#tagline span:first-child');
  if (!taglineElement) return;
  
  let index = 0;
  let currentTagline = 0;
  let isTyping = true;
  const taglines = CONFIG.TAGLINES || [];
  
  function type() {
    if (isTyping) {
      if (index < taglines[currentTagline].length) {
        taglineElement.textContent = taglines[currentTagline].slice(0, index + 1);
        index++;
        setTimeout(type, 50 + Math.random() * 50);
      } else {
        isTyping = false;
        setTimeout(type, 2000);
      }
    } else {
      if (index > 0) {
        taglineElement.textContent = taglines[currentTagline].slice(0, index - 1);
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
}

// Particle System
function initParticleSystem() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
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
}

// Mouse Trail
function initMouseTrail() {
  const canvas = document.createElement('canvas');
  canvas.id = 'mouse-trail-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  
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
}

// Konami Code
function initKonamiCode() {
  let sequence = [];
  const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    sequence.push(key);
    if (sequence.length > konamiCode.length) {
      sequence.shift();
    }
    if (sequence.join(',') === konamiCode.join(',')) {
      unlockAchievement('konami_master');
      document.body.classList.add('disco-mode');
      showToast('🎮 DISCO MODE ACTIVATED! 🎮');
      setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
      sequence = [];
    }
  });
}

// Matrix Rain
let matrixInterval = null;
let isMatrixRainEnabled = false;

function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const characters = katakana.split('');

  const fontSize = 16;
  const columns = canvas.width / fontSize;
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = characters[Math.floor(Math.random() * characters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(draw, 33);
}

function toggleMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  isMatrixRainEnabled = !isMatrixRainEnabled;

  if (isMatrixRainEnabled) {
    canvas.classList.remove('hidden');
    initMatrixRain();
    showToast('💻 Welcome to the Matrix!');
  } else {
    canvas.classList.add('hidden');
    if (matrixInterval) clearInterval(matrixInterval);
    showToast('💻 Left the Matrix');
  }
}

// Handle window resize for Matrix Rain
window.addEventListener('resize', () => {
  if (isMatrixRainEnabled) {
    const canvas = document.getElementById('matrix-rain');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Comic Sans Mode
let isComicSansEnabled = false;

function toggleComicSans() {
  isComicSansEnabled = !isComicSansEnabled;

  if (isComicSansEnabled) {
    document.body.style.fontFamily = '"Comic Sans MS", "Comic Sans", cursive';
    document.querySelectorAll('*').forEach(el => {
      el.style.fontFamily = '"Comic Sans MS", "Comic Sans", cursive';
    });
    showToast('🎨 Art mode enabled!');
  } else {
    document.body.style.fontFamily = '';
    document.querySelectorAll('*').forEach(el => {
      el.style.fontFamily = '';
    });
    showToast('🎨 Art mode disabled');
  }
}

// Fake Visitor Counter
function initVisitorCounter() {
  const counterEl = document.getElementById('visitor-count');
  if (!counterEl) return;

  let count = 4827391;

  // Increment randomly every few seconds
  setInterval(() => {
    if (Math.random() > 0.3) {
      count += Math.floor(Math.random() * 5) + 1;
      counterEl.textContent = count.toLocaleString();
    }
  }, 2000);
}

// Scroll Tracker
function initScrollTracker() {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.getElementById('scroll-progress').style.width = `${scrollProgress}%`;
    
    if (scrollProgress >= 10) unlockAchievement('first_scroll');
    if (scrollProgress >= 50) unlockAchievement('scroll_halfway');
  });
}

// Search
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const repoCards = document.querySelectorAll('#repo-grid article');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.trim()) unlockAchievement('search_detective');
    
    repoCards.forEach(card => {
      const name = card.dataset.repoName.toLowerCase();
      const sentiment = card.dataset.sentiment.toLowerCase();
      if (name.includes(query) || sentiment.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Hover tracking
function initHoverTracking() {
  document.querySelectorAll('#repo-grid article').forEach(card => {
    card.addEventListener('mouseenter', () => {
      hoverCount++;
      if (hoverCount >= 10) unlockAchievement('hover_master');
    });

    card.addEventListener('click', () => {
      const repoName = card.dataset.repoName;
      const repo = REPOS.find(r => r.name === repoName);
      if (repo) {
        openRepoDetail(repo);
        unlockAchievement('repo_explorer');
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const repoName = card.dataset.repoName;
        const repo = REPOS.find(r => r.name === repoName);
        if (repo) {
          openRepoDetail(repo);
          unlockAchievement('repo_explorer');
        }
      }
    });
  });
}

// Modals
function initModals() {
  // Achievements modal
  document.getElementById('achievements-btn').addEventListener('click', () => {
    document.getElementById('achievement-modal').classList.remove('hidden');
    renderAchievementsModal();
  });
  
  document.getElementById('close-achievements').addEventListener('click', () => {
    document.getElementById('achievement-modal').classList.add('hidden');
  });
  
  // Slop Scores modal
  document.getElementById('slop-scores-btn').addEventListener('click', () => {
    document.getElementById('slop-scores-modal').classList.remove('hidden');
    renderSlopScores();
    unlockAchievement('slop_critic');
  });
  
  document.getElementById('close-slop-scores').addEventListener('click', () => {
    document.getElementById('slop-scores-modal').classList.add('hidden');
  });
  
  // Close modals on backdrop click
  document.querySelectorAll('#achievement-modal, #slop-scores-modal, #repo-detail-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.fixed.inset-0')) {
        modal.classList.add('hidden');
      }
    });
  });

  // Repository detail modal
  document.getElementById('close-repo-detail').addEventListener('click', () => {
    document.getElementById('repo-detail-modal').classList.add('hidden');
  });

  document.getElementById('modal-repo-close').addEventListener('click', () => {
    document.getElementById('repo-detail-modal').classList.add('hidden');
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('#repo-detail-modal').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
  });
}

// Repository Detail Modal
function openRepoDetail(repo) {
  const modal = document.getElementById('repo-detail-modal');

  // Set repo name
  document.getElementById('modal-repo-name').textContent = repo.name;

  // Set description
  const descEl = document.getElementById('modal-repo-description');
  descEl.textContent = repo.description || 'No description provided. Just pure slop.';

  // Set topics
  const topicsEl = document.getElementById('modal-repo-topics');
  topicsEl.innerHTML = '';
  if (repo.topics && repo.topics.length > 0) {
    repo.topics.forEach(topic => {
      const topicEl = document.createElement('span');
      topicEl.className = 'px-3 py-1.5 bg-purple-500/10 text-purple-300 text-sm rounded-xl border border-purple-500/20';
      topicEl.textContent = '#' + topic;
      topicsEl.appendChild(topicEl);
    });
  } else {
    topicsEl.innerHTML = '<span class="text-gray-500 text-sm">No topics</span>';
  }

  // Set stats
  document.getElementById('modal-repo-stars').textContent = formatNumber(repo.stargazers_count);
  document.getElementById('modal-repo-forks').textContent = formatNumber(repo.forks_count);
  document.getElementById('modal-repo-language').textContent = repo.language || 'N/A';
  document.getElementById('modal-repo-branch').textContent = repo.default_branch || 'main';

  // Set dates
  document.getElementById('modal-repo-created').textContent = getRelativeTimeFull(repo.created_at);
  document.getElementById('modal-repo-updated').textContent = getRelativeTimeFull(repo.updated_at);

  // Set homepage
  const homepageContainer = document.getElementById('modal-repo-homepage-container');
  const homepageEl = document.getElementById('modal-repo-homepage');
  if (repo.homepage) {
    homepageContainer.classList.remove('hidden');
    homepageEl.href = repo.homepage;
    homepageEl.textContent = repo.homepage.replace(/^https?:\/\//, '');
  } else {
    homepageContainer.classList.add('hidden');
  }

  // Set archived badge
  const archivedEl = document.getElementById('modal-repo-archived');
  if (repo.archived) {
    archivedEl.classList.remove('hidden');
  } else {
    archivedEl.classList.add('hidden');
  }

  // Set GitHub link
  document.getElementById('modal-repo-github').href = repo.html_url;

  // Show modal
  modal.classList.remove('hidden');
}

function getRelativeTimeFull(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

// Slop Scores
function renderSlopScores() {
  const container = document.getElementById('slop-scores-grid');
  container.innerHTML = '';

  REPOS.forEach(repo => {
    const score = calculateSlopScore(repo);
    const rating = getSlopRating(score);

    const scoreColor = score >= 70 ? 'from-green-400 to-emerald-400' : score >= 50 ? 'from-yellow-400 to-orange-400' : 'from-gray-400 to-zinc-400';

    container.innerHTML += `
      <div class="group p-5 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white truncate pr-2">${repo.name}</h3>
          <span class="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">${rating.emoji}</span>
        </div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-4xl font-black bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent">${score}</span>
          <span class="text-xs text-gray-400 font-medium px-2 py-1 bg-white/5 rounded-lg">${rating.label}</span>
        </div>
        <div class="h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r ${scoreColor} rounded-full transition-all duration-500" style="width: ${score}%"></div>
        </div>
      </div>
    `;
  });
}

function calculateSlopScore(repo) {
  const nameSlop = repo.name.includes('AI') ? 20 : 0;
  const descriptionSlop = repo.description ? Math.min(repo.description.length / 10, 20) : 10;
  const starSlop = Math.max(0, 30 - (repo.stargazers_count / 10));
  const topicSlop = Math.min((repo.topics?.length || 0) * 5, 20);
  const randomSlop = Math.random() * 10;
  const aiBonus = (repo.name.match(/AI/gi)?.length || 0) * 5;
  return Math.min(100, Math.round(nameSlop + descriptionSlop + starSlop + topicSlop + randomSlop + aiBonus));
}

function getSlopRating(score) {
  if (score >= 90) return { label: 'Maximum Slop', emoji: '🏆' };
  if (score >= 70) return { label: 'Premium Slop', emoji: '✨' };
  if (score >= 50) return { label: 'Certified Slop', emoji: '✅' };
  if (score >= 30) return { label: 'Questionable Slop', emoji: '🤔' };
  return { label: 'Not Enough Slop', emoji: '😢' };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  updateAchievementProgress();
  initTypingEffect();
  initParticleSystem();
  initMouseTrail();
  initKonamiCode();
  initScrollTracker();
  initSearch();
  initHoverTracking();
  initModals();
  initVisitorCounter();

  document.getElementById('theme-toggle').addEventListener('click', cycleTheme);
  document.getElementById('matrix-rain-btn').addEventListener('click', toggleMatrixRain);
  document.getElementById('comic-sans-btn').addEventListener('click', toggleComicSans);
});
