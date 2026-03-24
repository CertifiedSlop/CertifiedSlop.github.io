// Certified Slop - Client-side JavaScript
const CONFIG = window.SLOP_CONFIG || {};
const REPOS = window.REPOS || [];

// State
let hoverCount = 0;
let scrollProgress = 0;
let unlockedAchievements = JSON.parse(localStorage.getItem('slop_achievements') || '[]');
let currentTheme = localStorage.getItem('slop_theme') || 'dark';
let petCount = parseInt(localStorage.getItem('slop_pet_count') || '0');
let scrollCount = parseInt(localStorage.getItem('slop_scroll_count') || '0');
let modalCloseCount = parseInt(localStorage.getItem('slop_modal_close_count') || '0');
let isSoundEnabled = localStorage.getItem('slop_sound_enabled') === 'true';
let isDramaticModeEnabled = false;
let uselessClickCount = 0;

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

// Mouse Trail - disabled due to performance issues
function initMouseTrail() {
  // Disabled - was causing lag
  return;
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

// Cursor Trail - disabled by default due to performance
let isCursorTrailEnabled = false;
let trailParticles = [];

function initCursorTrail() {
  // Don't initialize by default - user must enable it
  return;
}

function toggleCursorTrail() {
  const canvas = document.getElementById('cursor-trail');
  isCursorTrailEnabled = !isCursorTrailEnabled;

  if (isCursorTrailEnabled) {
    canvas.classList.remove('hidden');
    showToast('✨ Cursor trail enabled!');
  } else {
    canvas.classList.add('hidden');
    trailParticles = [];
    showToast('✨ Cursor trail disabled');
  }
}

// Secret Codes
let secretSequence = '';
const secretCodes = {
  'slop': () => {
    unlockAchievement('feeling_sloppy');
    spawnSlopStorm();
    showToast('🍦 Feeling Sloppy!');
  },
  'ai': () => {
    unlockAchievement('ai_believer');
    enableAITakeover();
    showToast('🤖 AI Takeover initiated!');
  },
  'certified': () => {
    unlockAchievement('certified_slop');
    enableCertifiedGlow();
    showToast('✨ Certified!');
  }
};

function initSecretCodes() {
  document.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      secretSequence += e.key.toLowerCase();
      if (secretSequence.length > 10) {
        secretSequence = secretSequence.slice(-10);
      }

      for (const code in secretCodes) {
        if (secretSequence.endsWith(code)) {
          secretCodes[code]();
          secretSequence = '';
          break;
        }
      }
    }
  });
}

