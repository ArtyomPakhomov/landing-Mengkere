gsap.registerPlugin(ScrollTrigger);
const body = document.body;

// ! BURGER
const burger = document?.querySelector(".burger");
const nav = document?.querySelector(".nav");
const navItems = nav?.querySelectorAll(".nav-link");
const header = document?.querySelector(".header");
const headerHeight = header.offsetHeight;
document
  .querySelector(":root")
  .style.setProperty("--height-header", `${headerHeight}px`);

function disableScroll() {
  let pagePosition = window.scrollY;
  let paddingOffset = window.innerWidth - document.body.offsetWidth;

  if (paddingOffset < 30) {
    document.body.style.paddingRight = `${paddingOffset}px`;
    document
      .querySelector(":root")
      .style.setProperty("--padding-offset", `${paddingOffset}px`);
  }
  body.classList.add("stop-scroll");
  body.dataset.position = pagePosition;
  body.style.top = -pagePosition + "px";
}

function enableScroll() {
  let pagePosition = parseInt(body.dataset.position, 10);
  document.body.style.paddingRight = 0;
  body.style.top = "auto";
  body.classList.remove("stop-scroll");
  window.scroll({ top: pagePosition, left: 0 });
  body.removeAttribute("data");
}

burger?.addEventListener("click", () => {
  body.classList.contains("stop-scroll") ? enableScroll() : disableScroll();

  nav.classList.toggle("nav--visible");
  burger.classList.toggle("burger--active");
});

navItems.forEach((el) => {
  el.addEventListener("click", () => {
    body.classList.remove("stop-scroll");
    nav.classList.remove("nav--visible");
    burger.classList.remove("burger--active");
    document.body.style.paddingRight = 0;
  });
});

// ! SWIPER

const swiper = new Swiper(".swiper", {
  slidesPerView: "auto",
  spaceBetween: 20,

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // And if we need scrollbar
  scrollbar: {
    el: ".swiper-scrollbar",
    draggable: true,
  },
});

// ! PRELOADER

const preloaderTitle = document.querySelector(".preloader__title");

const splitText = (el) => {
  el.innerHTML = el.textContent.replace(/(\S*)/g, (m) => {
    return (
      `<div class="word">` +
      m.replace(/(-|#|@)?\S(-|#|@)?/g, "<div class='letter'>$&</div>") +
      `</div>`
    );
  });
  return el;
};

const split = splitText(preloaderTitle);

// ! Anim

function preloader() {
  let preloaderTL = gsap.timeline();

  preloaderTL
    .from(".letter", {
      opacity: 0,
      scale: 0,
      delay: 1,
      duration: 1.5,
      // duration: 1.5,
      x: "random(-600, 600)",
      y: "random(-600, 600)",
      z: "random(-600, 600)",
      ease: "power1.out",
      stagger: {
        from: "random",
        amount: 1.5,
      },
    })
    .to(".preloader__title", {
      scale: 1.1,
      duration: 1.5,
    })
    .to(".preloader", {
      duration: 1,
      opacity: 0,
      display: "none",
      onComplete: function () {
        document.body.classList.remove("stop-scroll");
      },
    });

  return preloaderTL;
}

function start() {
  function animateFrom(elem, direction) {
    direction = direction || 1;
    let x = 0;
    let y = direction * 100;
    if (elem.classList.contains("left")) {
      x = -100;
      y = 0;
    } else if (elem.classList.contains("right")) {
      x = 100;
      y = 0;
    }
    elem.style.transform = "translate(" + x + "px, " + y + "px)";
    elem.style.opacity = "0";
    gsap.fromTo(
      elem,
      {
        x: x,
        y: y,
        autoAlpha: 0,
      },
      {
        duration: 1.25,
        x: 0,
        y: 0,
        autoAlpha: 1,
        overwrite: "auto",
      }
    );
  }

  function hide(elem) {
    gsap.set(elem, { autoAlpha: 0 });
  }

  document.addEventListener("DOMContentLoaded", function () {
    gsap.utils.toArray(".anim-target").forEach(function (elem) {
      hide(elem);
      ScrollTrigger.create({
        trigger: elem,
        onEnter: function () {
          animateFrom(elem);
        },
        onEnterBack: function () {
          animateFrom(elem, -1);
        },
        onLeave: function () {
          hide(elem);
        },
      });
    });
  });
}

// function middle() {}

let master = gsap.timeline();
// master.add(preloader()).add(start()).add(middle());
master.add(preloader()).add(start());
