/* EMBER & BUN — app.js
   Edit SIGNATURES / MENU below. FILM.count = frames in assets/seq/hero/{d,m} */
(() => {
'use strict';

const FILM = { count: 311, d: 'assets/seq/hero/d/', m: 'assets/seq/hero/m/', ext: '.webp' };

const SIGNATURES = [
  { id: 'house',   name: 'House Smash',       desc: 'Two thin patties, aged cheddar, pickles, shaved onion, house sauce.', price: 14, img: 'assets/menu/m1.webp' },
  { id: 'truffle', name: 'Truffle & Gruyère', desc: 'Thick-seared chuck, wild mushrooms, rocket and truffle aioli.',      price: 19, img: 'assets/menu/m2.webp' },
  { id: 'honey',   name: 'Hot Honey Chick',   desc: 'Buttermilk-fried thigh, chilli honey glaze, crunchy slaw, pickles.', price: 16, img: 'assets/menu/m3.webp' },
  { id: 'parm',    name: 'Parm Fries',        desc: 'Hand-cut, twice-fried, parmesan, parsley and flaky salt.',           price: 8,  img: 'assets/menu/m4.webp' },
];

const MENU = {
  burgers: [
    { id:'house',   name:'House Smash',       desc:'Two thin patties, aged cheddar, pickles, onion, house sauce.', price:14, note:'single 11', img:'assets/menu/m1.webp' },
    { id:'double',  name:'Double Ember',      desc:'Three patties, double cheddar, charred onion jam.', price:18, note:'big', img:'assets/menu/m1.webp' },
    { id:'truffle', name:'Truffle & Gruyère', desc:'Wild mushrooms, rocket, truffle aioli, brioche.', price:19, note:'chef', img:'assets/menu/m2.webp' },
    { id:'honey',   name:'Hot Honey Chick',   desc:'Fried thigh, chilli honey, slaw, pickles, potato bun.', price:16, note:'spicy', img:'assets/menu/m3.webp' },
    { id:'garden',  name:'Garden Smash',      desc:'Black bean & beet patty, smoked gouda, pickled shallot.', price:15, note:'veg', img:'assets/menu/m2.webp' },
    { id:'morning', name:'Morning Bun',       desc:'Smash patty, fried egg, hash brown, maple mayo. Until noon.', price:13, note:'am', img:'assets/menu/m1.webp' },
  ],
  fries: [
    { id:'classic', name:'Hand-cut Fries',     desc:'Skin-on, twice fried, flaky salt.', price:6, note:'side', img:'assets/menu/m4.webp' },
    { id:'parm',    name:'Parm Fries',         desc:'Parmesan, parsley, garlic oil.', price:8, note:'favourite', img:'assets/menu/m4.webp' },
    { id:'loaded',  name:'Ember Loaded Fries', desc:'Chopped smash patty, cheese sauce, jalapeño, house sauce.', price:12, note:'share', img:'assets/img/fries.webp' },
    { id:'rings',   name:'Onion Rings',        desc:'Beer-battered, smoked paprika mayo.', price:7, note:'side', img:'assets/img/detail.webp' },
  ],
  shakes: [
    { id:'vanilla', name:'Vanilla Bean Shake', desc:'Madagascar vanilla, thick enough for a spoon.', price:8, note:'16 oz', img:'assets/img/g3.webp' },
    { id:'malt',    name:'Burnt Caramel Malt', desc:'Salted caramel, malt, whipped cream.', price:9, note:'16 oz', img:'assets/img/g3.webp' },
    { id:'cola',    name:'Craft Cola',         desc:'House syrup, soda, lime. Bottomless at the counter.', price:4, note:'refill', img:'assets/img/burger-hero.webp' },
    { id:'lager',   name:'Corner Lager',       desc:'Local pale lager on draught.', price:7, note:'21+', img:'assets/img/g4.webp' },
  ],
};

/* helpers */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c;

function splitChars(el){
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map(c => `<span class="ch" aria-hidden="true">${/\s/.test(c) ? '&nbsp;' : esc(c)}</span>`).join('');
}
function splitWords(el){
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="line" style="display:inline-block"><span>${w}</span></span>`).join(' ');
}
$$('[data-split-chars]').forEach(splitChars);
$$('[data-split-words]').forEach(splitWords);

/* render menu */
$('#signatures').innerHTML = SIGNATURES.map((s, i) => `
  <article class="sig" data-tilt>
    <span class="sig__no">0${i + 1}</span>
    <div class="sig__img"><img src="${s.img}" alt="${s.name}" loading="lazy" decoding="async" width="760" height="760"></div>
    <h3>${s.name}</h3>
    <p>${s.desc}</p>
    <div class="sig__row"><span class="sig__price">$${s.price}</span>
      <button class="add" data-add="${s.id}" data-name="${s.name}" data-img="${s.img}">Add <span>+</span></button></div>
  </article>`).join('');

const board = $('#board');
function renderBoard(cat){
  board.innerHTML = MENU[cat].map(m => `
    <div class="item" data-peek="${m.img}">
      <h4>${m.name}</h4>
      <span class="price">$${m.price}<small>${m.note}</small></span>
      <button class="plus" aria-label="Add ${m.name}" data-add="${m.id}" data-name="${m.name}" data-img="${m.img}">+</button>
      <p>${m.desc}</p>
    </div>`).join('');
}
renderBoard('burgers');

/* loader */
const loaderCount = $('#loaderCount'), loaderBar = $('#loaderBar');
let shownPct = 0;
function setLoad(p){
  const v = Math.round(p * 100);
  if (v <= shownPct) return;
  shownPct = v; loaderCount.textContent = v; loaderBar.style.width = v + '%';
}

/* image-sequence film — compressed frames in memory, a small window of decoded
   ImageBitmaps around the playhead (bounded memory, no decode jank, no ghosting) */
const canvas = $('#filmCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const base = isMobile() ? FILM.m : FILM.d;
const blobs = new Array(FILM.count);            // compressed webp blobs (small)
const bmps = new Map();                         // index -> ImageBitmap | HTMLImageElement
const pending = new Set();
const CACHE = isMobile() ? 28 : 44;
const canBitmap = 'createImageBitmap' in window;
let cw = 0, ch = 0, drawn = -1, playhead = 0, dir = 1;

function sizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = canvas.width  = Math.round(canvas.clientWidth  * dpr);
  ch = canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  drawn = -1;
}
function url(i){ return base + String(i + 1).padStart(4, '0') + FILM.ext; }
// fetch() is blocked when the page is opened from disk (file://), so fall back to <img> loading there
const useImgLoad = location.protocol === 'file:' || !('fetch' in window);
function loadImg(i){
  return new Promise(res => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { blobs[i] = im; res(); };
    im.onerror = () => res();
    im.src = url(i);
  });
}
function fetchFrame(i){
  if (blobs[i]) return Promise.resolve();
  if (useImgLoad) return loadImg(i);
  return fetch(url(i)).then(r => r.ok ? r.blob() : null)
    .then(b => { if (b) blobs[i] = b; else return loadImg(i); })
    .catch(() => loadImg(i));
}
function decode(i){
  if (i < 0 || i >= FILM.count || bmps.has(i) || pending.has(i) || !blobs[i]) return;
  pending.add(i);
  const src = blobs[i];
  const isImg = src instanceof HTMLImageElement;
  const p = canBitmap ? createImageBitmap(src).catch(() => (isImg ? src.decode().then(() => src) : Promise.reject()))
    : isImg ? src.decode().then(() => src)
    : new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(src); });
  p.then(bm => {
    pending.delete(i); bmps.set(i, bm);
    if (Math.round(playhead) === i || drawn < 0) drawn = -1;
    evict();
  }).catch(() => pending.delete(i));
}
function evict(){
  if (bmps.size <= CACHE) return;
  const c = Math.round(playhead);
  const far = [...bmps.keys()].sort((a, b) => Math.abs(b - c) - Math.abs(a - c));
  while (bmps.size > CACHE){ const k = far.shift(); const b = bmps.get(k); if (b && b.close && !(b instanceof HTMLImageElement)) b.close(); bmps.delete(k); }
}
function prefetch(){
  const c = Math.round(playhead);
  decode(c);
  const ahead = isMobile() ? 14 : 22, behind = 8;
  for (let d = 1; d <= ahead; d++){ decode(c + d * dir); if (d <= behind) decode(c - d * dir); }
}
function nearest(i){
  if (bmps.has(i)) return i;
  for (let d = 1; d < 40; d++){ if (bmps.has(i - d)) return i - d; if (bmps.has(i + d)) return i + d; }
  return -1;
}
function draw(){
  const i = Math.round(playhead);
  const k = nearest(i);
  if (k < 0 || k === drawn) return;
  const img = bmps.get(k);
  const iw = img.width, ih = img.height;
  const r = Math.max(cw / iw, ch / ih), w = iw * r, h = ih * r;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  drawn = k;
}
async function loadPass(list, onEach){
  let k = 0;
  const worker = async () => { while (k < list.length){ const i = list[k++]; await fetchFrame(i); onEach && onEach(i); } };
  await Promise.all(Array.from({ length: 6 }, worker));
}
const order = (() => {
  const o = [], seen = new Set();
  [16, 8, 4, 2, 1].forEach(step => { for (let i = 0; i < FILM.count; i += step) if (!seen.has(i)){ seen.add(i); o.push(i); } });
  if (!seen.has(FILM.count - 1)) o.push(FILM.count - 1);
  return o;
})();
// gate the loader on the first ~2 seconds of film fully + a coarse pass of the rest
const firstPass = [...new Set([...Array.from({ length: Math.min(40, FILM.count) }, (_, i) => i), ...order.slice(0, Math.ceil(FILM.count / 16) + 1)])];

/* boot */
window.addEventListener('DOMContentLoaded', async () => {
  sizeCanvas();
  await fetchFrame(0); decode(0);
  let n = 0;
  await Promise.race([
    loadPass(firstPass, i => { setLoad(++n / firstPass.length); if (i < 24) decode(i); }),
    new Promise(r => setTimeout(r, 8000)),
  ]);
  setLoad(1);
  initMotion();
  loadPass(order, () => {});                      // rest streams in while the visitor reads the intro
});

function initMotion(){
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  let lenis = null;
  if (!reduced && window.Lenis){
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const mnav = $('#mnav'), toggle = $('#menuToggle');
  function closeMnav(){ mnav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); mnav.setAttribute('aria-hidden', 'true'); }
  toggle.addEventListener('click', () => {
    const open = !mnav.classList.contains('open');
    mnav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', open); mnav.setAttribute('aria-hidden', !open);
    lenis && (open ? lenis.stop() : lenis.start());
  });
  const scrollTo = target => {
    if (lenis){ lenis.start(); lenis.scrollTo(target, { duration: 1.6 }); }
    else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault(); closeMnav(); scrollTo(id === '#top' ? 0 : id);
  }));

  /* loader exit + intro */
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to('.loader__word .ch', { y: 0, opacity: 1, stagger: .04, duration: .9 }, 0)
    .fromTo('.loader', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, .7)
    .set('.loader', { display: 'none' })
    .add(() => document.body.classList.remove('is-loading'), .9)
    .fromTo(canvas, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, .8)
    .from('.intro__hello .line>span', { yPercent: 110, duration: 1.1 }, 1.25)
    .from('.intro__title .line>span', { yPercent: 105, duration: 1.3 }, 1.3)
    .from('.intro__copy .line>span', { yPercent: 110, stagger: .012, duration: 1 }, 1.45)
    .from('.nav', { yPercent: -100, duration: 1, clearProps: 'transform' }, 1.4)
    .from('.beat--card', { y: 40, autoAlpha: 0, duration: 1.1 }, 1.6)
    .from('.beat--ticker', { y: 20, autoAlpha: 0, duration: 1 }, 1.7);

  /* build: how an American burger is made (scrubbed SVG assembly, nested in the hero timeline) */
  let buildTl, buildUpdate;
  const FILM_P = .6, BUILD_T = 1 / FILM_P - 1;
  {
    const N = 11, lis = $$('#buildSteps li:not(.part)'), bar = $('#buildBar');
    gsap.set('#plateShadow', { opacity: 0 });
    gsap.set(['#chunks', '#mince', '#ball', '#pRaw', '#spatula', '#bBun', '#bSauce', '#bLettuce', '#bPickles', '#bPatty', '#bOnion', '#bTomato', '#bTop', '#seeds ellipse'], { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    buildUpdate = p => {
      const k = Math.max(0, Math.min(N - 1, Math.floor(p * N)));
      lis.forEach((li, n) => li.classList.toggle('is-on', n === k));
      bar.style.width = (Math.max(0, p) * 100) + '%';
    };
    lis[0].classList.add('is-on');
    // 01 grind
    tl.fromTo('#chunks', { y: -140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 }, 0)
      .to('#chunks', { y: 120, scale: .6, svgOrigin: '300 440', autoAlpha: 0, duration: .4, ease: 'power2.in' }, .5)
      .fromTo('#mince', { scaleY: 0, svgOrigin: '300 458', autoAlpha: 1 }, { scaleY: 1, duration: .45 }, .55)
    // 02 roll
      .to('#mince', { scale: .3, autoAlpha: 0, svgOrigin: '300 458', duration: .5 }, 1.1)
      .fromTo('#ball', { scale: .3, svgOrigin: '300 458', autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6 }, 1.2)
      .to('#ball', { y: -10, yoyo: true, repeat: 1, duration: .2, ease: 'sine.inOut' }, 1.8)
    // 03 smash
      .fromTo('#spatula', { y: -160, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3 }, 2)
      .to('#spatula', { y: 26, duration: .25, ease: 'power3.in' }, 2.35)
      .to('#ball', { scaleX: 1.9, scaleY: .5, svgOrigin: '300 458', autoAlpha: 0, duration: .25 }, 2.35)
      .fromTo('#pRaw', { scaleX: .6, svgOrigin: '300 458', autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: .25 }, 2.35)
      .to('#spatula', { y: -170, autoAlpha: 0, duration: .35, ease: 'power2.in' }, 2.7)
    // 04 sear & flip
      .to('#glow', { autoAlpha: 1, duration: .3 }, 3)
      .to('#pDone', { autoAlpha: 1, duration: .55, ease: 'none' }, 3.1)
      .to('#pattyA', { y: -34, duration: .15, ease: 'power2.out' }, 3.45)
      .to('#pattyA', { y: 0, duration: .15, ease: 'bounce.out' }, 3.62)
      .fromTo('#steam', { y: 0, autoAlpha: 0 }, { y: -26, autoAlpha: .7, duration: .6, ease: 'none' }, 3.2)
    // 05 melt
      .fromTo('#pCheeseA', { y: -70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, ease: 'bounce.out' }, 4.1)
      .to('#steam', { autoAlpha: 0, duration: .3 }, 4.7)
    // 06 toast & sauce
      .to('#sceneA', { y: 50, autoAlpha: 0, duration: .45, ease: 'power2.in' }, 5)
      .to('#plate', { autoAlpha: 1, duration: .4 }, 5.2)
      .to('#plateShadow', { autoAlpha: .35, duration: .4 }, 5.2)
      .fromTo('#bBun', { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, ease: 'bounce.out' }, 5.45)
      .fromTo('#bSauce', { y: -220, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, ease: 'power2.out' }, 5.8)
    // 07 crunch
      .fromTo('#bLettuce', { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 6)
      .fromTo('#bPickles ellipse', { y: -240, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .4, stagger: .12 }, 6.4)
    // 08 patty
      .fromTo('#bPatty', { y: -300, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, ease: 'bounce.out' }, 7)
    // 09 onion & tomato
      .fromTo('#bOnion', { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 8)
      .fromTo('#bTomato', { y: -280, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 8.35)
    // 10 crown
      .fromTo('#bTop', { y: -320, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, ease: 'bounce.out' }, 9)
      .to('#seeds ellipse', { autoAlpha: 1, duration: .2, stagger: .04 }, 9.6)
    // 11 served
      .to('#stack', { y: -14, scale: 1.04, svgOrigin: '300 480', duration: .6, ease: 'sine.inOut' }, 10)
      .to('#served', { autoAlpha: 1, duration: .4 }, 10.3)
      .to({}, { duration: .01 }, N);
    tl.duration(BUILD_T);
    buildTl = tl;
  }

  /* hero film timeline */
  const film = $('#film');
  const chapters = $$('.film__chapters li');
  const prog = $('#filmProgress');
  const state = { f: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: film, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: self => {
        prog.style.height = (self.progress * 100) + '%';
        const idx = self.progress >= FILM_P ? 5 : Math.min(4, Math.floor(self.progress / FILM_P * 5));
        buildUpdate((self.progress - FILM_P) / (1 - FILM_P));
        chapters.forEach((li, i) => li.classList.toggle('on', i === idx));
        film.classList.toggle('show-ch', self.progress > .04 && self.progress < FILM_P);
      } } });
  tl.to(state, { f: FILM.count - 1, duration: 1 }, 0);
  tl.to('.beat--intro .line>span, .beat--card, .beat--ticker', { yPercent: -60, autoAlpha: 0, duration: .04, stagger: .0008, ease: 'power2.in' }, .01);

  const windows = { 1: [.11, .27], 2: [.32, .46], 3: [.51, .655], 4: [.70, .84], 5: [.885, .97] };
  Object.entries(windows).forEach(([k, [a, b]]) => {
    const el = $(`.beat[data-beat="${k}"]`);
    const lines = $$('.line>span', el);
    const statsLi = $$('.stats li', el);
    tl.set(el, { autoAlpha: 1 }, a)
      .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: .045, stagger: .012, ease: 'power3.out' }, a);
    if (statsLi.length){
      tl.fromTo(statsLi, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .01, duration: .03, ease: 'power2.out' }, a + .03);
      $$('.stats b', el).forEach(bEl => {
        const o = { v: 0 }, to = +bEl.dataset.count;
        tl.to(o, { v: to, duration: .05, ease: 'power2.out', onUpdate: () => (bEl.textContent = Math.round(o.v)) }, a + .03);
      });
    }
    if (b < 1.5){
      tl.to(lines, { yPercent: -110, duration: .04, stagger: .006, ease: 'power2.in' }, b - .045);
      if (statsLi.length) tl.to(statsLi, { y: -30, autoAlpha: 0, duration: .03, ease: 'power2.in' }, b - .045);
      tl.set(el, { autoAlpha: 0 }, b);
    }
  });
  tl.to('.film__scrim', { opacity: .6, duration: .08 }, .9);
  tl.fromTo('#build', { autoAlpha: 0 }, { autoAlpha: 1, duration: .06 }, .96);
  tl.add(buildTl, 1);
  tl.to({}, { duration: .001 }, 1 / FILM_P);

  gsap.ticker.add(() => {
    const prev = playhead;
    playhead += (state.f - playhead) * 0.2;
    if (Math.abs(state.f - playhead) < 0.01) playhead = state.f;
    if (playhead !== prev) dir = playhead > prev ? 1 : -1;
    prefetch(); draw();
  });
  let rz, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { sizeCanvas(); draw(); if (window.innerWidth !== lastW){ lastW = window.innerWidth; ScrollTrigger.refresh(); } }, 150);
  });

  /* nav */
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
    const y = self.scroll();
    nav.classList.toggle('is-solid', y > film.offsetTop + film.offsetHeight - 80);
    nav.classList.toggle('is-hidden', y > 300 && y > lastY + 2 && !mnav.classList.contains('open'));
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
  } });

  /* line reveals */
  $$('.reveal-lines').forEach(h => {
    gsap.from($$('.line>span', h), { yPercent: 110, duration: 1.2, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  gsap.from('.about__side > *', { y: 30, autoAlpha: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.about__side', start: 'top 88%' } });
  gsap.from('.menu__note, .day__head p', { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.menu__note', start: 'top 90%' } });

  /* parallax figures */
  $$('[data-speed]').forEach(el => {
    const sp = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { y: () => -sp * window.innerHeight * .6 }, { y: () => sp * window.innerHeight * .6, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    const img = $('img', el);
    if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.collage__item', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, stagger: .12, ease: 'expo.out',
    scrollTrigger: { trigger: '.collage', start: 'top 80%' } });

  /* doodle draw */
  $$('.doodle path').forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.to('.doodle path', { strokeDashoffset: 0, stagger: .08, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top 70%', end: 'center 35%', scrub: 1 } });
  gsap.to('.doodle', { rotate: -8, y: -60, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* marquee with scroll velocity */
  const track = $('[data-marquee]');
  let mx = 0, boost = 0, mOn = false;
  ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onToggle: s => (mOn = s.isActive),
    onUpdate: s => { boost = gsap.utils.clamp(-14, 14, s.getVelocity() / 200); } });
  gsap.ticker.add(() => {
    if (!mOn) return;
    const half = track.scrollWidth / 2;
    mx -= 1.1 + Math.abs(boost); boost *= .92;
    if (-mx >= half) mx += half;
    track.style.transform = `translate3d(${mx}px,0,0)`;
  });

  /* menu */
  gsap.from('.sig', { y: 80, autoAlpha: 0, rotate: i => (i % 2 ? 3 : -3), duration: 1.2, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.signatures', start: 'top 85%' } });
  if (finePointer){
    $$('[data-tilt]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 800, duration: .6, ease: 'power3.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: .9, ease: 'elastic.out(1,.5)' }));
    });
  }
  const tabs = $$('.menu__tabs button'), ink = $('.menu__tabs-ink');
  function moveInk(btn){ ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft - 5}px)`; }
  moveInk(tabs[0]);
  window.addEventListener('resize', () => moveInk($('.menu__tabs .is-active')));
  tabs.forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('is-active')) return;
    tabs.forEach(t => { t.classList.toggle('is-active', t === b); t.setAttribute('aria-selected', t === b); });
    moveInk(b);
    gsap.to('.item', { y: -10, autoAlpha: 0, duration: .25, stagger: .02, onComplete: () => {
      renderBoard(b.dataset.tab); bindPeek();
      gsap.from('.item', { y: 24, autoAlpha: 0, duration: .7, stagger: .05, ease: 'expo.out' });
      ScrollTrigger.refresh();
    } });
  }));
  gsap.from('.item', { y: 30, autoAlpha: 0, duration: 1, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '#board', start: 'top 88%' } });

  /* floating image peek on hover */
  const peek = $('#peek'), peekImg = $('img', peek);
  const px = gsap.quickTo(peek, 'left', { duration: .5, ease: 'power3' }), py = gsap.quickTo(peek, 'top', { duration: .5, ease: 'power3' });
  function bindPeek(){
    if (!finePointer) return;
    $$('[data-peek]').forEach(it => {
      it.addEventListener('pointerenter', () => { peekImg.src = it.dataset.peek; peek.classList.add('on'); });
      it.addEventListener('pointerleave', () => peek.classList.remove('on'));
    });
  }
  if (finePointer) window.addEventListener('pointermove', e => { px(e.clientX + 140); py(e.clientY); }, { passive: true });
  bindPeek();

  /* cart */
  let count = 0, toastT;
  const cartCount = $('#cartCount'), toast = $('#toast');
  function showToast(html, ms){ toast.innerHTML = html; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), ms); }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    count++;
    nav.classList.remove('is-hidden');
    const fly = document.createElement('img');
    fly.src = btn.dataset.img; fly.className = 'fly'; fly.alt = '';
    const r = btn.getBoundingClientRect(), t = $('#orderBtn').getBoundingClientRect();
    document.body.appendChild(fly);
    gsap.set(fly, { left: r.left + r.width / 2 - 40, top: r.top - 40 });
    gsap.timeline({ onComplete: () => { fly.remove(); cartCount.textContent = count; cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump'); } })
      .to(fly, { left: t.left + t.width / 2 - 40, duration: .8, ease: 'power2.inOut' }, 0)
      .to(fly, { top: t.top - 20, duration: .8, ease: 'back.in(1.4)' }, 0)
      .to(fly, { scale: .25, rotate: 25, opacity: .6, duration: .8 }, 0);
    btn.classList.add('done'); setTimeout(() => btn.classList.remove('done'), 1200);
    showToast(`<b>+1</b> ${btn.dataset.name} added to your order`, 2200);
    // WooCommerce: POST /wp-json/wc/store/v1/cart/add-item  { id: PRODUCT_ID, quantity: 1 }  (header Nonce)
  });

  /* sear */
  const vid = $('#searVideo');
  ScrollTrigger.create({ trigger: '#sear', start: 'top bottom', end: 'bottom top',
    onToggle: s => (s.isActive ? vid.play().catch(() => {}) : vid.pause()) });
  const stl = gsap.timeline({ scrollTrigger: { trigger: '#sear', start: 'top top', end: 'bottom bottom', scrub: true } });
  stl.fromTo('.sear__media', { clipPath: isMobile() ? 'inset(6% 6% 30% 6% round 12px)' : 'inset(12% 8% 12% 8% round 12px)' },
                             { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: .45 }, 0)
     .to('.sear__media video', { scale: 1, ease: 'none', duration: 1 }, 0)
     .to('.sear__card', { y: 0, ease: 'power2.out', duration: .5 }, .25);
  $$('.sear__stats b[data-count]').forEach(bEl => {
    const o = { v: 0 };
    gsap.to(o, { v: +bEl.dataset.count, duration: 1.6, ease: 'power3.out', onUpdate: () => (bEl.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: '#sear', start: '40% top' } });
  });

  /* day gallery (horizontal) */
  const dayTrack = $('#dayTrack');
  const dist = () => Math.max(0, dayTrack.scrollWidth - window.innerWidth);
  gsap.to(dayTrack, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '#day', pin: '.day__pin', start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
  gsap.from('.shot', { y: i => 60 + (i % 3) * 40, autoAlpha: 0, duration: 1.2, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '#day', start: 'top 70%' } });

  /* visit */
  gsap.from('.visit__cols > div, .book, .visit .pill--line', { y: 30, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.visit__cols', start: 'top 90%' } });
  gsap.from('.tape', { rotate: 10, scale: .85, autoAlpha: 0, duration: 1.4, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '.visit__media', start: 'top 80%' } });
  $('#bookForm input[type=date]').min = new Date().toISOString().slice(0, 10);
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    showToast(`<b>✓</b> Table for ${fd.get('guests')} on ${fd.get('date')} at ${fd.get('time')}. See you soon.`, 3200);
    e.target.reset();
  });

  /* footer wordmark */
  gsap.to('.foot__word .ch', { y: 0, duration: 1.3, stagger: .045, ease: 'expo.out', scrollTrigger: { trigger: '.foot__word', start: 'top 98%' } });
  gsap.from('.foot__top > *', { y: 30, autoAlpha: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { moveInk($('.menu__tabs .is-active')); ScrollTrigger.refresh(); });
}
})();
