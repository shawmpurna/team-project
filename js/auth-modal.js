(function authModal() {
  const CURRENT_USER_KEY = 'sg_current_user';
  const USERS_KEY = 'sg_users';
  const SESSION_SHOWN_KEY = 'sg_auth_modal_shown';

  function isEmailValid(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase()); }
  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function setCurrentUser(user) { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); }
  function getCurrentUser() { try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); } catch { return null; } }

  function injectModal() {
    if (document.getElementById('auth-modal')) return document.getElementById('auth-modal');
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-auth';
    wrapper.id = 'auth-modal';
    wrapper.innerHTML = `
      <div class="modal-auth__card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div class="modal-auth__header">
          <h2 id="auth-modal-title" class="modal-auth__title">Welcome to Street Greek</h2>
          <button class="modal-auth__close" aria-label="Close" data-auth-close>✕</button>
        </div>
        <div class="modal-auth__body">
          <div class="auth__tabs" role="tablist">
            <button class="auth__tab is-active" role="tab" id="m-tab-login" aria-selected="true" aria-controls="m-panel-login">Log in</button>
            <button class="auth__tab" role="tab" id="m-tab-signup" aria-selected="false" aria-controls="m-panel-signup">Sign up</button>
          </div>
          <div class="auth__panels">
            <form id="m-panel-login" class="auth__panel" role="tabpanel" aria-labelledby="m-tab-login" tabindex="0" novalidate>
              <label for="m-login-email">Email</label>
              <input id="m-login-email" name="email" type="email" required aria-required="true" aria-describedby="m-login-email-error" />
              <span id="m-login-email-error" class="error" aria-live="polite"></span>

              <label for="m-login-password">Password</label>
              <div class="input-with-action">
                <input id="m-login-password" name="password" type="password" required aria-required="true" aria-describedby="m-login-password-error" />
                <button type="button" class="show-password" aria-label="Show password" data-toggle-password="#m-login-password">👁</button>
              </div>
              <span id="m-login-password-error" class="error" aria-live="polite"></span>

              <button type="submit" class="btn btn--primary" style="margin-top:1rem; width:100%">Log in</button>
            </form>

            <form id="m-panel-signup" class="auth__panel is-hidden" role="tabpanel" aria-labelledby="m-tab-signup" tabindex="-1" hidden novalidate>
              <label for="m-signup-name">Full name</label>
              <input id="m-signup-name" name="name" type="text" required aria-required="true" aria-describedby="m-signup-name-error" />
              <span id="m-signup-name-error" class="error" aria-live="polite"></span>

              <label for="m-signup-email">Email</label>
              <input id="m-signup-email" name="email" type="email" required aria-required="true" aria-describedby="m-signup-email-error" />
              <span id="m-signup-email-error" class="error" aria-live="polite"></span>

              <label for="m-signup-password">Password</label>
              <div class="input-with-action">
                <input id="m-signup-password" name="password" type="password" minlength="8" required aria-required="true" aria-describedby="m-signup-password-error m-signup-password-help" />
                <button type="button" class="show-password" aria-label="Show password" data-toggle-password="#m-signup-password">👁</button>
              </div>
              <span id="m-signup-password-help" class="help-text">At least 8 characters.</span>
              <span id="m-signup-password-error" class="error" aria-live="polite"></span>

              <label for="m-signup-confirm">Confirm password</label>
              <input id="m-signup-confirm" name="confirm" type="password" required aria-required="true" aria-describedby="m-signup-confirm-error" />
              <span id="m-signup-confirm-error" class="error" aria-live="polite"></span>

              <button type="submit" class="btn btn--primary" style="margin-top:1rem; width:100%">Create account</button>
            </form>

            <div class="modal-divider" aria-hidden="true">or</div>
            <button type="button" class="btn-google" data-google-signin>
              <img alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
              Continue with Google
            </button>

            <div id="m-auth-success" role="status" aria-live="polite" class="success" hidden></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function bindModal(modal) {
    const closeBtn = modal.querySelector('[data-auth-close]');
    const card = modal.querySelector('.modal-auth__card');
    let lastActive = null;

    function open() {
      if (modal.hasAttribute('open')) return;
      lastActive = document.activeElement;
      modal.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
      card.focus?.();
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
    }
    function close() {
      modal.removeAttribute('open');
      document.body.style.overflow = '';
      lastActive?.focus?.();
    }

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    window.addEventListener('keydown', (e) => { if (modal.hasAttribute('open') && e.key === 'Escape') close(); });

    // Focus trap
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.hasAttribute('open')) return;
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      const first = list[0]; const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Tabs
    const tabs = [modal.querySelector('#m-tab-login'), modal.querySelector('#m-tab-signup')];
    const panels = [modal.querySelector('#m-panel-login'), modal.querySelector('#m-panel-signup')];
    function switchTo(idx) {
      tabs.forEach((t, i) => { t.classList.toggle('is-active', i === idx); t.setAttribute('aria-selected', String(i === idx)); });
      panels.forEach((p, i) => { p.hidden = i !== idx; p.classList.toggle('is-hidden', i !== idx); p.setAttribute('tabindex', i === idx ? '0' : '-1'); });
      panels[idx].querySelector('input')?.focus();
    }
    tabs[0].addEventListener('click', () => switchTo(0));
    tabs[1].addEventListener('click', () => switchTo(1));

    // Password toggles
    modal.querySelectorAll('.show-password').forEach((btn) => {
      const sel = btn.getAttribute('data-toggle-password');
      const input = modal.querySelector(sel);
      if (!input) return;
      btn.addEventListener('click', () => {
        const newType = input.type === 'password' ? 'text' : 'password';
        input.type = newType;
        btn.setAttribute('aria-label', newType === 'text' ? 'Hide password' : 'Show password');
      });
    });

    const success = modal.querySelector('#m-auth-success');

    // Login
    panels[0].addEventListener('submit', (e) => {
      e.preventDefault();
      success.hidden = true;
      const email = modal.querySelector('#m-login-email');
      const password = modal.querySelector('#m-login-password');
      function setError(input, msg){ const el = modal.querySelector(`#${input.id}-error`); input.setAttribute('aria-invalid','true'); if (el) el.textContent = msg; }
      function clearError(input){ const el = modal.querySelector(`#${input.id}-error`); input.removeAttribute('aria-invalid'); if (el) el.textContent = ''; }

      let ok = true; const first=[];
      if (!isEmailValid(email.value)) { setError(email, 'Enter a valid email'); ok=false; first.push(email);} else clearError(email);
      if (!password.value) { setError(password, 'Enter your password'); ok=false; first.push(password);} else clearError(password);
      if (!ok) { first[0]?.focus(); return; }

      const user = getUsers().find(u => u.email.toLowerCase() === email.value.toLowerCase() && u.password === password.value);
      if (!user) { setError(password, 'Incorrect email or password'); password.focus(); return; }
      setCurrentUser({ name: user.name, email: user.email, provider: 'local' });
      success.textContent = `Welcome back, ${user.name}!`;
      success.hidden = false;
      setTimeout(close, 700);
      panels[0].reset();
    });

    // Signup
    panels[1].addEventListener('submit', (e) => {
      e.preventDefault();
      success.hidden = true;
      const name = modal.querySelector('#m-signup-name');
      const email = modal.querySelector('#m-signup-email');
      const password = modal.querySelector('#m-signup-password');
      const confirm = modal.querySelector('#m-signup-confirm');
      function setError(input, msg){ const el = modal.querySelector(`#${input.id}-error`); input.setAttribute('aria-invalid','true'); if (el) el.textContent = msg; }
      function clearError(input){ const el = modal.querySelector(`#${input.id}-error`); input.removeAttribute('aria-invalid'); if (el) el.textContent = ''; }

      let ok = true; const first=[];
      if (!name.value.trim()) { setError(name, 'Enter your name'); ok=false; first.push(name);} else clearError(name);
      if (!isEmailValid(email.value)) { setError(email, 'Enter a valid email'); ok=false; first.push(email);} else clearError(email);
      if (password.value.length < 8) { setError(password, 'Min 8 characters'); ok=false; first.push(password);} else clearError(password);
      if (confirm.value !== password.value) { setError(confirm, 'Passwords do not match'); ok=false; first.push(confirm);} else clearError(confirm);
      if (getUsers().some(u => u.email.toLowerCase() === email.value.toLowerCase())) { setError(email, 'Email already registered'); ok=false; }
      if (!ok) { first[0]?.focus(); return; }

      const users = getUsers();
      users.push({ name: name.value.trim(), email: email.value.trim(), password: password.value });
      saveUsers(users);
      setCurrentUser({ name: name.value.trim(), email: email.value.trim(), provider: 'local' });
      success.textContent = 'Account created! You are now logged in.';
      success.hidden = false;
      setTimeout(close, 700);
      panels[1].reset();
    });

    // Google mock sign-in
    modal.querySelector('[data-google-signin]').addEventListener('click', () => {
      setCurrentUser({ name: 'Google User', email: 'user@gmail.com', provider: 'google' });
      success.textContent = 'Signed in with Google.';
      success.hidden = false;
      setTimeout(close, 600);
    });

    return { open, close };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const modal = injectModal();
    const api = bindModal(modal);
    if (!getCurrentUser() && !sessionStorage.getItem(SESSION_SHOWN_KEY)) {
      api.open();
    }
  });
})();