function spawnSlopStorm() {
  const emojis = ['🍦', '🤖', '✨', '💻', '🎨'];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -50px;
        font-size: ${Math.random() * 30 + 20}px;
        pointer-events: none;
        z-index: 10000;
        animation: fall ${Math.random() * 2 + 2}s linear;
      `;
      document.body.appendChild(emoji);
      setTimeout(() => emoji.remove(), 4000);
    }, i * 100);
  }
}

function enableAITakeover() {
  document.querySelectorAll('h1, h2, h3, h4, h5, p, span, button').forEach(el => {
    if (el.textContent && !el.textContent.startsWith('AI')) {
      el.textContent = 'AI ' + el.textContent;
    }
  });
}

function enableCertifiedGlow() {
  document.body.style.boxShadow = 'inset 0 0 100px rgba(168, 85, 247, 0.5)';
  setTimeout(() => {
    document.body.style.boxShadow = '';
  }, 5000);
}

// Click Logo Easter Egg
let logoClickCount = 0;

function initLogoClicker() {
  const logo = document.querySelector('header img');
  if (!logo) return;

  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    logoClickCount++;
    if (logoClickCount >= 10) {
      unlockAchievement('slop_devotee');
      logo.style.animation = 'spin 1s ease-in-out infinite';
      logo.style.filter = 'drop-shadow(0 0 20px gold)';
      showToast('🙏 Slop Devotee unlocked!');
      logoClickCount = 0;
      setTimeout(() => {
        logo.style.animation = '';
        logo.style.filter = '';
      }, 5000);
    } else {
      showToast(`🔥 ${10 - logoClickCount} more clicks...`);
    }
  });
}

// Slop Meter
function initSlopMeter() {
  const meterEl = document.getElementById('slop-meter');
  if (!meterEl) return;

  let slopLevel = 97;
  setInterval(() => {
    const change = Math.floor(Math.random() * 5) - 2;
    slopLevel = Math.max(0, Math.min(100, slopLevel + change));
    meterEl.textContent = slopLevel;
  }, 3000);
}

// Sound Effects System
const soundEffects = {
  hover: new AudioContext(),
  click: new AudioContext(),
  achievement: new AudioContext()
};

function playSound(type) {
  if (!isSoundEnabled) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'hover') {
      oscillator.frequency.value = 440 + Math.random() * 200;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === 'click') {
      oscillator.frequency.value = 880;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'achievement') {
      // Play a little fanfare
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } else if (type === 'dramatic') {
      oscillator.frequency.value = 200;
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    }

    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    // Audio not supported
  }
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  localStorage.setItem('slop_sound_enabled', isSoundEnabled);

  const icon = document.getElementById('sound-icon');
  const text = document.getElementById('sound-text');

  if (isSoundEnabled) {
    icon.textContent = '🔊';
    text.textContent = 'Sound On';
    unlockAchievement('sound_enjoyer');
    showToast('🔊 Sound effects enabled!');
    playSound('click');
  } else {
    icon.textContent = '🔇';
    text.textContent = 'Sound Off';
    showToast('🔇 Sound effects disabled');
  }
}

// Pet the Slop Mascot
function initPetTheSlop() {
  const mascot = document.getElementById('slop-mascot');
  const petCountEl = document.getElementById('pet-count');
  const happinessBar = document.getElementById('pet-happiness');

  if (!mascot) return;

  // Update pet count display
  petCountEl.textContent = petCount;
  updateHappiness(happinessBar);

  mascot.addEventListener('click', () => {
    petCount++;
    petCountEl.textContent = petCount;
    localStorage.setItem('slop_pet_count', petCount);

    // Visual feedback
    mascot.classList.add('happy');
    setTimeout(() => mascot.classList.remove('happy'), 500);

    // Update happiness bar
    updateHappiness(happinessBar);

    // Play sound
    playSound('click');

    // Show pet counter animation
    showPetCounter(mascot);

    // Unlock achievement
    if (petCount >= 10) {
      unlockAchievement('slop_petter');
    }
  });

  // Keyboard support
  mascot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      mascot.click();
    }
  });
}

function updateHappiness(happinessBar) {
  if (!happinessBar) return;
  const happiness = Math.min(100, (petCount % 20) * 5);
  happinessBar.style.width = happiness + '%';
}

function showPetCounter(mascot) {
  const counter = document.createElement('span');
  counter.textContent = '+1 🐾';
  counter.className = 'pet-counter absolute text-purple-400 font-bold text-lg pointer-events-none';
  counter.style.left = '50%';
  counter.style.top = '-20px';
  counter.style.transform = 'translateX(-50%)';
  mascot.style.position = 'relative';
  mascot.appendChild(counter);
  setTimeout(() => counter.remove(), 500);
}

// Random Compliments
const compliments = [
  "You're doing great! 💕",
  "Nice scrolling! 🌟",
  "10/10 would watch you scroll again ⭐",
  "Your taste in slop is impeccable 🍦",
  "You're a certified slop enthusiast! ✨",
  "This tab looks great on you! 💅",
  "Keep being awesome! 🚀",
  "You're why we make slop! 💖",
  "Professional slop consumer detected! 🎯",
  "Your presence has been noted! 📝"
];

function initRandomCompliments() {
  setInterval(() => {
    if (Math.random() > 0.7) { // 30% chance every 30 seconds
      const compliment = compliments[Math.floor(Math.random() * compliments.length)];
      showCompliment(compliment);
    }
  }, 30000);
}

function showCompliment(text) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'compliment-popup flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-2xl shadow-pink-500/30 animate-slide-up border border-white/10';
  toast.innerHTML = `<span class="text-sm text-white font-medium">${text}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Dramatic Mode
function toggleDramaticMode() {
  isDramaticModeEnabled = !isDramaticModeEnabled;

  if (isDramaticModeEnabled) {
    document.body.classList.add('dramatic-mode');
    showToast('🎭 Dramatic mode enabled!');
    playSound('dramatic');
    unlockAchievement('dramatic_person');
  } else {
    document.body.classList.remove('dramatic-mode');
    showToast('🎭 Dramatic mode disabled');
  }
}

// Useless Chart
let chartInterval = null;
let isChartModalOpen = false;

function initUselessChart() {
  const container = document.getElementById('useless-chart-container');
  if (!container) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-yellow-500 to-orange-500', 'from-red-500 to-pink-500', 'from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500'];

  function updateChart() {
    container.innerHTML = '';
    days.forEach((day, i) => {
      const height = Math.floor(Math.random() * 80) + 20;
      const bar = document.createElement('div');
      bar.className = 'flex flex-col items-center gap-2';
      bar.innerHTML = `
        <div class="w-10 bg-gradient-to-t ${colors[i]} rounded-t-lg chart-bar" style="height: ${height}%; transform-origin: bottom;"></div>
        <span class="text-xs text-gray-500">${day}</span>
      `;
      container.appendChild(bar);
    });
  }

  updateChart();

  if (isChartModalOpen) {
    chartInterval = setInterval(updateChart, 2000);
  }
}

function toggleUselessChart() {
  const modal = document.getElementById('useless-chart-modal');
  isChartModalOpen = !isChartModalOpen;

  if (isChartModalOpen) {
    modal.classList.remove('hidden');
    initUselessChart();
    unlockAchievement('chart_watcher');

    // Start updating chart
    if (chartInterval) clearInterval(chartInterval);
    chartInterval = setInterval(initUselessChart, 2000);
  } else {
    modal.classList.add('hidden');
    if (chartInterval) clearInterval(chartInterval);
  }
}

// Settings Modal with Useless Toggles
function initSettingsModal() {
  const toggles = ['blurple', '3d', 'timetravel', 'gravity', 'darker-dark', 'more-useless'];

  toggles.forEach(toggleId => {
    const toggle = document.getElementById(`toggle-${toggleId}`);
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const isActive = toggle.classList.contains('active');
      toggle.setAttribute('aria-checked', isActive);

      // Show a toast for each toggle
      const messages = {
        'blurple': isActive ? '💜 Blurple enabled (it still doesn\'t exist)' : '💜 Blurple disabled',
        '3d': isActive ? '🔺 3D mode enabled (site is still 2D)' : '🔺 3D mode disabled',
        'timetravel': isActive ? '⏰ Time travel enabled (nothing changed)' : '⏰ Time travel disabled',
        'gravity': isActive ? '🍎 Gravity enabled (things fell 1px)' : '🍎 Gravity disabled',
        'darker-dark': isActive ? '🌑 Darker dark mode enabled (it\'s the same)' : '🌑 Darker dark mode disabled',
        'more-useless': isActive ? '🤷 More useless buttons enabled (check the feature bar!)' : '🤷 More useless buttons disabled'
      };

      showToast(messages[toggleId]);
      playSound('click');
    });

    // Keyboard support
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  });
}

function toggleSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

// Useless Button
function initUselessButton() {
  const button = document.getElementById('the-useless-button');
  const loadingContainer = document.getElementById('useless-loading-container');

  if (!button) return;

  button.addEventListener('click', () => {
    uselessClickCount++;
    playSound('click');

    if (uselessClickCount >= 5) {
      unlockAchievement('uselessly_curious');
    }

    // Show loading bar that stays at 99%
    loadingContainer.classList.remove('hidden');
    button.classList.add('hidden');

    // Never complete loading
    setTimeout(() => {
      loadingContainer.classList.add('hidden');
      button.classList.remove('hidden');
      showToast('🤷 Loading failed. Try again?');
    }, 10000);
  });
}

function toggleUselessButtonModal() {
  const modal = document.getElementById('useless-button-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
    // Reset the useless button
    const button = document.getElementById('the-useless-button');
    const loadingContainer = document.getElementById('useless-loading-container');
    if (button) button.classList.remove('hidden');
    if (loadingContainer) loadingContainer.classList.add('hidden');
  }
}

// Scroll counter for anti-achievement
function updateScrollCount() {
  scrollCount++;
  localStorage.setItem('slop_scroll_count', scrollCount);

  if (scrollCount >= 100) {
    unlockAchievement('professional_scroller');
  }
}

// Tab hoarder achievement (10 minutes)
function initTabHoarder() {
  setTimeout(() => {
    unlockAchievement('tab_hoarder');
  }, 600000); // 10 minutes
}

// Confetti Cannon
function spawnConfetti() {
  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#22d3ee', '#4ade80', '#fbbf24'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -20px;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 10001;
        animation: confetti-fall ${Math.random() * 2 + 2}s linear;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, i * 50);
  }
}

// Enhanced unlockAchievement with confetti - disabled due to performance
const originalUnlockAchievement = unlockAchievement;
unlockAchievement = function(id) {
  originalUnlockAchievement(id);
  // spawnConfetti(); - disabled due to lag
};

