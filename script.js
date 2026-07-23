/* ==========================================================================
   PORTFOLIO SITE — SCRIPT
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
