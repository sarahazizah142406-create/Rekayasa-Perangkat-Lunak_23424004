/* ================================================================
   KOPI KOPEN — script.js  (v4 dengan komentar lengkap)

   DAFTAR MODUL:
   1.  Loader          — progress bar & fade-out loading screen
   2.  Navbar          — scroll state, active link, mobile menu
   3.  Hero Slideshow  — autoplay, Ken Burns, progress, swipe
   4.  Gallery Carousel— drag mouse/touch, pagination dots
   5.  Scroll Reveal   — IntersectionObserver fade-in
   6.  Counter         — animasi angka naik
   7.  Modal Menu      — lightbox detail menu + tombol WA
   8.  Modal Cabang    — daftar lokasi cabang yang bisa diklik
   9.  Form Kontak     — validasi realtime + simulasi kirim
   10. Smooth Scroll   — scroll halus ke anchor
   11. Back to Top     — tombol kembali ke atas
   12. Micro-interactions — ripple, tilt, hover feedback
   ================================================================ */

'use strict';

/* ── Shortcut selector (seperti jQuery $ tapi murni JS) ─────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ================================================================
   1. LOADER — Progress bar bertambah saat halaman dimuat,
               loading screen hilang setelah window.load
   ================================================================ */
(function initLoader() {
  const loader    = $('#loader');
  const loaderBar = $('#loaderBar');
  if (!loader) return;

  let progress = 0;

  /* Simulasi progress bertambah setiap 120ms */
  const ticker = setInterval(() => {
    /* Tambahan lebih cepat saat < 70%, melambat setelah itu */
    progress += progress < 70 ? Math.random() * 12 : Math.random() * 2.5;
    if (progress > 90) progress = 90; /* berhenti di 90% sampai window load */
    loaderBar.style.width = progress + '%';
  }, 120);

  /* Setelah semua aset (gambar, font, dll) selesai dimuat */
  window.addEventListener('load', () => {
    clearInterval(ticker);        /* hentikan simulasi */
    loaderBar.style.width = '100%'; /* lengkapi ke 100% */

    /* Tunda sedikit supaya user sempat lihat 100% */
    setTimeout(() => {
      loader.classList.add('hidden'); /* CSS transition: fade + visibility */

      /* Hapus dari DOM setelah transisi selesai (±600ms) */
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 400);
  });
})();
/* ================================================================
   1. LOADER — Progress bar bertambah saat halaman dimuat,
               loading screen hilang setelah window.load
   ================================================================ */
(function initLoader() {
  const loader    = $('#loader');
  const loaderBar = $('#loaderBar');
  if (!loader) return;

  let progress = 0;

  /* Simulasi progress bertambah setiap 120ms */
  const ticker = setInterval(() => {
    /* Tambahan lebih cepat saat < 70%, melambat setelah itu */
    progress += progress < 70 ? Math.random() * 12 : Math.random() * 2.5;
    if (progress > 90) progress = 90; /* berhenti di 90% sampai window load */
    loaderBar.style.width = progress + '%';
  }, 120);

  /* Fungsi untuk menghilangkan loader */
  function hideLoader() {
    if (loader._hidden) return; // sudah dijalankan
    loader._hidden = true;
    clearInterval(ticker);
    loaderBar.style.width = '100%';
    
    loader.classList.add('hidden');
    
    // Fallback: jika transitionend tidak terpanggil dalam 800ms, hapus paksa
    const timeout = setTimeout(() => {
      if (loader.parentNode) loader.remove();
    }, 800);
    
    loader.addEventListener('transitionend', () => {
      clearTimeout(timeout);
      if (loader.parentNode) loader.remove();
    }, { once: true });
  }

  /* Setelah semua aset (gambar, font, dll) selesai dimuat */
  window.addEventListener('load', () => {
    // Tunda sedikit supaya user sempat lihat 100%
    setTimeout(hideLoader, 400);
  });
  
  // Jaga-jaga jika load sudah terjadi sebelum event listener dipasang
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 400);
  }
})();