// Scroll Tracker
function initScrollTracker() {
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.getElementById('scroll-progress').style.width = `${scrollProgress}%`;

    // Count scroll events (only when actually scrolling)
    if (Math.abs(scrollTop - lastScrollTop) > 10) {
      updateScrollCount();
      lastScrollTop = scrollTop;
    }

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
      playSound('hover');
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
    modalCloseCount++;
    localStorage.setItem('slop_modal_close_count', modalCloseCount);
    if (modalCloseCount >= 5) {
      unlockAchievement('commitment_issues');
    }
  });

  // Slop Scores modal
  document.getElementById('slop-scores-btn').addEventListener('click', () => {
    document.getElementById('slop-scores-modal').classList.remove('hidden');
    renderSlopScores();
    unlockAchievement('slop_critic');
  });

  document.getElementById('close-slop-scores').addEventListener('click', () => {
    document.getElementById('slop-scores-modal').classList.add('hidden');
    modalCloseCount++;
    localStorage.setItem('slop_modal_close_count', modalCloseCount);
    if (modalCloseCount >= 5) {
      unlockAchievement('commitment_issues');
    }
  });

  // Useless Chart modal
  document.getElementById('useless-chart-btn').addEventListener('click', toggleUselessChart);
  document.getElementById('close-useless-chart').addEventListener('click', () => {
    document.getElementById('useless-chart-modal').classList.add('hidden');
    isChartModalOpen = false;
    if (chartInterval) clearInterval(chartInterval);
  });

  // Settings modal
  document.getElementById('settings-btn').addEventListener('click', toggleSettingsModal);
  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
  });

  // Useless Button modal
  document.getElementById('dramatic-mode-btn').addEventListener('click', toggleDramaticMode);
  document.getElementById('useless-button-modal-btn')?.addEventListener('click', toggleUselessButtonModal);
  document.getElementById('close-useless-button').addEventListener('click', () => {
    document.getElementById('useless-button-modal').classList.add('hidden');
  });

  // Close modals on backdrop click
  document.querySelectorAll('#achievement-modal, #slop-scores-modal, #repo-detail-modal, #useless-chart-modal, #settings-modal, #useless-button-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.fixed.inset-0')) {
        modal.classList.add('hidden');
        modalCloseCount++;
        localStorage.setItem('slop_modal_close_count', modalCloseCount);
        if (modalCloseCount >= 5) {
          unlockAchievement('commitment_issues');
        }
      }
    });
  });

  // Repository detail modal
  document.getElementById('close-repo-detail').addEventListener('click', () => {
    document.getElementById('repo-detail-modal').classList.add('hidden');
    modalCloseCount++;
    localStorage.setItem('slop_modal_close_count', modalCloseCount);
    if (modalCloseCount >= 5) {
      unlockAchievement('commitment_issues');
    }
  });

  document.getElementById('modal-repo-close').addEventListener('click', () => {
    document.getElementById('repo-detail-modal').classList.add('hidden');
    modalCloseCount++;
    localStorage.setItem('slop_modal_close_count', modalCloseCount);
    if (modalCloseCount >= 5) {
      unlockAchievement('commitment_issues');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('#repo-detail-modal, #useless-chart-modal, #settings-modal, #useless-button-modal').forEach(modal => {
        modal.classList.add('hidden');
        modalCloseCount++;
        localStorage.setItem('slop_modal_close_count', modalCloseCount);
        if (modalCloseCount >= 5) {
          unlockAchievement('commitment_issues');
        }
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
  // initMouseTrail() - disabled due to lag
  initKonamiCode();
  initScrollTracker();
  initSearch();
  initHoverTracking();
  initModals();
  initVisitorCounter();
  initCursorTrail();
  initSecretCodes();
  initLogoClicker();
  initSlopMeter();
  initPetTheSlop();
  initSettingsModal();
  initUselessButton();
  initRandomCompliments();
  initTabHoarder();

  // Update sound toggle UI
  if (isSoundEnabled) {
    document.getElementById('sound-icon').textContent = '🔊';
    document.getElementById('sound-text').textContent = 'Sound On';
  }

  document.getElementById('theme-toggle').addEventListener('click', cycleTheme);
  document.getElementById('matrix-rain-btn').addEventListener('click', toggleMatrixRain);
  document.getElementById('comic-sans-btn').addEventListener('click', toggleComicSans);
  document.getElementById('cursor-trail-btn').addEventListener('click', toggleCursorTrail);
  document.getElementById('sound-toggle-btn').addEventListener('click', toggleSound);
  document.getElementById('useless-chart-btn').addEventListener('click', toggleUselessChart);
  document.getElementById('settings-btn').addEventListener('click', toggleSettingsModal);

  // Add click handler for Join Us button (Rick Roll achievement)
  const joinBtn = document.querySelector('a[href="/watch"]');
  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      unlockAchievement('rick_rolled');
    });
  }

  // Add click handler for Matrix button achievement
  const originalToggleMatrix = toggleMatrixRain;
  toggleMatrixRain = function() {
    originalToggleMatrix();
    if (isMatrixRainEnabled) {
      unlockAchievement('matrix_hacker');
    }
  };

  // Add click handler for Comic Sans achievement
  const originalToggleComic = toggleComicSans;
  toggleComicSans = function() {
    originalToggleComic();
    if (isComicSansEnabled) {
      unlockAchievement('design_criminal');
    }
  };
});
