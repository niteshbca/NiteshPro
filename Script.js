// ===================================================================
// NiteshPro — interactions, animations & mini-charts
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  function onScroll(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + '%';

    header.classList.toggle('scrolled', scrollTop > 30);
    backToTop.classList.toggle('show', scrollTop > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Mobile dropdown toggle (tap to expand submenu on small screens)
  document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 820) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Close mobile nav when a link is clicked
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 820 && !link.parentElement.classList.contains('has-dropdown')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveLink(){
    let current = sections[0]?.id;
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  document.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Animated number counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const startTime = performance.now();

      function tick(now){
        const elapsed = now - startTime;
        const progressPct = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progressPct, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progressPct < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- CRM KPI counters (in hero tablet mock) ---------- */
  function animateKpi(id, target, prefix = '', duration = 1600){
    const el = document.getElementById(id);
    if (!el) return;
    const startTime = performance.now();
    function tick(now){
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.textContent = prefix + val.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString('en-IN');
    }
    requestAnimationFrame(tick);
  }

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateKpi('kpiLeads', 1250);
      animateKpi('kpiDeals', 320);
      animateKpi('kpiClients', 842);
      animateKpi('kpiRevenue', 18.6, '₹', 1600); // shows as ₹18 then we fix below
      heroObserver.disconnect();
    });
  }, { threshold: 0.3 });
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) heroObserver.observe(heroVisual);

  // Fix revenue formatting (₹18.6 Lakh) after count-up settles
  setTimeout(() => {
    const rev = document.getElementById('kpiRevenue');
    if (rev) rev.textContent = '₹18.6L';
  }, 1900);

  /* ---------- Mini canvas charts ---------- */
  function drawLineChart(canvas, points, color){
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = (max - min) || 1;
    const stepX = w / (points.length - 1);

    // gradient fill under line
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = h - ((p - min) / range) * (h - 14) - 6;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = h - ((p - min) / range) * (h - 14) - 6;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawDonut(canvas, segments){
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2 - 4;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let start = -Math.PI / 2;

    segments.forEach(seg => {
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      start += angle;
    });

    // inner cutout for donut effect
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#F7F9FD';
    ctx.fill();
  }

  drawLineChart(document.getElementById('phoneChart'), [20, 35, 28, 42, 38, 55, 48, 60], '#2E6BF2');
  drawLineChart(document.getElementById('crmLine'), [12, 22, 18, 30, 26, 38, 34, 46, 40, 52], '#2E6BF2');
  drawDonut(document.getElementById('crmDonut'), [
    { value: 45, color: '#2E6BF2' },
    { value: 30, color: '#22C67D' },
    { value: 25, color: '#7C6BF2' },
  ]);

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  function validateField(field, condition){
    field.classList.toggle('invalid', !condition);
    return condition;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      successMsg.classList.remove('show');

      const nameInput = document.getElementById('cf-name');
      const emailInput = document.getElementById('cf-email');
      const msgInput = document.getElementById('cf-msg');

      const nameValid = validateField(nameInput.closest('.field'), nameInput.value.trim().length > 1);
      const emailValid = validateField(emailInput.closest('.field'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()));
      const msgValid = validateField(msgInput.closest('.field'), msgInput.value.trim().length > 4);

      if (nameValid && emailValid && msgValid) {
        successMsg.classList.add('show');
        form.reset();
        // reset floating labels state
        form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    });

    // live-clear error state as user types
    form.querySelectorAll('input, textarea').forEach(inputEl => {
      inputEl.addEventListener('input', () => {
        inputEl.closest('.field').classList.remove('invalid');
      });
    });
  }

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const offset = 80;
          const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

});