/* ================================================================
   2. NAVBAR — Scroll shadow, active link tracking, mobile menu
   ================================================================ */
(function initNavbar() {
  const navbar     = $('#navbar');
  const hamburger  = $('#hamburger');
  const navLinks   = $('#navLinks');
  const navOverlay = $('#navOverlay');
  if (!navbar) return;

  /* -- Scroll: tambah class .scrolled saat lewat 50px ---------- */
  function onScroll() {
    /* Navbar berubah dari transparan ke solid saat scroll */
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();

    /* Tombol "back to top" muncul setelah scroll 420px */
    const backTop = $('#backTop');
    if (backTop) backTop.classList.toggle('show', window.scrollY > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* jalankan sekali saat pertama load */

  /* -- Active link: highlight nav-link sesuai section terlihat -- */
  function updateActiveLink() {
    const sections = $$('section[id]');
    let currentId  = '';

    /* Cari section yang posisinya sudah dilewati scroll */
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 95) currentId = sec.id;
    });

    $$('.nav-link').forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /* -- Mobile menu: buka/tutup ---------------------------------- */
  function openMenu() {
    navLinks.classList.add('open');       /* slide masuk dari kanan */
    navOverlay.classList.add('show');     /* overlay gelap muncul */
    hamburger.classList.add('open');      /* ikon jadi X */
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; /* cegah scroll body */
  }
  function closeMenu() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* Klik hamburger → toggle menu */
  hamburger.addEventListener('click', () =>
    navLinks.classList.contains('open') ? closeMenu() : openMenu()
  );
  navOverlay.addEventListener('click', closeMenu);        /* klik overlay → tutup */
  $$('.nav-link').forEach(l => l.addEventListener('click', closeMenu)); /* klik link → tutup */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); }); /* Esc → tutup */
})();


/* ================================================================
   3. HERO SLIDESHOW — Autoplay 5 detik, Ken Burns, progress bar
   ================================================================ */
(function initHero() {
  const slides  = $$('.slide');           /* foto-foto background */
  const titles  = $$('.hero-title');      /* headline per slide */
  const dots    = $$('.sdot');            /* dot indicator */
  const fill    = $('#progressFill');     /* progress bar */
  const btnPrev = $('#slidePrev');
  const btnNext = $('#slideNext');
  if (!slides.length) return;

  const TOTAL    = slides.length;
  const DURATION = 5000; /* ms antar slide */
  let current    = 0;    /* index slide aktif */
  let progTimer  = null; /* interval progress bar */
  let progVal    = 0;    /* nilai progress 0–100 */

  /* -- Pindah ke slide tertentu --------------------------------- */
  function goTo(idx) {
    const prev = current;
    current    = ((idx % TOTAL) + TOTAL) % TOTAL;
    if (current === prev) return;

    /* Hapus state aktif dari slide/title sebelumnya */
    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit');      /* trigger transition keluar */
    titles[prev].classList.remove('active');
    titles[prev].classList.add('exit');

    /* Bersihkan class exit setelah animasi selesai */
    setTimeout(() => {
      slides[prev].classList.remove('exit');
      titles[prev].classList.remove('exit');
    }, 1200);

    /* Aktifkan slide/title baru */
    slides[current].classList.add('active');
    titles[current].classList.add('active');

    /* Update dots */
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  /* -- Progress bar: terisi dari 0 → 100% dalam DURATION ms ---- */
  function startProgress() {
    stopProgress();
    progVal = 0;
    if (fill) fill.style.width = '0%';

    const step = 100 / (DURATION / 80); /* seberapa banyak per 80ms */
    progTimer = setInterval(() => {
      progVal = Math.min(progVal + step, 100);
      if (fill) fill.style.width = progVal + '%';

      /* Saat mencapai 100% → lanjut ke slide berikutnya */
      if (progVal >= 100) {
        stopProgress();
        goTo(current + 1);
        startProgress();
      }
    }, 80);
  }
  function stopProgress() { clearInterval(progTimer); }

  /* -- Tombol navigasi ------------------------------------------ */
  btnNext && btnNext.addEventListener('click', () => { stopProgress(); goTo(current + 1); startProgress(); });
  btnPrev && btnPrev.addEventListener('click', () => { stopProgress(); goTo(current - 1); startProgress(); });

  /* Klik dot */
  dots.forEach(dot => dot.addEventListener('click', () => {
    const i = parseInt(dot.dataset.i);
    if (i !== current) { stopProgress(); goTo(i); startProgress(); }
  }));

  /* -- Swipe touch di layar hero -------------------------------- */
  let touchStartX = 0;
  const heroEl = $('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        stopProgress();
        dx < 0 ? goTo(current + 1) : goTo(current - 1); /* kiri/kanan */
        startProgress();
      }
    }, { passive: true });
  }

  /* -- Navigasi keyboard (←/→) ---------------------------------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { stopProgress(); goTo(current + 1); startProgress(); }
    if (e.key === 'ArrowLeft')  { stopProgress(); goTo(current - 1); startProgress(); }
  });

  /* -- Pause saat hover ----------------------------------------- */
  heroEl && heroEl.addEventListener('mouseenter', stopProgress);
  heroEl && heroEl.addEventListener('mouseleave', startProgress);

  /* Mulai autoplay */
  startProgress();
})();


