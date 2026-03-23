// Utility functions

export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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
}

export function getFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
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

export function getMoodClass(sentiment: string): string {
  const moodMap: Record<string, string> = {
    '😊 Happy': 'mood-happy',
    '🤔 Thoughtful': 'mood-thoughtful',
    '🔥 Spicy': 'mood-spicy',
    '😴 Sleepy': 'mood-sleepy',
    '🤖 Robotic': 'mood-robotic',
    '🎉 Excited': 'mood-excited',
    '😎 Cool': 'mood-cool',
    '🧐 Sophisticated': 'mood-sophisticated'
  };
  return moodMap[sentiment] || '';
}

export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    '😊 Happy': 'text-yellow-400',
    '🤔 Thoughtful': 'text-blue-400',
    '🔥 Spicy': 'text-red-400',
    '😴 Sleepy': 'text-indigo-400',
    '🤖 Robotic': 'text-gray-400',
    '🎉 Excited': 'text-pink-400',
    '😎 Cool': 'text-cyan-400',
    '🧐 Sophisticated': 'text-purple-400'
  };
  return colors[sentiment] || 'text-gray-400';
}
