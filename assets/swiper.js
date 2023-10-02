const imagesSwiper = new Swiper('.js-images-swiper', {
  direction: 'horizontal',
  slidesPerView: 2,
  spaceBetween: 20,
  breakpoints: {
    640: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

const recommendationsSwiper = new Swiper('.js-recommendations-swiper', {
  direction: 'horizontal',
  slidesPerView: 1,
  spaceBetween: 16,
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    991: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 6,
    },
  },
});
