(function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const viewport = carousel.querySelector('.carousel__viewport');
  const slides = Array.from(carousel.querySelectorAll('.carousel__slide'));
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dotsContainer = carousel.querySelector('[data-carousel-dots]');
  const status = carousel.querySelector('[data-carousel-status]');

  let currentIndex = 0;
  let autoRotateTimer = null;
  const AUTO_ROTATE_MS = 5000;

  function renderDots() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i, true));
      dotsContainer.appendChild(dot);
    });
  }

  function updateAria() {
    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      if (!isActive) slide.setAttribute('tabindex', '-1'); else slide.removeAttribute('tabindex');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
    if (status) status.textContent = `Slide ${currentIndex + 1} of ${slides.length}`;
  }

  function goToSlide(index, userInitiated = false) {
    currentIndex = (index + slides.length) % slides.length;
    updateAria();
    if (userInitiated) restartAutoRotate();
  }

  function next() { goToSlide(currentIndex + 1); }
  function prev() { goToSlide(currentIndex - 1); }

  function startAutoRotate() {
    stopAutoRotate();
    autoRotateTimer = setInterval(next, AUTO_ROTATE_MS);
  }
  function stopAutoRotate() {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
    autoRotateTimer = null;
  }
  function restartAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
  }

  // Event listeners
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1, true));
  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1, true));

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goToSlide(currentIndex + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentIndex - 1, true); }
  });

  // Pause on hover/focus for accessibility
  carousel.addEventListener('mouseenter', stopAutoRotate);
  carousel.addEventListener('mouseleave', startAutoRotate);
  carousel.addEventListener('focusin', stopAutoRotate);
  carousel.addEventListener('focusout', startAutoRotate);

  // Init
  renderDots();
  updateAria();
  startAutoRotate();
})();