/* ================================================================
   4. GALLERY CAROUSEL — Drag mouse/touch, dots pagination
   ================================================================ */
(function initCarousel() {
  const track    = $('#carTrack');
  const viewport = $('#carViewport');
  const btnPrev  = $('#carPrev');
  const btnNext  = $('#carNext');
  const dotsWrap = $('#carDots');
  if (!track) return;

  const cards    = $$('.menu-card', track); /* semua kartu menu */
  const GAP      = 18;    /* gap antar kartu dalam px (≈ 1.1rem) */
  let cardW      = 270;   /* lebar satu kartu */
  let visCount   = 4;     /* jumlah kartu terlihat sekaligus */
  let page       = 0;     /* halaman carousel saat ini */
  let totalPages = 1;

  /* Drag state */
  let isDragging    = false;
  let dragStartX    = 0;
  let dragStartPosX = 0;  /* posX saat drag mulai */
  let posX          = 0;  /* translateX carousel saat ini */

  /* -- Build/Rebuild carousel ----------------------------------- */
  function build() {
    const vpW = viewport.offsetWidth;

    /* Tentukan jumlah kartu terlihat dan lebar kartu */
    if      (vpW < 500)  { visCount = 1; cardW = Math.min(255, vpW - 48); }
    else if (vpW < 720)  { visCount = 2; cardW = 240; }
    else if (vpW < 1000) { visCount = 3; cardW = 255; }
    else                 { visCount = 4; cardW = 265; }

    totalPages = Math.max(1, Math.ceil(cards.length / visCount));
    page       = Math.min(page, totalPages - 1);

    /* Buat dots pagination */
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className     = 'car-dot' + (i === 0 ? ' active' : '');
      dot.role          = 'tab';
      dot.setAttribute('aria-label', `Halaman ${i + 1}`);
      dot.addEventListener('click', () => goToPage(i));
      dotsWrap.appendChild(dot);
    }
    render(false); /* render tanpa animasi pertama kali */
  }

  /* -- Pindah ke halaman tertentu ------------------------------- */
  function goToPage(p, animate = true) {
    page = Math.max(0, Math.min(p, totalPages - 1));
    render(animate);
  }

  /* -- Terapkan transform dan update UI ------------------------- */
  function render(animate = true) {
    /* Hitung posisi X berdasarkan halaman */
    posX = -(page * visCount * (cardW + GAP));

    if (!animate) track.classList.add('no-anim');
    track.style.transform = `translateX(${posX}px)`;
    if (!animate) requestAnimationFrame(() => track.classList.remove('no-anim'));

    /* Sinkronisasi dots */
    $$('.car-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === page));

    /* Disable tombol di batas awal/akhir */
    if (btnPrev) btnPrev.disabled = page === 0;
    if (btnNext) btnNext.disabled = page >= totalPages - 1;
  }

  /* Tombol panah */
  btnPrev && btnPrev.addEventListener('click', () => goToPage(page - 1));
  btnNext && btnNext.addEventListener('click', () => goToPage(page + 1));

  /* -- Drag: mouse -------------------------------------------- */
  function onDragStart(clientX) {
    isDragging    = true;
    dragStartX    = clientX;
    dragStartPosX = posX;
    track.classList.add('no-anim');      /* matikan transisi saat drag */
    viewport.style.cursor = 'grabbing';
  }
  function onDragMove(clientX) {
    if (!isDragging) return;
    const dx = clientX - dragStartX;
    track.style.transform = `translateX(${dragStartPosX + dx}px)`; /* ikuti jari */
  }
  function onDragEnd(clientX) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('no-anim');
    viewport.style.cursor = 'grab';

    const dx = clientX - dragStartX;
    if      (dx < -60) goToPage(page + 1); /* geser kiri → halaman berikutnya */
    else if (dx > 60)  goToPage(page - 1); /* geser kanan → halaman sebelumnya */
    else               render(true);        /* tidak cukup → kembali ke posisi */
  }

  /* Event mouse */
  viewport.addEventListener('mousedown',  e => onDragStart(e.clientX));
  window .addEventListener('mousemove',   e => onDragMove(e.clientX));
  window .addEventListener('mouseup',     e => onDragEnd(e.clientX));

  /* Event touch */
  viewport.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  window .addEventListener('touchmove',   e => isDragging && onDragMove(e.touches[0].clientX), { passive: true });
  window .addEventListener('touchend',    e => onDragEnd(e.changedTouches[0].clientX), { passive: true });

  /* -- Keyboard carousel (untuk aksesibilitas) ----------------- */
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goToPage(page + 1);
    if (e.key === 'ArrowLeft')  goToPage(page - 1);
  });

  /* Build awal + rebuild saat resize */
  build();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 180);
  });
})();


