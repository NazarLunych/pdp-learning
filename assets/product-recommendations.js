const recommendationsSection = document.querySelector('.js-product-recommendations-section');

const fetchRecommendations = () => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  if (!product.id) return;

  fetch(window.Shopify.routes.root + `recommendations/products.json?product_id=${product.id}&limit=6&intent=related`)
    .then((response) => response.json())
    .then(({ products }) => {
      if (products.length > 0) {
        const recommendations = document.querySelector('.js-products-recommendations');
        const recommendationsList = () => {
          return products
            .map((product) => {
              const priceInDollars = (product.price / 100).toFixed(2);

              return `<a href=${product.url} class="swiper-slide recommendations__card">
            <img src=${product.featured_image} class='recommendations__card-img'/>
            <div class='recommendations__card-content'>
            <span class='recommendations__card-name'>${product.title}</span>
            <span class='recommendations__card-price'>${formatter.format(priceInDollars)}</span>
            </div>
            </a>`;
            })
            .join('');
        };

        const updatedRecommendations = recommendationsList();
        recommendationsSection.classList.remove('hidden');
        recommendations.innerHTML = updatedRecommendations;
      }
    })
    .catch((err) => console.error(err));
};

fetchRecommendations();
