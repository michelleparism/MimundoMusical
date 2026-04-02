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
