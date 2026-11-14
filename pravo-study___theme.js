'use strict';

const themeRoot = document.documentElement;
const themePreference = matchMedia('(prefers-color-scheme: dark)');
let chosenTheme;
try {
 const savedTheme = localStorage.getItem('pravo-theme');
 if (savedTheme === 'light' || savedTheme === 'dark') chosenTheme = savedTheme;
} catch {}

function applyTheme() {
 const theme = chosenTheme ?? (themePreference.matches ? 'dark' : 'light');
 themeRoot.dataset.theme = theme;
 const toggle = document.querySelector('.theme-toggle');
 if (!toggle) return;
 const label = themeRoot.lang === 'kk' ? 'Қараңғы тақырып' : 'Тёмная тема';
 toggle.setAttribute('aria-label', label);
 toggle.setAttribute('aria-pressed', String(theme === 'dark'));
 toggle.title = label;
}

applyTheme();
themePreference.addEventListener('change', applyTheme);
document.addEventListener('DOMContentLoaded', () => {
 applyTheme();
 document.querySelector('.theme-toggle').addEventListener('click', () => {
  chosenTheme = themeRoot.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('pravo-theme', chosenTheme); } catch {}
  applyTheme();
 });
});
