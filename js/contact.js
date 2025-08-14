(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const success = document.getElementById('contact-success');

  function setError(input, message) {
    const errorEl = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message || '';
  }
  function clearError(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
  }
  function isEmailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
  }
  function validate() {
    let ok = true;
    const first = [];
    if (!nameInput.value.trim()) { setError(nameInput, 'Please enter your name'); ok = false; first.push(nameInput); } else { clearError(nameInput); }
    if (!isEmailValid(emailInput.value)) { setError(emailInput, 'Enter a valid email'); ok = false; first.push(emailInput); } else { clearError(emailInput); }
    if (!messageInput.value.trim()) { setError(messageInput, 'Please enter a message'); ok = false; first.push(messageInput); } else { clearError(messageInput); }
    if (!ok && first.length) first[0].focus();
    return ok;
  }

  [nameInput, emailInput, messageInput].forEach((el) => {
    el.addEventListener('input', () => clearError(el));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.hidden = true;
    if (!validate()) return;
    form.reset();
    success.hidden = false;
  });
})();