/* ---------- PREFERENCIAS DEL USUARIO ---------- */

var prefiereMenosMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


/* ---------- CARRUSEL ---------- */

(function () {

    var galleryContainer = document.querySelector(".gallery-container");
    var items = document.querySelectorAll(".gallery-item");
    var prev = document.querySelector(".prev-button");
    var next = document.querySelector(".next-button");

    if (!galleryContainer || !items.length) return;

    var currentIndex = 0;
    var totalImages = items.length;
    var autoplayInterval = null;

    function navigate(direction) {

        currentIndex = (currentIndex + direction + totalImages) % totalImages;

        galleryContainer.style.transform =
            "translateX(" + (-currentIndex * 100) + "%)";
    }

    function stopAutoplay() {

        if (autoplayInterval !== null) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function startAutoplay() {

        stopAutoplay();

        if (prefiereMenosMovimiento) return;
        if (document.hidden) return;

        autoplayInterval = setInterval(function () {
            navigate(1);
        }, 4000);
    }

    if (prev) {
        prev.addEventListener("click", function () {
            navigate(-1);
            stopAutoplay();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            navigate(1);
            stopAutoplay();
        });
    }

    document.addEventListener("visibilitychange", function () {

        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }

    });

    startAutoplay();

})();


/* ---------- ANIMACIONES AL DESPLAZARSE ---------- */

(function () {

    if (!("IntersectionObserver" in window)) return;

    if (prefiereMenosMovimiento) return;

    var secciones = document.querySelectorAll("section:not(.hero)");

    var observador = new IntersectionObserver(function (entradas) {

        entradas.forEach(function (entrada) {

            if (entrada.isIntersecting) {

                entrada.target.classList.add("visible");

            } else {

                entrada.target.classList.remove("visible");

            }

        });

    }, {
        threshold: 0.12
    });

    secciones.forEach(function (seccion, i) {

        seccion.classList.add("animacion-scroll");

        seccion.dataset.lado = i % 2 === 0 ? "izq" : "der";

        observador.observe(seccion);

    });

})();


/* ---------- MODAL DEL MENÚ ---------- */

(function () {

    var modal = document.getElementById("menuModal");
    var openBtn = document.getElementById("openMenuBtn");
    var closeBtn = document.getElementById("closeMenuBtn");

    if (!modal || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", function () {

        modal.style.display = "block";

    });

    closeBtn.addEventListener("click", function () {

        modal.style.display = "none";

    });

    window.addEventListener("click", function (event) {

        if (event.target === modal) {
            modal.style.display = "none";
        }

    });

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            modal.style.display = "none";
        }

    });

})();


/* ---------- VIDEO DE FONDO DEL INICIO ---------- */

(function () {

    var video = document.querySelector(".hero__video");
    var btn = document.querySelector(".hero__toggle");

    if (!video) return;

    var icon = btn ? btn.querySelector("i") : null;

    var saveData = navigator.connection &&
        navigator.connection.saveData;

    /* En celular NO se descarga ni se reproduce el video:
       se queda la imagen del hero (mucho más rápido en PageSpeed). */
    var esMovil = window.matchMedia("(max-width: 768px)").matches;

    var reproduccionAutomaticaPermitida =
        !prefiereMenosMovimiento && !saveData && !esMovil;

    function setState(playing) {

        if (icon) {

            icon.className = playing
                ? "fa fa-pause"
                : "fa fa-play";

        }

        if (btn) {

            btn.setAttribute(
                "aria-label",
                playing
                    ? "Pausar video de fondo"
                    : "Reproducir video de fondo"
            );

        }

    }

    function reproducirVideo() {

        if (!video.paused) return;

        var resultado = video.play();

        if (resultado && resultado.catch) {

            resultado.catch(function () {
                setState(false);
            });

        }

    }

    function pausarVideo() {

        video.pause();

    }

    video.addEventListener("play", function () {
        setState(true);
    });

    video.addEventListener("pause", function () {
        setState(false);
    });

    /* Cuando el video realmente muestra imágenes, aparece sobre la foto */
    video.addEventListener("playing", function () {
        video.classList.add("is-playing");
    });

    if (btn) {

        btn.addEventListener("click", function () {

            if (video.paused) {

                reproducirVideo();

            } else {

                pausarVideo();

            }

        });

    }

    if (!reproduccionAutomaticaPermitida) {

        /* No se llama a play(): así el navegador no descarga el video */
        setState(false);
        return;

    }

    /* El video se pide solo cuando la página ya terminó de cargar,
       para que no compita con la imagen principal (LCP). */
    function iniciarVideo() {

        if ("IntersectionObserver" in window) {

            var observadorVideo = new IntersectionObserver(function (entradas) {

                entradas.forEach(function (entrada) {

                    if (entrada.isIntersecting) {

                        if (!document.hidden) {
                            reproducirVideo();
                        }

                    } else {

                        pausarVideo();

                    }

                });

            }, {
                threshold: 0.1
            });

            observadorVideo.observe(video);

        } else {

            reproducirVideo();

        }

    }

    if (document.readyState === "complete") {

        iniciarVideo();

    } else {

        window.addEventListener("load", iniciarVideo);

    }

    document.addEventListener("visibilitychange", function () {

        if (document.hidden) {

            pausarVideo();

        } else if (
            reproduccionAutomaticaPermitida &&
            video.getBoundingClientRect().bottom > 0 &&
            video.getBoundingClientRect().top < window.innerHeight
        ) {

            reproducirVideo();

        }

    });

})();