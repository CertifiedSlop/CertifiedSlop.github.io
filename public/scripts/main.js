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
let factViewCount = parseInt(localStorage.getItem('slop_fact_count') || '0');
let screenShakeCount = 0;
let isMirrorModeEnabled = false;
let isZenModeEnabled = false;
let virtualPetState = JSON.parse(localStorage.getItem('slop_virtual_pet') || '{"happiness": 50, "fed": true, "clean": true}');
let musicInterval = null;
let isMusicEnabled = false;

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

// Weather Widget - Shows weather in random cities
const randomCities = ['Reykjavik', 'Ulaanbaatar', 'Vatican City', 'Nauru', 'Tuvalu', 'San Marino', 'Liechtenstein', 'Monaco'];
const weatherConditions = ['☀️ Sunny', '🌧️ Rainy', '⛈️ Stormy', '🌨️ Snowy', '🌫️ Foggy', '☁️ Cloudy', '🌈 Rainbow', '🌪️ Tornado'];

function initWeatherWidget() {
  const city = randomCities[Math.floor(Math.random() * randomCities.length)];
  const temp = Math.floor(Math.random() * 40) - 10;
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  return { city, temp, condition };
}

function toggleWeatherModal() {
  const modal = document.getElementById('weather-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    const weather = initWeatherWidget();
    document.getElementById('weather-city').textContent = weather.city;
    document.getElementById('weather-temp').textContent = `${weather.temp}°C`;
    document.getElementById('weather-condition').textContent = weather.condition;
    modal.classList.remove('hidden');
    unlockAchievement('weather_watcher');
  } else {
    modal.classList.add('hidden');
  }
}

// SlopCoin Crypto Ticker
let cryptoPrices = {
  SLP: { name: 'SlopCoin', price: 0.0042, change: 0 },
  AIT: { name: 'AICoin', price: 69.42, change: 0 },
  MOON: { name: 'MoonToken', price: 0.0001, change: 0 }
};

function updateCryptoPrices() {
  Object.keys(cryptoPrices).forEach(symbol => {
    const coin = cryptoPrices[symbol];
    const oldPrice = coin.price;
    const changePercent = (Math.random() - 0.5) * 20;
    coin.price = Math.max(0.0001, coin.price * (1 + changePercent / 100));
    coin.change = ((coin.price - oldPrice) / oldPrice) * 100;
  });
}

