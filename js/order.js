(function initOrder() {
  const itemsList = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const vatEl = document.getElementById('cart-vat');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('cart-checkout');
  const statusEl = document.getElementById('cart-status');

  if (!itemsList) return;

  const cart = new Map(); // id -> { id, name, price, qty }

  function formatGBP(n) { return `£${n.toFixed(2)}`; }

  function render() {
    itemsList.innerHTML = '';
    let subtotal = 0;
    cart.forEach((item) => { subtotal += item.price * item.qty; });
    const vat = subtotal * 0.2;
    const total = subtotal + vat;

    subtotalEl.textContent = formatGBP(subtotal);
    vatEl.textContent = formatGBP(vat);
    totalEl.textContent = formatGBP(total);

    checkoutBtn.disabled = cart.size === 0;

    cart.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span>${item.name}</span>
        <span class="qty">
          <button type="button" aria-label="Decrease quantity" data-dec="${item.id}">-</button>
          <strong>${item.qty}</strong>
          <button type="button" aria-label="Increase quantity" data-inc="${item.id}">+</button>
        </span>
        <span>${formatGBP(item.price * item.qty)}</span>`;
      itemsList.appendChild(li);
    });
  }

  function addItem(data) {
    const existing = cart.get(data.id);
    if (existing) existing.qty += 1; else cart.set(data.id, { ...data, qty: 1 });
    render();
  }

  document.querySelectorAll('[data-add-item]')?.forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        const data = JSON.parse(btn.getAttribute('data-add-item'));
        addItem(data);
      } catch (_) {}
    });
  });

  itemsList.addEventListener('click', (e) => {
    const decId = e.target.getAttribute?.('data-dec');
    const incId = e.target.getAttribute?.('data-inc');
    if (decId && cart.has(decId)) {
      const item = cart.get(decId);
      item.qty -= 1;
      if (item.qty <= 0) cart.delete(decId);
      render();
    }
    if (incId && cart.has(incId)) {
      const item = cart.get(incId);
      item.qty += 1;
      render();
    }
  });

  checkoutBtn?.addEventListener('click', () => {
    statusEl.hidden = false;
    statusEl.textContent = 'Demo checkout complete. Thank you!';
    cart.clear();
    render();
  });

  render();
})();