// Todo el JS de la página en un solo archivo.
// Cada bloque revisa que sus elementos existan, para que un error en uno no frene a los demás.

var prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    galleryContainer.style.transform = "translateX(" + -currentIndex * 100 + "%)";
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  function startAutoplay(interval) {
    stopAutoplay(); // evita intervalos múltiples
    if (prefiereMenosMovimiento) return; // quien pidió menos movimiento no ve cambios solos
    autoplayInterval = setInterval(function () {
      navigate(1);
    }, interval);
  }

  if (prev) prev.addEventListener("click", function () { navigate(-1); });
  if (next) next.addEventListener("click", function () { navigate(1); });

  // Detiene el autoplay al usar los botones
  document.querySelectorAll(".nav-button").forEach(function (button) {
    button.addEventListener("click", stopAutoplay);
  });

  startAutoplay(3000); // cambia de foto cada 3 segundos
})();

/* ---------- ANIMACIÓN AL BAJAR POR LAS SECCIONES ----------
   Cada sección entra de costado, alternando izquierda y derecha (los estilos están en style.css).
   Anima al bajar y también al subir. El hero se excluye para que el inicio cargue sin retraso. */
(function () {
  if (!("IntersectionObserver" in window) || prefiereMenosMovimiento) return; // sin animación, todo se ve normal

  var secciones = document.querySelectorAll("section:not(.hero)");

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
      } else {
        entrada.target.classList.remove("visible"); // al salir se reinicia, así anima también al subir
      }
    });
  }, { threshold: 0.12 });

  secciones.forEach(function (seccion, i) {
    seccion.classList.add("animacion-scroll");
    seccion.dataset.lado = i % 2 === 0 ? "izq" : "der";
    observador.observe(seccion);
  });
})();

/* ---------- MODAL DEL MENÚ (solo si existe en el HTML) ---------- */
(function () {
  var modal = document.getElementById("menuModal");
  var openBtn = document.getElementById("openMenuBtn");
  var closeBtn = document.getElementById("closeMenuBtn");
  if (!modal || !openBtn || !closeBtn) return;

  openBtn.addEventListener("click", function () { modal.style.display = "block"; });
  closeBtn.addEventListener("click", function () { modal.style.display = "none"; });

  // Cerrar al hacer clic fuera de las imágenes
  window.addEventListener("click", function (event) {
    if (event.target === modal) modal.style.display = "none";
  });

  // Cerrar con la tecla Esc
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") modal.style.display = "none";
  });
})();

/* ---------- VIDEO DE FONDO DEL INICIO ---------- */
(function () {
  var video = document.querySelector(".hero__video");
  var btn = document.querySelector(".hero__toggle");
  if (!video || !btn) return;

  var icon = btn.querySelector("i");

  function setState(playing) {
    icon.className = playing ? "fa fa-pause" : "fa fa-play";
    btn.setAttribute("aria-label", playing ? "Pausar video de fondo" : "Reproducir video de fondo");
  }

  var saveData = navigator.connection && navigator.connection.saveData;

  if (prefiereMenosMovimiento || saveData) {
    // No arranca solo: se queda la foto (poster) hasta que la persona pulse "Video"
    video.removeAttribute("autoplay");
    video.pause();
    setState(false);
  } else {
    var started = video.play();
    if (started && started.catch) {
      started.catch(function () { setState(false); });
    }
  }

  video.addEventListener("play", function () { setState(true); });
  video.addEventListener("pause", function () { setState(false); });

  btn.addEventListener("click", function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
})();