/* ================================================================
   5. SCROLL REVEAL — Elemen dengan .reveal menjadi terlihat
      saat masuk viewport (IntersectionObserver)
   ================================================================ */
(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view'); /* trigger CSS animation */
        observer.unobserve(entry.target);       /* hanya animasi sekali */
      }
    });
  }, {
    threshold: 0.13,           /* 13% elemen terlihat → trigger */
    rootMargin: '0px 0px -55px 0px' /* sedikit "lebih dalam" */
  });

  elements.forEach(el => observer.observe(el));
})();


/* ================================================================
   6. COUNTER ANIMATION — Angka naik smooth menggunakan rAF
   ================================================================ */
(function initCounter() {
  const section = $('#counter');
  const nums    = $$('.cnum');
  if (!section || !nums.length) return;

  let counterFired = false; /* flag agar hanya berjalan sekali */

  /* -- Fungsi easing: ease-out cubic --------------------------- */
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  /* -- Animasi satu angka dari 0 ke 'target' ------------------- */
  function animateNum(el, target, duration = 1900) {
    const t0 = performance.now();
    function frame(now) {
      const progress = Math.min((now - t0) / duration, 1);
      const value    = Math.floor(easeOutCubic(progress) * target);
      el.textContent = value.toLocaleString('id-ID'); /* format ribuan */
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString('id-ID'); /* nilai akhir */
    }
    requestAnimationFrame(frame);
  }

  /* -- Observer: trigger saat section counter terlihat --------- */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counterFired) {
      counterFired = true; /* jangan jalankan lagi */

      /* Animasi tiap angka dengan stagger delay */
      nums.forEach((el, i) => {
        const target = parseInt(el.dataset.to, 10);
        setTimeout(() => animateNum(el, target), i * 130);
      });

      observer.unobserve(section);
    }
  }, { threshold: 0.3 });

  observer.observe(section);
})();


