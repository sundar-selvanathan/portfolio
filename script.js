/* ==========================================================================
   PORTFOLIO SITE - SCRIPT
   ========================================================================== */

// ── Scroll Detection (Nav background) ───────────────────────────
const header = document.getElementById('main-header');

function onScroll() {
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
if (header) {
  onScroll(); // initial check
}

// ── Mobile Menu Toggle ──────────────────────────────────────────
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isOpen);

    // Animate hamburger to X
    const bars = menuBtn.querySelectorAll('.menu-bar');
    if (isOpen) {
      bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    }
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      const bars = menuBtn.querySelectorAll('.menu-bar');
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    });
  });
}

// ── Scroll Reveal (IntersectionObserver) ────────────────────────
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '-40px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

// ── Contact Form Handling (Web3Forms API Integration) ───────────
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');

if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
    .then(async (response) => {
      let jsonResponse = await response.json();
      if (response.status === 200) {
        contactForm.style.display = 'none';
        contactSuccess.style.display = 'flex';
      } else {
        console.error(response);
        alert(jsonResponse.message || "Something went wrong! Please try again.");
      }
    })
    .catch(error => {
      console.error(error);
      alert("Network error! Please check your connection and try again.");
    })
    .then(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  });
}

// ── Testimonials Horizontal Carousel Slider ──────────────────────
(function initTestimonialsCarousel() {
  var viewport = document.getElementById('testimonials-viewport');
  var track = document.getElementById('testimonials-track');
  var prevBtn = document.getElementById('testimonial-prev');
  var nextBtn = document.getElementById('testimonial-next');
  var dotsContainer = document.getElementById('testimonials-dots');
  var wrapper = document.querySelector('.testimonials-carousel-wrapper');

  if (!viewport || !track) return;

  var cards = track.querySelectorAll('.testimonial-card');
  var totalCards = cards.length;
  var currentIndex = 0;
  var autoScrollTimer = null;
  var AUTO_SCROLL_DELAY = 4000;
  var isHovered = false;

  // ── Modal Elements & Logic ──
  var modal = document.getElementById('testimonial-modal');
  var modalText = document.getElementById('modal-text');
  var modalFooter = document.getElementById('modal-footer');
  var modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(card, fullText) {
    if (!modal || !modalText || !modalFooter) return;
    modalText.textContent = fullText;
    
    // Copy footer info
    var footerOriginal = card.querySelector('.testimonial-footer');
    if (footerOriginal) {
      modalFooter.innerHTML = footerOriginal.innerHTML;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (wrapper) wrapper.classList.add('paused');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (wrapper && !isHovered) {
      wrapper.classList.remove('paused');
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // ── JS-based text truncation with Modal Trigger ──
  function updateAllTruncations() {
    var targetLines = 10; // 10 lines across all breakpoints
    var fontSize = 14;
    var lineHeightRatio = 1.6;
    var maxTextHeight = targetLines * fontSize * lineHeightRatio;

    cards.forEach(function(card) {
      var textEl = card.querySelector('.testimonial-text');
      if (!textEl) return;

      var fullText = textEl.getAttribute('data-full-text') || textEl.textContent.trim();
      textEl.setAttribute('data-full-text', fullText);

      // Measure actual height with full text
      textEl.innerHTML = fullText;
      textEl.style.maxHeight = 'none';
      textEl.style.overflow = 'visible';

      var actualHeight = textEl.scrollHeight;

      if (actualHeight > maxTextHeight + 4) {
        applyTruncation(card, textEl, fullText, maxTextHeight);
      } else {
        textEl.innerHTML = fullText;
        textEl.style.maxHeight = 'none';
        textEl.style.overflow = 'visible';
      }
    });
  }

  function applyTruncation(card, textEl, fullText, maxTextHeight) {
    var low = 0;
    var high = fullText.length;
    var best = fullText.length;

    textEl.style.maxHeight = 'none';
    textEl.style.overflow = 'visible';

    while (low <= high) {
      var mid = Math.floor((low + high) / 2);
      textEl.innerHTML = fullText.substring(0, mid) + '\u2026 <span class="testimonial-read-toggle">Read more</span>';

      if (textEl.scrollHeight <= maxTextHeight + 4) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    textEl.innerHTML = fullText.substring(0, best) + '\u2026 <span class="testimonial-read-toggle">Read more</span>';
    textEl.style.maxHeight = 'none';
    textEl.style.overflow = 'visible';

    var toggle = textEl.querySelector('.testimonial-read-toggle');
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal(card, fullText);
      });
    }
  }

  // ── Carousel helpers ──
  function getStepDistance() {
    var firstCard = cards[0];
    if (!firstCard) return 320;
    return firstCard.getBoundingClientRect().width + 24;
  }

  function getCardsPerView() {
    if (window.innerWidth >= 992) return 2.15;
    if (window.innerWidth >= 768) return 1.8;
    return 1.15;
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - Math.floor(getCardsPerView()));
  }

  // ── Dots ──
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    var maxIndex = getMaxIndex();

    for (var i = 0; i <= maxIndex; i++) {
      (function(idx) {
        var dot = document.createElement('button');
        dot.className = 'dot';
        dot.setAttribute('aria-label', 'Go to testimonial slide ' + (idx + 1));
        var progress = document.createElement('span');
        progress.className = 'dot-progress';
        dot.appendChild(progress);
        dot.addEventListener('click', function() {
          currentIndex = idx;
          viewport.scrollTo({ left: Math.round(currentIndex * getStepDistance()), behavior: 'smooth' });
          updateDots(true);
        });
        dotsContainer.appendChild(dot);
      })(i);
    }
    updateDots(true);
  }

  function updateDots(forceReset) {
    if (!dotsContainer) return;
    var step = getStepDistance();
    var activeIndex = Math.min(getMaxIndex(), Math.round(viewport.scrollLeft / step));
    currentIndex = activeIndex;

    var dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach(function(dot, idx) {
      if (idx === activeIndex) {
        if (forceReset || !dot.classList.contains('active')) {
          dot.classList.remove('active');
          void dot.offsetWidth; // Force CSS reflow to restart fill animation
          dot.classList.add('active');
        }
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ── Auto Scroll driven by CSS animationend ──
  if (dotsContainer) {
    dotsContainer.addEventListener('animationend', function(e) {
      if (e.target.classList.contains('dot-progress')) {
        var parentDot = e.target.closest('.dot');
        if (parentDot && parentDot.classList.contains('active')) {
          if (!isHovered) {
            scrollToNext();
          }
        }
      }
    });
  }

  // ── Arrow navigation ──
  function scrollToNext() {
    var step = getStepDistance();
    var maxIdx = getMaxIndex();
    var cur = Math.round(viewport.scrollLeft / step);
    var nxt = cur >= maxIdx ? 0 : cur + 1;
    currentIndex = nxt;
    viewport.scrollTo({ left: Math.round(nxt * step), behavior: 'smooth' });
    updateDots(true);
  }

  function scrollToPrev() {
    var step = getStepDistance();
    var maxIdx = getMaxIndex();
    var cur = Math.round(viewport.scrollLeft / step);
    var prv = cur <= 0 ? maxIdx : cur - 1;
    currentIndex = prv;
    viewport.scrollTo({ left: Math.round(prv * step), behavior: 'smooth' });
    updateDots(true);
  }

  // ── Button click listeners ──
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      scrollToNext();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      scrollToPrev();
    });
  }

  // ── Sync on manual scroll ──
  viewport.addEventListener('scroll', function() {
    var step = getStepDistance();
    if (step > 0) {
      currentIndex = Math.min(getMaxIndex(), Math.round(viewport.scrollLeft / step));
    }
    updateDots();
  }, { passive: true });

  // ── Hover handling — pause animation on card hover ──
  cards.forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      isHovered = true;
      if (wrapper) wrapper.classList.add('paused');
    });
    card.addEventListener('mouseleave', function() {
      isHovered = false;
      if (wrapper) wrapper.classList.remove('paused');
    });
    card.addEventListener('touchstart', function() {
      isHovered = true;
      if (wrapper) wrapper.classList.add('paused');
    }, { passive: true });
    card.addEventListener('touchend', function() {
      isHovered = false;
      if (wrapper) wrapper.classList.remove('paused');
    }, { passive: true });
  });

  window.addEventListener('resize', function() {
    updateAllTruncations();
    createDots();
  });

  // Init
  updateAllTruncations();
  createDots();
})();
