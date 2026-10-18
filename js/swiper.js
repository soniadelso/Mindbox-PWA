const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,

  
  slidesPerView: 1, 
  spaceBetween: 0,  // cuántos slides se ven a la vez
  autoplay: {
        delay: 3000,    // avanza solo cada 3 segundos
        disableOnInteraction: true,  // si el usuario interactúa, se detiene el autoplay
    },

  effect: 'cards',
  cardsEffect: {
    rotate: true,
    slideShadows: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
    draggable: true,
  },
});