/* ================================================================
   7. MODAL MENU — Buka/tutup modal detail menu
      Data diambil dari data-* attribute di artikel kartu menu
   ================================================================ */
(function initMenuModal() {
  const bg       = $('#modalBg');       /* overlay gelap */
  const closeBtn = $('#modalClose');
  if (!bg) return;

  /* Elemen di dalam modal */
  const mImg    = $('#mImg');
  const mBadge  = $('#mBadge');
  const mTitle  = $('#modalTitle');
  const mDesc   = $('#mDesc');
  const mPrice  = $('#mPrice');
  const mRating = $('#mRating');
  const mBtn    = $('#mOrderBtn');

  /* -- Buka modal dengan data dari kartu yang diklik ----------- */
  function openModal(card) {
    const d = card.dataset; /* ambil semua data-* attribute */

    /* Isi konten modal */
    mImg.src           = d.img    || '';
    mImg.alt           = d.name   || '';
    mBadge.textContent = d.badge  || '';
    mTitle.textContent = d.name   || '';
    mDesc.textContent  = d.desc   || '';
    mPrice.textContent = d.price  || '';
    mRating.textContent= `⭐ ${d.rating}`;

    /*
      ★ LINK WHATSAPP DINAMIS
      Pesan otomatis terisi nama menu dan harga.
      Format: wa.me/nomor?text=pesan_terenkoding
    */
    const waText = `Halo Kopi Kopen! Saya ingin memesan *${d.name}* (${d.price}). Apakah tersedia sekarang? 😊`;
    mBtn.href = `https://wa.me/6281234944443?text=${encodeURIComponent(waText)}`;

    /* Tampilkan modal */
    bg.classList.add('open');
    document.body.style.overflow = 'hidden'; /* matikan scroll body */
    closeBtn.focus(); /* fokus ke tombol tutup (aksesibilitas) */
  }

  /* -- Tutup modal --------------------------------------------- */
  function closeModal() {
    bg.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Event listeners tutup modal */
  closeBtn.addEventListener('click', closeModal);
  bg.addEventListener('click', e => { if (e.target === bg) closeModal(); }); /* klik di luar */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* -- Pasang event ke semua kartu menu ------------------------ */
  $$('.menu-card').forEach(card => {
    /* Klik mouse */
    card.addEventListener('click', () => openModal(card));
    /* Keyboard Enter/Space (aksesibilitas) */
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });
})();


/* ================================================================
   8. MODAL CABANG — Daftar cabang yang bisa diklik dari counter
   ================================================================ */
(function initBranchModal() {
  const bg       = $('#branchModalBg');
  const closeBtn = $('#branchModalClose');
  if (!bg) return;

  /* -- Buka modal cabang --------------------------------------- */
  window.openBranchModal = function() {
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  };

  /* -- Tutup modal cabang ------------------------------------- */
  function closeBranchModal() {
    bg.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeBranchModal);
  bg.addEventListener('click', e => { if (e.target === bg) closeBranchModal(); });
  /* Esc juga menutup jika branch modal terbuka */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bg.classList.contains('open')) closeBranchModal();
  });
})();


/* ================================================================
   9. FORM KONTAK — Validasi realtime + simulasi kirim
   ================================================================ */
