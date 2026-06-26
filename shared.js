// custom red dot cursor + faint trail (shared across pages)
const glow = document.getElementById('glow');
const trailCanvas = document.getElementById('trail');
const tctx = trailCanvas ? trailCanvas.getContext('2d') : null;
let trailPoints = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
