(function initAuth() {
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginPanel = document.getElementById('panel-login');
  const signupPanel = document.getElementById('panel-signup');
  const successEl = document.getElementById('auth-success');
  const authCard = document.getElementById('auth-card');

  const dashboard = document.getElementById('account-dashboard');
  const nameOut = document.getElementById('acct-name');
  const emailOut = document.getElementById('acct-email');
  const btnLogout = document.getElementById('btn-logout');

  const CURRENT_USER_KEY = 'sg_current_user';
  const USERS_KEY = 'sg_users';

  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function getCurrentUser() { try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); } catch { return null; } }
  function setCurrentUser(user) { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); }

  function isEmailValid(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase()); }

  function renderDashboard() {
    const current = getCurrentUser();
    if (!dashboard) return;
    if (!current) {
      authCard?.removeAttribute('hidden');
      dashboard.setAttribute('hidden', '');
      return;
    }
    nameOut.textContent = current.name || 'Guest';
    emailOut.textContent = current.email || '';
    authCard?.setAttribute('hidden', '');
    dashboard.removeAttribute('hidden');
  }

  btnLogout?.addEventListener('click', () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    renderDashboard();
    // Move focus to the login email field when showing auth card again
    setTimeout(() => document.getElementById('login-email')?.focus(), 50);
  });

  if (loginTab && signupTab) {
    function switchTo(which) {
      const isLogin = which === 'login';
      loginTab.classList.toggle('is-active', isLogin);
      signupTab.classList.toggle('is-active', !isLogin);
      loginTab.setAttribute('aria-selected', String(isLogin));
      signupTab.setAttribute('aria-selected', String(!isLogin));
      loginPanel.hidden = !isLogin;
      signupPanel.hidden = isLogin;
      loginPanel.classList.toggle('is-hidden', !isLogin);
      signupPanel.classList.toggle('is-hidden', isLogin);
      (isLogin ? loginPanel : signupPanel).setAttribute('tabindex', '0');
      (isLogin ? signupPanel : loginPanel).setAttribute('tabindex', '-1');
      (isLogin ? loginPanel : signupPanel).querySelector('input')?.focus();
    }

    loginTab.addEventListener('click', () => switchTo('login'));
    signupTab.addEventListener('click', () => switchTo('signup'));
    document.querySelectorAll('[data-switch-to]')?.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        switchTo(link.getAttribute('data-switch-to'));
      });
    });

    document.querySelectorAll('.show-password').forEach((btn) => {
      const targetSel = btn.getAttribute('data-toggle-password');
      const input = document.querySelector(targetSel);
      if (!input) return;
      btn.addEventListener('click', () => {
        const nowType = input.type === 'password' ? 'text' : 'password';
        input.type = nowType;
        btn.setAttribute('aria-label', nowType === 'text' ? 'Hide password' : 'Show password');
      });
    });

    // Signup
    signupPanel?.addEventListener('submit', (e) => {
      e.preventDefault();
      successEl.hidden = true;

      const name = document.getElementById('signup-name');
      const email = document.getElementById('signup-email');
      const password = document.getElementById('signup-password');
      const confirm = document.getElementById('signup-confirm');

      let ok = true; const first = [];
      function setError(input, msg) { const el = document.getElementById(`${input.id}-error`); input.setAttribute('aria-invalid', 'true'); if (el) el.textContent = msg; }
      function clearError(input) { const el = document.getElementById(`${input.id}-error`); input.removeAttribute('aria-invalid'); if (el) el.textContent = ''; }

      if (!name.value.trim()) { setError(name, 'Enter your name'); ok = false; first.push(name); } else { clearError(name); }
      if (!isEmailValid(email.value)) { setError(email, 'Enter a valid email'); ok = false; first.push(email); } else { clearError(email); }
      if (password.value.length < 8) { setError(password, 'Min 8 characters'); ok = false; first.push(password); } else { clearError(password); }
      if (confirm.value !== password.value) { setError(confirm, 'Passwords do not match'); ok = false; first.push(confirm); } else { clearError(confirm); }

      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.value.toLowerCase())) { setError(email, 'Email already registered'); ok = false; }
      if (!ok) { first[0]?.focus(); return; }

      users.push({ name: name.value.trim(), email: email.value.trim(), password: password.value });
      saveUsers(users);
      setCurrentUser({ name: name.value.trim(), email: email.value.trim(), provider: 'local' });

      e.target.reset();
      successEl.textContent = 'Account created! You are now logged in.';
      successEl.hidden = false;
      renderDashboard();
    });

    // Login
    loginPanel?.addEventListener('submit', (e) => {
      e.preventDefault();
      successEl.hidden = true;

      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');

      let ok = true; const first = [];
      function setError(input, msg) { const el = document.getElementById(`${input.id}-error`); input.setAttribute('aria-invalid', 'true'); if (el) el.textContent = msg; }
      function clearError(input) { const el = document.getElementById(`${input.id}-error`); input.removeAttribute('aria-invalid'); if (el) el.textContent = ''; }

      if (!isEmailValid(email.value)) { setError(email, 'Enter a valid email'); ok = false; first.push(email); } else { clearError(email); }
      if (!password.value) { setError(password, 'Enter your password'); ok = false; first.push(password); } else { clearError(password); }
      if (!ok) { first[0]?.focus(); return; }

      const users = getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.value.toLowerCase() && u.password === password.value);
      if (!user) { setError(password, 'Incorrect email or password'); password.focus(); return; }

      setCurrentUser({ name: user.name, email: user.email, provider: 'local' });

      e.target.reset();
      successEl.textContent = `Welcome back, ${user.name}!`;
      successEl.hidden = false;
      renderDashboard();
    });
  }

  renderDashboard();
})();