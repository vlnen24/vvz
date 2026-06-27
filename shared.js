// custom red dot cursor + faint trail (shared across pages)
const glow = document.getElementById('glow');
const trailCanvas = document.getElementById('trail');
const tctx = trailCanvas ? trailCanvas.getContext('2d') : null;
let trailPoints = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// minimal constellation particle background
const bgCanvas = document.getElementById('bg-particles');
if (bgCanvas) {
  const bctx = bgCanvas.getContext('2d');
  let particles = [];
  const DENSITY = 9000; // px² per particle — keeps it sparse/minimal
  const LINK_DIST = 140;
  const SPEED = 0.12;

  function sizeBg(){
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  function makeParticles(){
    const count = Math.max(20, Math.round((bgCanvas.width * bgCanvas.height) / DENSITY));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.4 + 1
    }));
  }

  function startParticles(){
    sizeBg();
    makeParticles();
    drawBg();
  }

  window.addEventListener('resize', () => { sizeBg(); makeParticles(); });

  function drawBg(){
    bctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    if (!reduceMotion) {
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = bgCanvas.width; if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height; if (p.y > bgCanvas.height) p.y = 0;
      });
    }
    for (let i = 0; i < particles.length; i++){
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++){
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < LINK_DIST){
          bctx.strokeStyle = `rgba(224,16,44,${0.18 * (1 - dist / LINK_DIST)})`;
          bctx.lineWidth = 1;
          bctx.beginPath();
          bctx.moveTo(a.x, a.y);
          bctx.lineTo(b.x, b.y);
          bctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      bctx.fillStyle = 'rgba(245,230,226,0.55)';
      bctx.beginPath();
      bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bctx.fill();
    });
    requestAnimationFrame(drawBg);
  }

  if (bgCanvas.width === 0 || document.readyState === 'complete') {
    startParticles();
  } else {
    window.addEventListener('load', startParticles);
  }
  // fallback in case 'load' already fired before listener attached
  setTimeout(() => { if (particles.length === 0) startParticles(); }, 50);
}

if (glow) {
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
    trailPoints.push({x:e.clientX, y:e.clientY, life:1});
  });
  window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  window.addEventListener('mousedown', () => { glow.style.transform = 'translate(-50%,-50%) scale(0.7)'; });
  window.addEventListener('mouseup', () => { glow.style.transform = 'translate(-50%,-50%) scale(1)'; });
}

if (trailCanvas && tctx) {
  function resizeTrail(){
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail);

  function paintTrail(){
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    if(!reduceMotion){
      trailPoints.forEach(p => {
        const r = 22 * p.life + 4;
        const grad = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, `rgba(255,44,68,${0.16 * p.life})`);
        grad.addColorStop(1, 'rgba(255,44,68,0)');
        tctx.fillStyle = grad;
        tctx.beginPath();
        tctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        tctx.fill();
        p.life -= 0.045;
      });
      trailPoints = trailPoints.filter(p => p.life > 0);
    }
    requestAnimationFrame(paintTrail);
  }
  paintTrail();
}

// FAQ accordion (only runs if .faq-item exists on the page)
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

// tilt 3D effect on category cards (only runs if .cat-card exists on the page)
if(!reduceMotion){
  document.querySelectorAll('.cat-card').forEach(card => {
    const maxTilt = 10;
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * maxTilt * 2;
      const tiltY = (x - 0.5) * maxTilt * 2;
      card.style.transform = `perspective(1000px) translateY(-3px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) translateY(0) rotateX(0deg) rotateY(0deg)';
    });
  });
}

// product category filter (only runs if .filter-btn exists on the page)
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      productCards.forEach(p => {
        p.style.display = (filter === 'all' || p.dataset.cat === filter) ? '' : 'none';
      });
    });
  });
}

// scroll reveal: fade + slide up as elements enter the viewport
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const groups = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(siblings => {
      siblings.forEach((el, i) => {
        el.style.transitionDelay = (i * 90) + 'ms';
      });
    });
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }
}
