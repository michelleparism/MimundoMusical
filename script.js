/* =============================================
   MUNDO MUSICAL — app.js
   JavaScript ES6 | Navegación + Carrusel + Formulario
   ============================================= */

'use strict';

// ── Navegación entre secciones ──────────────────────────────────────────────
let seccionActual = 'cards';

function mostrarSeccion(cual) {
    document.getElementById('sec-inicio').classList.remove('activa');
    document.getElementById('sec-artistas').classList.remove('activa');
    document.getElementById('sec-cards').style.display = 'none';

    if (cual === 'inicio') {
        document.getElementById('sec-inicio').classList.add('activa');
    } else if (cual === 'artistas') {
        document.getElementById('sec-artistas').classList.add('activa');
        irSlide(0);
    } else {
        document.getElementById('sec-cards').style.display = 'block';
    }

    seccionActual = cual;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cierra el menú móvil si está abierto
    const navMenu = document.getElementById('menu');
    if (navMenu && navMenu.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
        bsCollapse.hide();
    }
}

// ── Carrusel de artistas ─────────────────────────────────────────────────────
let slideActual = 0;
const TOTAL_SLIDES = 9;

function moverSlide(dir) {
    irSlide(slideActual + dir);
}

function irSlide(idx) {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    slideActual = idx;

    document.getElementById('recorrido-track').style.transform =
        `translateX(-${slideActual * 100}%)`;

    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('activo', i === slideActual);
        dot.setAttribute('aria-selected', i === slideActual);
    });

    document.getElementById('btn-prev').disabled = (slideActual === 0);
    document.getElementById('btn-next').disabled = (slideActual === TOTAL_SLIDES - 1);
    document.getElementById('recorrido-counter').textContent =
        `${slideActual + 1} / ${TOTAL_SLIDES}`;
}

// Soporte táctil para el carrusel
let touchStartX = 0;

function initCarruselTouch() {
    const track = document.getElementById('recorrido-track');
    if (!track) return;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) moverSlide(diff > 0 ? 1 : -1);
    });
}

// Soporte teclado para el carrusel (accesibilidad)
function initCarruselKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (seccionActual !== 'artistas') return;
        if (e.key === 'ArrowLeft')  moverSlide(-1);
        if (e.key === 'ArrowRight') moverSlide(1);
    });
}

// ── Formulario de contacto ───────────────────────────────────────────────────
function enviarRegistro() {
    const nombre    = document.getElementById('contacto-nombre').value.trim();
    const email     = document.getElementById('contacto-email').value.trim();
    const errorDiv  = document.getElementById('contacto-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        errorDiv.style.display = 'block';
        document.getElementById('contacto-email').style.borderColor = '#e74c3c';
        return;
    }

    errorDiv.style.display = 'none';
    const nombreDisplay = nombre || 'usuario';
    document.getElementById('contacto-ok-msg').innerHTML =
        `Hola <strong>${nombreDisplay}</strong>, pronto recibirás en <strong>${email}</strong> las últimas noticias y novedades de tus artistas favoritos. ¡Bienvenido a Mundo Musical!`;

    document.getElementById('contacto-form').style.display = 'none';
    document.getElementById('contacto-ok').style.display   = 'block';
}

function resetContactoModal() {
    document.getElementById('contacto-form').style.display = 'block';
    document.getElementById('contacto-ok').style.display   = 'none';
    document.getElementById('contacto-nombre').value       = '';
    document.getElementById('contacto-email').value        = '';
    document.getElementById('contacto-error').style.display = 'none';
    document.getElementById('contacto-email').style.borderColor = '#ffd6e7';
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCarruselTouch();
    initCarruselKeyboard();

    // Reset del modal de contacto al cerrarse
    const modalContacto = document.getElementById('contactoModal');
    if (modalContacto) {
        modalContacto.addEventListener('hidden.bs.modal', resetContactoModal);
    }
});
