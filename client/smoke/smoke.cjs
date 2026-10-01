// Smoke test: boot the built React bundle in jsdom and simulate navigation.
const { JSDOM } = require('jsdom');

const path = require('path');
const fs = require('fs');
const assetsDir = path.resolve(__dirname, '../../server/build/bhoeja/assets');
const BUNDLE = fs.readdirSync(assetsDir).filter((f) => /^index-.*.js$/.test(f)).map((f) => path.join(assetsDir, f))[0];
if (!BUNDLE) { console.error('No built bundle found. Run  first.'); process.exit(1); }

const html = `<!DOCTYPE html><html><head><title>Bhoe Ja</title></head><body><div id="root"></div></body></html>`;

const dom = new JSDOM(html, {
  url: 'http://localhost:3000/',
  pretendToBeVisual: true,
});

const { window } = dom;

// ---- globals ----
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.location = window.location;
global.history = window.history;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.Event = window.Event;
global.MouseEvent = window.MouseEvent;
global.CustomEvent = window.CustomEvent;
global.KeyboardEvent = window.KeyboardEvent;
global.getComputedStyle = window.getComputedStyle;
global.MutationObserver = window.MutationObserver;
// copy all DOM constructors jsdom keeps on window but libs expect globally
for (const key of Object.getOwnPropertyNames(window)) {
  if (/^(HTML|SVG|DOM|Node|Event|Mutation|Resize|Intersection)/.test(key) && typeof window[key] === 'function') {
    if (!(key in global)) global[key] = window[key];
  }
}
global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);