function formatCryptoPrice(price) {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(2)}`;
}

function toggleCryptoModal() {
  const modal = document.getElementById('crypto-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    updateCryptoModalContent();
    modal.classList.remove('hidden');
    unlockAchievement('crypto_believer');

    // Update prices every 3 seconds
    if (window.cryptoInterval) clearInterval(window.cryptoInterval);
    window.cryptoInterval = setInterval(() => {
      updateCryptoPrices();
      updateCryptoModalContent();
    }, 3000);
  } else {
    modal.classList.add('hidden');
    if (window.cryptoInterval) clearInterval(window.cryptoInterval);
  }
}

function updateCryptoModalContent() {
  const container = document.getElementById('crypto-prices');
  if (!container) return;

  container.innerHTML = '';
  Object.entries(cryptoPrices).forEach(([symbol, coin]) => {
    const isUp = coin.change >= 0;
    const arrow = isUp ? '📈' : '📉';
    const changeClass = isUp ? 'crypto-up' : 'crypto-down';
    const changeSign = isUp ? '+' : '';

    container.innerHTML += `
      <div class="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <p class="text-white font-bold">${coin.name}</p>
          <p class="text-xs text-gray-500">${symbol}</p>
        </div>
        <div class="text-right">
          <p class="text-white font-mono">${formatCryptoPrice(coin.price)}</p>
          <p class="text-xs ${changeClass}">${arrow} ${changeSign}${coin.change.toFixed(2)}%</p>
        </div>
      </div>
    `;
  });

  container.innerHTML += `
    <div class="col-span-3 text-center mt-4">
      <p class="text-xs text-gray-500 italic">🚨 Not financial advice, it's slop 🚨</p>
    </div>
  `;
}

// Useless Facts
const uselessFacts = [
  "A group of flamingos is called a 'flamboyance' 🦩",
  "Honey never spoils (unlike this slop) 🍯",
  "The slop was here before you 🍦",
  "Bananas are berries, but strawberries aren't 🍌",
  "Octopuses have three hearts 🐙",
  "The inventor of Pringles is now buried in a Pringles can 🥔",
  "Wombat poop is cube-shaped 💩",
  "There are more fake flamingos in the world than real ones 🦩",
  "You've been breathing this whole time 😮‍💨",
  "This fact is as useless as this website 🤷",
  "Slop makes up approximately 70% of the universe 🌌",
  "Reading this fact wasted 3 seconds of your life ⏰",
  "The word 'slop' has 4 letters... just like 'AI' ✨",
  "Your tongue can't taste its own tip 👅",
  "Every 60 seconds in Africa, a minute passes 🌍"
];

function toggleFactsModal() {
  const modal = document.getElementById('facts-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    showRandomFact();
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function showRandomFact() {
  const factEl = document.getElementById('current-fact');
  const fact = uselessFacts[Math.floor(Math.random() * uselessFacts.length)];

  if (factEl) {
    factEl.textContent = fact;
    factEl.classList.remove('fact-slide-in');
    void factEl.offsetWidth; // Trigger reflow
    factEl.classList.add('fact-slide-in');
  }

  factViewCount++;
  localStorage.setItem('slop_fact_count', factViewCount);

  if (factViewCount >= 5) {
    unlockAchievement('fact_collector');
  }
}

// Screen Shake
function toggleScreenShake() {
  document.body.classList.add('screen-shake');
  screenShakeCount++;
  playSound('dramatic');

  if (screenShakeCount >= 3) {
    unlockAchievement('chaos_embracer');
  }

  setTimeout(() => {
    document.body.classList.remove('screen-shake');
  }, 500);

  showToast('📳 Feel the slop!');
}

// Mirror Mode
function toggleMirrorMode() {
  isMirrorModeEnabled = !isMirrorModeEnabled;

  if (isMirrorModeEnabled) {
    document.body.classList.add('mirror-mode');
    showToast('🪞 Mirror mode enabled!');
    unlockAchievement('mirror_mirror');
  } else {
    document.body.classList.remove('mirror-mode');
    showToast('🪞 Mirror mode disabled');
  }
}

// Zen Mode
function toggleZenMode() {
  isZenModeEnabled = !isZenModeEnabled;

  if (isZenModeEnabled) {
    document.body.classList.add('zen-mode-active');
    document.getElementById('zen-overlay').classList.remove('hidden');
    unlockAchievement('zen_master');

    // Auto-exit after 10 seconds
    setTimeout(() => {
      if (isZenModeEnabled) {
        toggleZenMode();
      }
    }, 10000);
  } else {
    document.body.classList.remove('zen-mode-active');
    document.getElementById('zen-overlay').classList.add('hidden');
  }
}

function exitZenMode() {
  toggleZenMode();
  showToast('☯️ You are one with the slop');
}

// Breathing Exercise
let breathingInterval = null;
let breathingPhase = 0;

function toggleBreathingModal() {
  const modal = document.getElementById('breathing-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    modal.classList.remove('hidden');
    startBreathingExercise();
  } else {
    modal.classList.add('hidden');
    if (breathingInterval) clearInterval(breathingInterval);
  }
}

function startBreathingExercise() {
  const circle = document.getElementById('breathing-circle');
  const instruction = document.getElementById('breathing-instruction');
  const phases = ['Breathe in... you are slop', 'Hold... you are one with slop', 'Breathe out... you are slop'];

  breathingPhase = 0;
  instruction.textContent = phases[0];

  breathingInterval = setInterval(() => {
    breathingPhase = (breathingPhase + 1) % 3;
    instruction.textContent = phases[breathingPhase];

    if (breathingPhase === 2) {
      // Completed a full cycle
      unlockAchievement('breathe_easy');
    }
  }, 4000);
}

// Virtual Slop Pet
function initVirtualPet() {
  updateVirtualPetDisplay();
}

function updateVirtualPetDisplay() {
  const petEl = document.getElementById('virtual-pet-emoji');
  const happinessEl = document.getElementById('pet-happiness-bar');

  if (!petEl || !happinessEl) return;

  const { happiness, fed, clean } = virtualPetState;

  // Update emoji based on state
  if (happiness >= 70) {
    petEl.textContent = '🥣';
    petEl.classList.add('virtual-pet-happy');
    petEl.classList.remove('virtual-pet-sad');
  } else if (happiness >= 30) {
    petEl.textContent = '🥣';
    petEl.classList.remove('virtual-pet-happy', 'virtual-pet-sad');
  } else {
    petEl.textContent = '🥣';
    petEl.classList.add('virtual-pet-sad');
    petEl.classList.remove('virtual-pet-happy');
  }

  // Update happiness bar
  happinessEl.style.width = `${happiness}%`;

  // Update status indicators
  document.getElementById('pet-fed-status').textContent = fed ? '✅' : '❌';
  document.getElementById('pet-clean-status').textContent = clean ? '✅' : '❌';
}

function toggleVirtualPetModal() {
  const modal = document.getElementById('virtual-pet-modal');
  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    initVirtualPet();
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function petVirtualPet() {
  virtualPetState.happiness = Math.min(100, virtualPetState.happiness + 10);
  saveVirtualPetState();
  updateVirtualPetDisplay();
  showToast('💕 Virtual slop is happy!');
}

function feedVirtualPet() {
  virtualPetState.fed = true;
  virtualPetState.happiness = Math.min(100, virtualPetState.happiness + 5);
  saveVirtualPetState();
  updateVirtualPetDisplay();
  showToast('🍽️ Virtual slop has been fed!');
}

function cleanVirtualPet() {
  virtualPetState.clean = true;
  virtualPetState.happiness = Math.min(100, virtualPetState.happiness + 5);
  saveVirtualPetState();
  updateVirtualPetDisplay();
  showToast('🧹 Virtual slop is now clean!');
}

function saveVirtualPetState() {
  localStorage.setItem('slop_virtual_pet', JSON.stringify(virtualPetState));

  // Check for achievement
  if (virtualPetState.happiness >= 100) {
    unlockAchievement('slop_parent');
  }
}

// Decay virtual pet over time
function initVirtualPetDecay() {
  setInterval(() => {
    if (virtualPetState.happiness > 0) {
      virtualPetState.happiness -= 1;
    }
    virtualPetState.fed = false;
    virtualPetState.clean = false;
    saveVirtualPetState();
  }, 30000); // Every 30 seconds
}

// Elevator Music
function toggleElevatorMusic() {
  isMusicEnabled = !isMusicEnabled;

  if (isMusicEnabled) {
    playElevatorMusic();
    showToast('🎵 Elevator music enabled!');
    unlockAchievement('music_appreciator');
  } else {
    stopElevatorMusic();
    showToast('🎵 Elevator music stopped');
  }
}

function playElevatorMusic() {
  // Procedurally generated ambient muzak
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25];
  let noteIndex = 0;

  function playNote() {
    if (!isMusicEnabled) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = notes[noteIndex];
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);

      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(() => ctx.close(), 1500);
    } catch (e) {
      // Audio not supported
    }
  }

  if (musicInterval) clearInterval(musicInterval);
  musicInterval = setInterval(playNote, 1500);
}

function stopElevatorMusic() {
  if (musicInterval) clearInterval(musicInterval);
  musicInterval = null;
}

// Loading Screen
const loadingMessages = [
  { text: "Heating up the slop...", sub: "This is definitely necessary" },
  { text: "Convincing the slop to appear...", sub: "The slop is shy" },
  { text: "Downloading more RAM...", sub: "Almost there..." },
  { text: "Brewing coffee for the slop...", sub: "Caffeinated slop loads faster" },
  { text: "Polishing the pixels...", sub: "Sparkling clean!" },
  { text: "Warming up the servers...", sub: "Brrr, it's cold in here" },
  { text: "Assembling the slop...", sub: "Like IKEA furniture" },
  { text: "Consulting the slop oracle...", sub: "The oracle says: soon" },
  { text: "Generating more slop...", sub: "Slop production at 110%" },
  { text: "Almost ready...", sub: "Patience is a virtue" }
];

function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingText = document.getElementById('loading-text');
  const loadingSubtext = document.getElementById('loading-subtext');
  const loadingProgress = document.getElementById('loading-progress');

  let progress = 0;
  let messageIndex = 0;

  const interval = setInterval(() => {
    // Random progress that sometimes goes backwards
    const change = Math.random() > 0.8 ? -5 : Math.floor(Math.random() * 15) + 5;
    progress = Math.min(100, Math.max(0, progress + change));
    loadingProgress.style.width = progress + '%';

    // Update message
    if (Math.random() > 0.7 && messageIndex < loadingMessages.length - 1) {
      messageIndex++;
      loadingText.textContent = loadingMessages[messageIndex].text;
      loadingSubtext.textContent = loadingMessages[messageIndex].sub;
    }

    // Complete loading at random time between 3-5 seconds
    if (progress >= 100 && Math.random() > 0.95) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          unlockAchievement('patient_loader');
        }, 500);
      }, 500);
    }
  }, 200);
}

// Cookie Banner
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const hasResponded = localStorage.getItem('slop_cookie_responded');

  // Show banner after 2 seconds if no response
  setTimeout(() => {
    if (!hasResponded) {
      banner.classList.remove('hidden');
    }
  }, 2000);

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('slop_cookie_responded', 'true');
    banner.classList.add('hidden');
    unlockAchievement('cookie_monster');
    showToast('🍪 Cookies accepted! The slop is now 10% tastier!');
  });

  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem('slop_cookie_responded', 'true');
    banner.classList.add('hidden');
    showToast('🍪 Cookies declined. The slop tastes the same.');
  });

  document.getElementById('cookie-manage').addEventListener('click', () => {
    document.getElementById('cookie-preferences-modal').classList.remove('hidden');
  });

  document.getElementById('close-cookie-preferences').addEventListener('click', () => {
    document.getElementById('cookie-preferences-modal').classList.add('hidden');
  });

  document.getElementById('save-cookie-preferences').addEventListener('click', () => {
    document.getElementById('cookie-preferences-modal').classList.add('hidden');
    localStorage.setItem('slop_cookie_responded', 'true');
    banner.classList.add('hidden');
    showToast('🍪 Preferences saved! Bob thanks you.');
  });
}

// Live Chat Support
let chatMessageCount = 0;
const chatResponses = [
  "Have you tried turning it off and on again?",
  "Our slop experts are currently slopping. Please hold.",
  "Please hold, we're brewing your answer...",
  "That's a great question! Let me transfer you to someone who knows.",
  "I'm sure that's important. Next question?",
  "Your feedback has been noted and will be ignored.",
  "I understand your frustration. Have you tried coffee?",
  "This is an automated message. Nobody is actually here.",
  "The slop is working as intended. The problem is you.",
  "I'll make a note of that. *makes no note*"
];

function initChatWidget() {
  const chatToggle = document.getElementById('chat-toggle');
  const chatMessages = document.getElementById('chat-messages');
  const chatClose = document.getElementById('chat-close');
  const chatSend = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');

  chatToggle.addEventListener('click', () => {
    chatMessages.classList.toggle('hidden');
  });

  chatClose.addEventListener('click', () => {
    chatMessages.classList.add('hidden');
  });

  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    chatHistory.innerHTML += `
      <div class="flex items-start gap-2 justify-end">
        <div class="bg-purple-500/20 rounded-2xl rounded-tr-none p-3 max-w-[80%]">
          <p class="text-sm text-white">${message}</p>
        </div>
        <div class="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center text-xs">👤</div>
      </div>
    `;

    chatMessageCount++;
    if (chatMessageCount >= 10) {
      unlockAchievement('chat_champion');
    }

    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Auto-response after delay
    setTimeout(() => {
      const response = chatResponses[Math.floor(Math.random() * chatResponses.length)];
      chatHistory.innerHTML += `
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">🤖</div>
          <div class="bg-white/5 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
            <p class="text-sm text-gray-300">${response}</p>
          </div>
        </div>
      `;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1000 + Math.random() * 2000);
  }

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// Newsletter Signup
function initNewsletterSignup() {
  const modal = document.getElementById('newsletter-modal');
  const emailInput = document.getElementById('newsletter-email');
  const subscribeBtn = document.getElementById('newsletter-subscribe');

  subscribeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    unlockAchievement('newsletter_subscriber');
    showToast('📧 Subscribed! You will receive nothing shortly.');
  });
}

// Dark Pattern Toggle
let isDarkPatternEnabled = false;

function toggleDarkPattern() {
  isDarkPatternEnabled = !isDarkPatternEnabled;

  if (isDarkPatternEnabled) {
    document.body.classList.add('dark-pattern');
    // Make buttons harder to click by adding random offsets
    document.querySelectorAll('button').forEach(btn => {
      btn.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
    });
    showToast('🌑 Dark patterns enabled! Good luck clicking things!');
    unlockAchievement('dark_pattern_survivor');
  } else {
    document.body.classList.remove('dark-pattern');
    document.querySelectorAll('button').forEach(btn => {
      btn.style.transform = '';
    });
    showToast('🌑 Dark patterns disabled. Everything is normal again.');
  }
}

// Sound Pack Selector
let currentSoundPack = 'default';

function initSoundPackSelector() {
  const options = document.querySelectorAll('.sound-pack-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      currentSoundPack = option.dataset.pack;
      options.forEach(o => o.classList.remove('bg-gradient-to-r', 'from-purple-600/20', 'to-pink-600/20', 'border-purple-500/50'));
      options.forEach(o => o.classList.add('bg-white/5', 'border-white/10'));
      option.classList.remove('bg-white/5', 'border-white/10');
      option.classList.add('bg-gradient-to-r', 'from-purple-600/20', 'to-pink-600/20', 'border-purple-500/50');
      unlockAchievement('audio_phile');
      showToast(`🎧 Sound pack changed to ${option.dataset.pack}!`);
    });
  });
}

// Slop Translator
let currentLanguage = 'normal';
const translations = {
  pirate: {
    'Certified Slop': 'Certified Slop, Arrr!',
    'We make slop': 'We be makin\' slop',
    'repositories': 'treasures',
    'stars': 'gold doubloons'
  },
  shakespeare: {
    'Certified Slop': 'Most Certified Slop',
    'We make slop': 'Forsooth, we doth make slop',
    'repositories': 'scrolls of knowledge',
    'stars': 'heavenly bodies'
  },
  leet: {
    'Certified Slop': 'C3r71f13d 5|0p',
    'We make slop': 'W3 m4k3 5|0p',
    'repositories': 'r3p05',
    'stars': '574r5'
  },
  emoji: {
    'Certified Slop': '✅🍦',
    'We make slop': '👷🍦',
    'repositories': '📦📦',
    'stars': '⭐⭐'
  }
};

function initTranslator() {
  const options = document.querySelectorAll('.translator-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      currentLanguage = option.dataset.lang;
      options.forEach(o => o.classList.remove('bg-gradient-to-r', 'from-purple-600/20', 'to-pink-600/20', 'border-purple-500/50'));
      options.forEach(o => o.classList.add('bg-white/5', 'border-white/10'));
      option.classList.remove('bg-white/5', 'border-white/10');
      option.classList.add('bg-gradient-to-r', 'from-purple-600/20', 'to-pink-600/20', 'border-purple-500/50');

      if (currentLanguage !== 'normal') {
        unlockAchievement('polyglot');
        showToast(`🌐 Translated to ${option.dataset.lang}!`);
      }

      applyTranslation();
    });
  });
}

function applyTranslation() {
  if (currentLanguage === 'normal') {
    // Reset all text (would need original text stored)
    return;
  }

  const trans = translations[currentLanguage];
  document.querySelectorAll('h1, h2, h3, p, span, button').forEach(el => {
    const originalText = el.textContent;
    for (const [key, value] of Object.entries(trans)) {
      if (originalText.includes(key)) {
        el.textContent = originalText.replace(key, value);
      }
    }
  });
}

// Desktop Notifications
function initNotifications() {
  const notificationMessages = [
    "Your slop is ready!",
    "Someone viewed slop near you!",
    "It's been 5 minutes. Look at slop.",
    "New slop available!",
    "Your slop is getting cold!",
    "Slop notification!",
    "Remember to drink water!",
    "Take a slop break!"
  ];

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          unlockAchievement('notification_enthusiast');
        }
      });
    }
  }

  function sendNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Slop Alert', {
        body: message,
        icon: 'https://avatars.githubusercontent.com/u/265597819?v=4'
      });
    }
  }

  // Request permission after 30 seconds
  setTimeout(requestNotificationPermission, 30000);

  // Send random notifications every 2-5 minutes
  setInterval(() => {
    if (Math.random() > 0.5) {
      const message = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
      sendNotification(message);
    }
  }, 120000 + Math.random() * 180000);
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger when typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === '?') {
      e.preventDefault();
      document.getElementById('shortcuts-modal').classList.remove('hidden');
      unlockAchievement('keyboard_warrior');
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      showToast('💾 Slop saved! (not really)');
      unlockAchievement('keyboard_warrior');
    }

    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      window.print();
      unlockAchievement('keyboard_warrior');
    }

    if (e.key.toLowerCase() === 'h') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      unlockAchievement('keyboard_warrior');
    }

    if (e.key.toLowerCase() === 'r') {
      location.reload();
    }

    if (e.key.toLowerCase() === 't') {
      cycleTheme();
      unlockAchievement('keyboard_warrior');
    }

    if (e.key.toLowerCase() === 'f') {
      showRandomFact();
      document.getElementById('facts-modal').classList.remove('hidden');
      unlockAchievement('keyboard_warrior');
    }
  });
}

// Analytics Dashboard
function initAnalytics() {
  // Update live activity counter
  setInterval(() => {
    const counter = document.getElementById('stat-live-activity');
    if (counter) {
      const base = 1337;
      const random = Math.floor(Math.random() * 100);
      counter.textContent = `${base + random} users viewing slop right now`;
    }
  }, 3000);
}

// Easter Egg Hunt
let eggsFound = 0;
const foundEggs = new Set();

function initEasterEggs() {
  for (let i = 1; i <= 5; i++) {
    const egg = document.getElementById(`egg-${i}`);
    if (egg) {
      egg.addEventListener('click', () => {
        if (!foundEggs.has(i)) {
          foundEggs.add(i);
          eggsFound++;
          egg.textContent = '🐣';
          egg.style.opacity = '1';
          showToast(`🥚 Easter egg ${i}/5 found!`);

          if (eggsFound >= 5) {
            unlockAchievement('egg_hunter');
            showToast('🎉 All easter eggs found! You are a true slop explorer!');
          }
        }
      });
    }
  }
}

// Premium Slop Upsell
function initPremiumUpsell() {
  const modal = document.getElementById('premium-upsell-modal');
  const rejectBtn = document.getElementById('premium-reject');
  const acceptBtn = document.getElementById('premium-accept');

  // Show upsell after 60 seconds
  setTimeout(() => {
    if (!localStorage.getItem('slop_premium_responded')) {
      modal.classList.remove('hidden');
    }
  }, 60000);

  rejectBtn.addEventListener('click', () => {
    localStorage.setItem('slop_premium_responded', 'true');
    modal.classList.add('hidden');
    unlockAchievement('frugal_consumer');
    showToast('💰 Smart choice! Free slop is still slop.');
  });

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('slop_premium_responded', 'true');
    modal.classList.add('hidden');
    showToast('💳 Just kidding! This is a joke website.');
  });
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

  // Weather modal
  document.getElementById('weather-btn').addEventListener('click', toggleWeatherModal);
  document.getElementById('close-weather').addEventListener('click', () => {
    document.getElementById('weather-modal').classList.add('hidden');
  });

  // Crypto modal
  document.getElementById('crypto-btn').addEventListener('click', toggleCryptoModal);
  document.getElementById('close-crypto').addEventListener('click', () => {
    document.getElementById('crypto-modal').classList.add('hidden');
  });

  // Facts modal
  document.getElementById('facts-btn').addEventListener('click', toggleFactsModal);
  document.getElementById('close-facts').addEventListener('click', () => {
    document.getElementById('facts-modal').classList.add('hidden');
  });

  // Screen shake button
  document.getElementById('shake-btn').addEventListener('click', toggleScreenShake);

  // Mirror mode button
  document.getElementById('mirror-btn').addEventListener('click', toggleMirrorMode);

  // Zen mode button
  document.getElementById('zen-btn').addEventListener('click', toggleZenMode);
  document.getElementById('exit-zen').addEventListener('click', exitZenMode);

  // Breathing modal
  document.getElementById('breathing-btn').addEventListener('click', toggleBreathingModal);
  document.getElementById('close-breathing').addEventListener('click', () => {
    document.getElementById('breathing-modal').classList.add('hidden');
    if (breathingInterval) clearInterval(breathingInterval);
  });

  // Virtual pet modal
  document.getElementById('virtual-pet-btn').addEventListener('click', toggleVirtualPetModal);
  document.getElementById('close-virtual-pet').addEventListener('click', () => {
    document.getElementById('virtual-pet-modal').classList.add('hidden');
  });
  document.getElementById('pet-btn').addEventListener('click', petVirtualPet);
  document.getElementById('feed-btn').addEventListener('click', feedVirtualPet);
  document.getElementById('clean-btn').addEventListener('click', cleanVirtualPet);

  // Elevator music button
  document.getElementById('music-btn').addEventListener('click', toggleElevatorMusic);

  // Analytics modal
  document.getElementById('analytics-btn').addEventListener('click', () => {
    document.getElementById('analytics-modal').classList.remove('hidden');
    initAnalytics();
    unlockAchievement('data_nerd');
  });
  document.getElementById('close-analytics').addEventListener('click', () => {
    document.getElementById('analytics-modal').classList.add('hidden');
  });

  // Sound pack modal
  document.getElementById('sound-pack-btn').addEventListener('click', () => {
    document.getElementById('sound-pack-modal').classList.remove('hidden');
  });
  document.getElementById('close-sound-pack').addEventListener('click', () => {
    document.getElementById('sound-pack-modal').classList.add('hidden');
  });

  // Translator modal
  document.getElementById('translator-btn').addEventListener('click', () => {
    document.getElementById('translator-modal').classList.remove('hidden');
  });
  document.getElementById('close-translator').addEventListener('click', () => {
    document.getElementById('translator-modal').classList.add('hidden');
  });

  // Newsletter modal
  document.getElementById('newsletter-btn').addEventListener('click', () => {
    document.getElementById('newsletter-modal').classList.remove('hidden');
  });
  document.getElementById('close-newsletter').addEventListener('click', () => {
    document.getElementById('newsletter-modal').classList.add('hidden');
  });

  // Dark pattern button
  document.getElementById('dark-pattern-btn').addEventListener('click', toggleDarkPattern);

  // Shortcuts modal
  document.getElementById('close-shortcuts').addEventListener('click', () => {
    document.getElementById('shortcuts-modal').classList.add('hidden');
  });

  // Close modals on backdrop click
  document.querySelectorAll('#achievement-modal, #slop-scores-modal, #repo-detail-modal, #useless-chart-modal, #settings-modal, #useless-button-modal, #weather-modal, #crypto-modal, #facts-modal, #breathing-modal, #virtual-pet-modal').forEach(modal => {
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
  initVirtualPetDecay();
  initLoadingScreen();
  initCookieBanner();
  initChatWidget();
  initNewsletterSignup();
  initSoundPackSelector();
  initTranslator();
  initNotifications();
  initKeyboardShortcuts();
  initEasterEggs();
  initPremiumUpsell();

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
  document.getElementById('analytics-btn').addEventListener('click', () => {
    document.getElementById('analytics-modal').classList.remove('hidden');
    initAnalytics();
    unlockAchievement('data_nerd');
  });
  document.getElementById('sound-pack-btn').addEventListener('click', () => {
    document.getElementById('sound-pack-modal').classList.remove('hidden');
  });
  document.getElementById('translator-btn').addEventListener('click', () => {
    document.getElementById('translator-modal').classList.remove('hidden');
  });
  document.getElementById('newsletter-btn').addEventListener('click', () => {
    document.getElementById('newsletter-modal').classList.remove('hidden');
  });
  document.getElementById('dark-pattern-btn').addEventListener('click', toggleDarkPattern);

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
