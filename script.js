/* ============================================================
   MUNDO MUSICAL — main.js
   Navegación, carrusel, validación de contacto
   ============================================================ */

'use strict';

/* ── Estado global ── */
let seccionActual = 'cards';
let slideActual   = 0;
const TOTAL_SLIDES = 9;

/* ── Navegación entre secciones ── */
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

    // Cerrar menú hamburguesa en móvil
    const menuCollapse = document.getElementById('menu');
    if (menuCollapse && menuCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(menuCollapse);
        if (bsCollapse) bsCollapse.hide();
    }
}

/* ── Carrusel de artistas ── */
function moverSlide(dir) {
    irSlide(slideActual + dir);
}

function irSlide(idx) {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    slideActual = idx;

    document.getElementById('recorrido-track').style.transform =
        'translateX(-' + (slideActual * 100) + '%)';

    document.querySelectorAll('.nav-dot').forEach(function (d, i) {
        d.classList.toggle('activo', i === slideActual);
    });

    document.getElementById('btn-prev').disabled = (slideActual === 0);
    document.getElementById('btn-next').disabled = (slideActual === TOTAL_SLIDES - 1);
    document.getElementById('recorrido-counter').textContent =
        (slideActual + 1) + ' / ' + TOTAL_SLIDES;
}

/* ── Touch / Swipe en el carrusel ── */
(function initSwipe() {
    let touchStartX = 0;
    const track = document.getElementById('recorrido-track');
    if (!track) return;

    track.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) moverSlide(diff > 0 ? 1 : -1);
    }, { passive: true });
})();

/* ── Navegación con teclado en el carrusel ── */
document.addEventListener('keydown', function (e) {
    if (seccionActual !== 'artistas') return;
    if (e.key === 'ArrowLeft')  moverSlide(-1);
    if (e.key === 'ArrowRight') moverSlide(1);
});

/* ── Formulario de contacto ── */
function enviarRegistro() {
    const nombre    = document.getElementById('contacto-nombre').value.trim();
    const email     = document.getElementById('contacto-email').value.trim();
    const errorDiv  = document.getElementById('contacto-error');
    const emailOk   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk) {
        errorDiv.style.display = 'block';
        document.getElementById('contacto-email').style.borderColor = '#e74c3c';
        return;
    }

    errorDiv.style.display = 'none';
    const nombreDisplay = nombre || 'usuario';

    document.getElementById('contacto-ok-msg').innerHTML =
        'Hola <strong>' + nombreDisplay + '</strong>, pronto recibirás en ' +
        '<strong>' + email + '</strong> las últimas noticias y novedades de tus ' +
        'artistas favoritos. ¡Bienvenido a Mundo Musical!';

    document.getElementById('contacto-form').style.display = 'none';
    document.getElementById('contacto-ok').style.display   = 'block';
}

/* Resetear modal contacto al cerrarse */
document.getElementById('contactoModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('contacto-form').style.display = 'block';
    document.getElementById('contacto-ok').style.display   = 'none';
    document.getElementById('contacto-nombre').value       = '';
    document.getElementById('contacto-email').value        = '';
    document.getElementById('contacto-error').style.display     = 'none';
    document.getElementById('contacto-email').style.borderColor = '#ffd6e7';
});

/* ── Año dinámico en el footer ── */
(function setFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();
