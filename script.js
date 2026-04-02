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



/* =============================================
   MUNDO MUSICAL — notes.js
   Notas musicales flotantes sobre canvas
   ============================================= */

(function () {
    'use strict';

    const SYMBOLS = ['♩','♪','♫','♬','♭','♮','♯'];

    const COLORS = [
        'rgba(255,105,180,',
        'rgba(255,182,193,',
        'rgba(255,215,0,',
        'rgba(255,160,122,',
        'rgba(218,112,214,',
        'rgba(255,140,0,',
        'rgba(199,21,133,',
        'rgba(255,200,50,',
    ];

    const NOTE_COUNT   = 28;
    const MIN_SIZE     = 14;
    const MAX_SIZE     = 38;
    const MIN_SPEED    = 0.4;
    const MAX_SPEED    = 1.1;
    const MIN_DRIFT    = -0.4;
    const MAX_DRIFT    =  0.4;
    const MIN_OPACITY  = 0.08;
    const MAX_OPACITY  = 0.28;
    const SWAY_AMP     = 0.6;
    const SWAY_SPEED   = 0.018;
    const ROTATION_MAX = 25;

    /* El canvas es position:fixed → coordenadas siempre relativas al viewport */
    const canvas = document.getElementById('music-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Note {
        constructor() { this.init(true); }

        init(scattered) {
            this.symbol  = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            this.color   = COLORS [Math.floor(Math.random() * COLORS.length)];
            this.size    = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
            this.opacity = MIN_OPACITY + Math.random() * (MAX_OPACITY - MIN_OPACITY);
            this.x       = Math.random() * W;
            /* scattered=true  → distribuidas por toda la pantalla al arrancar  */
            /* scattered=false → reaparecen desde abajo del viewport             */
            this.y       = scattered ? Math.random() * H : H + this.size + 10;
            this.vy      = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
            this.vx      = MIN_DRIFT + Math.random() * (MAX_DRIFT - MIN_DRIFT);
            this.sway    = Math.random() * Math.PI * 2;
            this.angle   = (Math.random() * 2 - 1) * ROTATION_MAX;
            this.spin    = (Math.random() * 2 - 1) * 0.15;
        }

        update() {
            this.sway  += SWAY_SPEED;
            this.x     += this.vx + Math.sin(this.sway) * SWAY_AMP;
            this.y     -= this.vy;
            this.angle += this.spin;

            if (this.y < -this.size * 2) this.init(false);  /* reaparece abajo */
            if (this.x < -40)  this.x = W + 40;
            if (this.x > W+40) this.x = -40;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.font         = this.size + 'px serif';
            ctx.fillStyle    = this.color + this.opacity + ')';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    const notes = Array.from({ length: NOTE_COUNT }, () => new Note());

    let rafId;

    function loop() {
        ctx.clearRect(0, 0, W, H);
        notes.forEach(function(n) { n.update(); n.draw(); });
        rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) cancelAnimationFrame(rafId);
        else loop();
    });

    loop();

})();

});