const imagesSubSwiper = new Swiper('.js-sub-images-swiper', {
  spaceBetween: 20,
  slidesPerView: 2,
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

const imagesSwiperPreview = new Swiper('.js-images-swiper', {
  spaceBetween: 10,
  thumbs: {
    swiper: imagesSubSwiper,
  },
});