(function initForm() {
  const form   = $('#contactForm');
  const btnEl  = $('#formBtn');
  const btnLbl = $('#btnLabel');
  const formOk = $('#formOk');
  if (!form) return;

  /* Konfigurasi field: id input, id elemen error, fungsi validasi */
  const fieldConfig = {
    'f-nama': {
      errId: 'e-nama',
      validate: v => v.trim().length >= 2
        ? '' /* valid → pesan kosong */
        : 'Nama minimal 2 karakter.'
    },
    'f-email': {
      errId: 'e-email',
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ''
        : 'Masukkan alamat email yang valid.'
    },
    'f-pesan': {
      errId: 'e-pesan',
      validate: v => v.trim().length >= 10
        ? ''
        : 'Pesan minimal 10 karakter.'
    },
  };

  /* -- Tampilkan error di bawah field -------------------------- */
  function showErr(fieldId, errId, msg) {
    const input = $(`#${fieldId}`);
    const errEl = $(`#${errId}`);
    if (!input || !errEl) return;

    if (msg) {
      input.classList.add('err');     /* border merah */
      errEl.textContent = msg;
    } else {
      input.classList.remove('err');  /* hilangkan error */
      errEl.textContent = '';
    }
  }

  /* -- Validasi live saat blur & saat input (jika sudah error) - */
  Object.entries(fieldConfig).forEach(([fid, cfg]) => {
    const el = $(`#${fid}`);
    if (!el) return;

    /* blur → validasi setelah field ditinggalkan */
    el.addEventListener('blur', () =>
      showErr(fid, cfg.errId, cfg.validate(el.value))
    );
    /* input → hapus error langsung saat user mulai mengetik */
    el.addEventListener('input', () => {
      if (el.classList.contains('err'))
        showErr(fid, cfg.errId, cfg.validate(el.value));
    });
  });

  /* -- Submit form --------------------------------------------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    formOk.classList.remove('show'); /* sembunyikan pesan sukses lama */

    /* Validasi semua field */
    let allValid = true;
    Object.entries(fieldConfig).forEach(([fid, cfg]) => {
      const el  = $(`#${fid}`);
      const msg = cfg.validate(el ? el.value : '');
      showErr(fid, cfg.errId, msg);
      if (msg) allValid = false;
    });
    if (!allValid) return; /* hentikan jika ada error */

    /* Simulasi pengiriman: loading state */
    btnEl.disabled    = true;
    btnLbl.textContent = 'Mengirim…';

    /*
      ★ DI SINI Anda bisa mengganti dengan fetch() ke backend,
        misalnya: fetch('/api/contact', { method:'POST', body: new FormData(form) })
    */
    setTimeout(() => {
      formOk.classList.add('show'); /* tampilkan pesan sukses */
      form.reset();
      btnEl.disabled    = false;
      btnLbl.textContent = 'Kirim Pesan';

      /* Auto-hilangkan pesan sukses setelah 7 detik */
      setTimeout(() => formOk.classList.remove('show'), 7000);
    }, 1600);
  });
})();


/* ================================================================
   10. SMOOTH SCROLL — Klik anchor (#link) scroll dengan halus
   ================================================================ */
(function initSmoothScroll() {
  /* Delegasi event: tangkap semua klik link anchor */
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    /* Offset = tinggi navbar supaya section tidak tertutup */
    const navH    = ($('#navbar') || {}).offsetHeight || 70;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH + 1;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
})();


/* ================================================================
   11. BACK TO TOP — Kembali ke atas dengan smooth scroll
   ================================================================ */
