(function initReservationForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const phoneInput = form.querySelector('#phone');
  const dateInput = form.querySelector('#date');
  const timeInput = form.querySelector('#time');
  const partyInput = form.querySelector('#party');
  const success = document.getElementById('reservation-success');

  // Set min date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;

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
  function isPhoneValid(value) {
    return /^[+()\d\s-]{7,}$/.test(value.trim());
  }
  function isWithinHours(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;
    const [h, m] = timeStr.split(':').map(Number);
    const minutes = h * 60 + (m || 0);
    const open = 11 * 60;   // 11:00
    const close = 22 * 60;  // 22:00
    return minutes >= open && minutes <= close;
  }

  function isFutureDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;
    const dt = new Date(`${dateStr}T${timeStr}`);
    return dt.getTime() >= Date.now();
  }

  function validate() {
    let isValid = true;
    const firstInvalid = [];

    if (!nameInput.value.trim()) { setError(nameInput, 'Please enter your full name'); isValid = false; firstInvalid.push(nameInput); } else { clearError(nameInput); }
    if (!isEmailValid(emailInput.value)) { setError(emailInput, 'Enter a valid email address'); isValid = false; firstInvalid.push(emailInput); } else { clearError(emailInput); }
    if (!isPhoneValid(phoneInput.value)) { setError(phoneInput, 'Enter a valid phone number'); isValid = false; firstInvalid.push(phoneInput); } else { clearError(phoneInput); }

    if (!dateInput.value) { setError(dateInput, 'Select a reservation date'); isValid = false; firstInvalid.push(dateInput); } else { clearError(dateInput); }
    if (!timeInput.value) { setError(timeInput, 'Select a reservation time'); isValid = false; firstInvalid.push(timeInput); } else { clearError(timeInput); }

    if (dateInput.value && timeInput.value) {
      if (!isWithinHours(dateInput.value, timeInput.value)) {
        setError(timeInput, 'Time must be between 11:00 and 22:00');
        isValid = false; firstInvalid.push(timeInput);
      } else if (!isFutureDateTime(dateInput.value, timeInput.value)) {
        setError(timeInput, 'Please choose a future time');
        isValid = false; firstInvalid.push(timeInput);
      }
    }

    const party = Number(partyInput.value);
    if (!party || party < 1 || party > 12) { setError(partyInput, 'Party size must be between 1 and 12'); isValid = false; firstInvalid.push(partyInput); } else { clearError(partyInput); }

    if (!isValid && firstInvalid.length) {
      firstInvalid[0].focus();
    }
    return isValid;
  }

  [nameInput, emailInput, phoneInput, dateInput, timeInput, partyInput].forEach((input) => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('blur', () => { if (input.value) clearError(input); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.hidden = true;
    if (!validate()) return;

    // Simulate successful submission
    form.reset();
    success.hidden = false;
    success.focus?.();
  });
})();