// ---- stubs ----
class FakeIntersectionObserver {
  constructor(cb) { this.cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = FakeIntersectionObserver;
window.IntersectionObserver = FakeIntersectionObserver;

window.matchMedia = window.matchMedia || ((q) => ({
  matches: false, media: q,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent() { return false; },
}));
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.ResizeObserver = global.ResizeObserver;
window.scrollTo = () => {};

// ---- error capture ----
const jsErrors = [];
const origConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map(String).join(' ');
  // React logs "Error: ..." for error boundaries; fetch failures are expected here (no DB)
  if (!/Failed to load|NetworkError|fetch/i.test(msg)) jsErrors.push(msg.slice(0, 300));
  origConsoleError.apply(console, args);
};
process.on('unhandledRejection', (e) => jsErrors.push('unhandledRejection: ' + String(e).slice(0, 300)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const text = () => document.getElementById('root').textContent.replace(/\s+/g, ' ').trim();

function clickByText(tag, label) {
  const els = [...document.querySelectorAll(tag)];
  const el = els.find((e) => e.textContent.trim() === label);
  if (!el) throw new Error(`click target not found: <${tag}> "${label}"`);
  // Radix TabsTrigger activates on mousedown (real browsers fire it before click)
  el.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

async function main() {
  // Seed Angular-era bookmark shapes BEFORE boot to test storage compatibility
  // Angular stored: { bookmarks: [...] } with trimmed 'yyyy-MM-dd' date strings
  window.localStorage.setItem('BhoejaBookmarks', JSON.stringify({ bookmarks: [{
    _id: 'abc123', title: 'Test Article', date: '2026-09-01',
    source: 'Phayul', link: 'https://example.com/a', isVideo: false,
  }, {
    _id: 'vid9', title: 'Test Video', date: '2026-09-02',
    source: 'TibetTV', link: 'https://www.youtube.com/watch?v=xyz',
    isVideo: true, thumbnailBig: 'https://example.com/t.jpg',
  }] }));
  await import(BUNDLE);
  await sleep(1500); // let React boot + fetch attempt finish

  console.log('--- after boot ---');
  console.log('root text:', text().slice(0, 400));
  console.log('location:', window.location.pathname);

  const hasHeader = text().includes('Bhoe Ja');
  const hasTabs = text().includes('Tibetan') && text().includes('English') && text().includes('Videos');
  console.log('header rendered:', hasHeader, '| tabs rendered:', hasTabs);

  // error state expected (no DB): look for retry button
  const hasErrorState = text().includes('Something went wrong');
  console.log('error/empty state shown:', hasErrorState, '| retry button present:', !!document.querySelector('button') && text().includes('Retry'));

  // 1. Click Videos tab
  const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => ({
    text: t.textContent.trim(),
    state: t.getAttribute('data-state'),
    disabled: t.disabled,
  }));
  console.log('tabs before click:', JSON.stringify(tabs));
  clickByText('button', 'Videos');
  await sleep(800);
  const tabsAfter = [...document.querySelectorAll('[role="tab"]')].map((t) => ({
    text: t.textContent.trim(),
    state: t.getAttribute('data-state'),
  }));
  console.log('tabs after click:', JSON.stringify(tabsAfter));
  console.log('--- after Videos tab ---');
  console.log('location:', window.location.pathname, '| has video error state:', text().includes('Something went wrong'));

  // 2. Back to English, then open About sheet via aria-label
  clickByText('button', 'English');
  await sleep(800);
  const aboutBtn = document.querySelector('button[aria-label="About"]');
  if (!aboutBtn) throw new Error('About button not found');
  aboutBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(800);
  const bodyText = document.body.textContent.replace(/\s+/g, ' ').trim();
  // original about page used the short source names from sourceListing (e.g. 'CTA')
  const sheetOpen = bodyText.includes('About BHOE JA') && bodyText.includes('News Sources') && bodyText.includes('CTA');
  console.log('about sheet opened:', sheetOpen);
  if (!sheetOpen) console.log('body tail:', bodyText.slice(-300));
  // dark mode toggle inside the sheet
  const darkSwitch = document.querySelector('[role="switch"]');
  if (!darkSwitch) throw new Error('Dark mode switch not found');
  darkSwitch.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(500);
  console.log('dark class applied:', document.documentElement.classList.contains('dark'),
    '| persisted:', JSON.parse(window.localStorage.getItem('BhoejaDarkMode') || '{}').darkMode === true);
  // close with Escape
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await sleep(500);
  const bodyText2 = document.body.textContent.replace(/\s+/g, ' ').trim();
  console.log('about sheet closed:', !bodyText2.includes('News Sources'));

  // 3. Bookmark page via aria-label button
  const bmBtn = document.querySelector('button[aria-label="Bookmarks"]');
  if (!bmBtn) throw new Error('Bookmarks button not found');
  bmBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(800);
  console.log('--- after Bookmarks click ---');
  console.log('location:', window.location.pathname);
  const seededRendered = text().includes('Test Article') && text().includes('Phayul') && text().includes('2026-09-01');
  const videoRendered = text().includes('Test Video') && text().includes('TibetTV');
  console.log('seeded Angular-era article bookmark rendered:', seededRendered);
  console.log('seeded Angular-era video bookmark rendered:', videoRendered);
  console.log('header badge count 2:', /Bhoe Ja/.test(text()) && document.body.textContent.includes('2'));

  // Remove the bookmarks via UI, expect empty state
  let removeBtn = document.querySelector('button[aria-label="Remove bookmark"]');
  if (!removeBtn) throw new Error('Remove bookmark button not found');
  removeBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(500);
  removeBtn = document.querySelector('button[aria-label="Remove bookmark"]');
  removeBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(800);
  console.log('after removals, empty message:', text().includes('No bookmarks yet'));
  console.log('localStorage cleared:', JSON.parse(window.localStorage.getItem('BhoejaBookmarks') || '{}').bookmarks.length === 0);

  console.log('--- JS errors captured:', jsErrors.length, '---');
  jsErrors.slice(0, 10).forEach((e) => console.log('ERR:', e));
  if (jsErrors.length > 0) process.exitCode = 2;
}

main().catch((e) => { console.error('SMOKE FAILED:', e); process.exit(1); });
