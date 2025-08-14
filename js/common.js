(function common() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal on scroll using IntersectionObserver
  const toReveal = Array.from(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && toReveal.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    toReveal.forEach((el) => io.observe(el));
  } else {
    // Fallback: show immediately
    toReveal.forEach((el) => el.classList.add('is-visible'));
  }

  // Add focus-visible polyfill-esque class for initial keyboard usage hint
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);

  // Cookie consent
  const CONSENT_KEY = 'sg_cookie_consent_v1';
  function hasConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch { return null; }
  }
  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  }
  function injectCookieBanner() {
    if (document.getElementById('cookie-banner')) return;
    const el = document.createElement('div');
    el.className = 'cookie-banner';
    el.id = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML = `
      <div>
        We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies. 
        You can read more in our <a href="#" style="color: var(--brand)">privacy policy</a>.
      </div>
      <div class="cookie-actions">
        <button type="button" class="btn btn--primary" id="cookie-accept">Accept</button>
        <button type="button" class="btn btn--ghost" id="cookie-decline">Decline</button>
      </div>`;
    document.body.appendChild(el);
    return el;
  }
  function showCookieBanner() {
    const banner = injectCookieBanner();
    banner?.setAttribute('open', '');
    banner?.querySelector('#cookie-accept')?.addEventListener('click', () => {
      setConsent({ necessary: true, analytics: true, marketing: false, date: Date.now() });
      banner.removeAttribute('open');
    });
    banner?.querySelector('#cookie-decline')?.addEventListener('click', () => {
      setConsent({ necessary: true, analytics: false, marketing: false, date: Date.now() });
      banner.removeAttribute('open');
    });
  }
  if (!hasConsent()) {
    showCookieBanner();
  }
})();