(function initBackTop() {
  const btn = $('#backTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ================================================================
   12. MICRO-INTERACTIONS — Detail kecil yang bikin terasa premium
   ================================================================ */
(function initMicroInteractions() {

  /* -- a. Ripple effect pada semua tombol ---------------------- */
  /*
    Saat tombol diklik, muncul lingkaran putih transparan
    yang melebar dari titik klik (seperti material design)
  */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;

      /* Buat elemen ripple */
      const ripple      = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px; top: ${y}px;
        width: 0; height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,.3);
        transform: translate(-50%, -50%);
        animation: rippleAnim .55s ease-out forwards;
        pointer-events: none;
        z-index: 0;
      `;

      /* Pastikan tombol punya overflow:hidden untuk efek terpotong */
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      /* Hapus setelah animasi selesai */
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* -- b. Sisipkan keyframe ripple sekali ke <head> ------------ */
  if (!document.getElementById('ripple-kf')) {
    const style     = document.createElement('style');
    style.id        = 'ripple-kf';
    style.textContent = '@keyframes rippleAnim { to { width: 200px; height: 200px; opacity: 0; } }';
    document.head.appendChild(style);
  }

  /* -- c. Tilt 3D pada kartu harga saat hover ------------------ */
  document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      /* Hitung sudut tilt berdasarkan posisi mouse relatif ke tengah */
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * 5;
      const ry = ((r.left + r.width / 2 - e.clientX)  / (r.width  / 2)) * 5;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''; /* reset */
    });
  });

  /* -- d. Kartu penghargaan: shimmer border saat hover --------- */
  document.querySelectorAll('.award-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--c-gold)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
  });

  /* -- e. Micro-bounce pada nav-link saat klik ----------------- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      this.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-3px)' },
        { transform: 'translateY(0)' },
      ], { duration: 250, easing: 'ease-out' });
    });
  });

})();
/* ================================================================
   13. FILTER MENU BERDASARKAN KATEGORI
   ================================================================ */
(function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const track = document.getElementById('carTrack');
  const cards = document.querySelectorAll('.menu-card');
  const viewport = document.getElementById('carViewport');
  const dotsWrap = document.getElementById('carDots');
  
  if (!filterBtns.length || !track) return;

  let currentFilter = 'all';

  function filterMenu(category) {
    let visibleCount = 0;
    
    cards.forEach(card => {
      const cardCategory = card.dataset.category;
      if (category === 'all' || cardCategory === category) {
        card.style.display = ''; // tampilkan
        visibleCount++;
      } else {
        card.style.display = 'none'; // sembunyikan
      }
    });

    // Reset posisi track
    track.style.transform = 'translateX(0px)';
    
    // Rebuild carousel dots
    if (dotsWrap) {
      const vpW = viewport ? viewport.offsetWidth : 1000;
      let visCount = 4;
      if (vpW < 500) visCount = 1;
      else if (vpW < 720) visCount = 2;
      else if (vpW < 1000) visCount = 3;
      else visCount = 4;
      
      const totalPages = Math.max(1, Math.ceil(visibleCount / visCount));
      
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'car-dot' + (i === 0 ? ' active' : '');
        dot.role = 'tab';
        dot.setAttribute('aria-label', `Halaman ${i + 1}`);
        dot.addEventListener('click', () => {
          // go to page function will be called
          const newPage = i;
          const newPosX = -(newPage * visCount * 270);
          track.style.transform = `translateX(${newPosX}px)`;
          document.querySelectorAll('.car-dot').forEach((d, idx) => {
            d.classList.toggle('active', idx === newPage);
          });
        });
        dotsWrap.appendChild(dot);
      }
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter === currentFilter) return;
      
      currentFilter = filter;
      
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      filterMenu(filter);
    });
  });
})();

/* ================================================================
   LOG — Pesan di browser console (untuk developer)
   ================================================================ */
console.log(
  '%c☕  Kopi Kopen v4.0  |  Made with Poppins & ❤️',
  [
    'color: #1B5E20',
    'font-weight: 700',
    'font-size: 13px',
    'padding: 4px 10px',
    'border-radius: 6px',
    'background: #E8F5E9',
  ].join(';')
);

/*
  ================================================================
  PANDUAN KUSTOMISASI CEPAT:
  ================================================================
  1. Ganti nomor WA  → cari "6281234944443" ganti ke nomor Anda
  2. Ganti logo      → taruh file di assets/logo.png
  3. Ganti foto menu → ubah src="..." di setiap .menu-card
  4. Tambah cabang   → copy-paste <div class="branch-item"> di modal
  5. Ubah warna      → edit :root variabel di style.css baris 10-30
  ================================================================
*/