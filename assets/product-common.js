const configEl = document.querySelector('#config');
const configInner = configEl.innerHTML;
const productList = JSON.parse(configInner);
const { product, inventoryQuantity, sectionId } = productList;

const minQuantity = 1;
let maxQuantity = inventoryQuantity;

const swiperWrapper = document.querySelector('.js-swiper-wrapper');
swiperWrapper.addEventListener('click', (e) => {
  const { tagName } = e.target;
  const productPoster = document.querySelector('.js-product-poster');

  if (tagName === 'IMG' || tagName === 'VIDEO') {
    productPoster.innerHTML = e.target.outerHTML;
  }

  document.querySelectorAll('.js-swiper-image').forEach((el) => {
    if (el === e.target) {
      return el.classList.add('product__gallery-img_active');
    }

    return el.classList.remove('product__gallery-img_active');
  });
});

const selectedQuantity = document.querySelector('.js-quantity');
const productQuantity = document.querySelector('.js-product-quantity');

productQuantity.addEventListener('click', (e) => {
  const quantityToNumber = +selectedQuantity.textContent;

  if (e.target.id === 'increase' && quantityToNumber < maxQuantity) {
    selectedQuantity.textContent = quantityToNumber + 1;
  } else if (e.target.id === 'decrease' && selectedQuantity.textContent > minQuantity) {
    selectedQuantity.textContent -= 1;
  }
});

const errorMessage = document.querySelector('.js-error-message');

const addToCartHandler = (formData) => {
  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [formData],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const cartCount = document.querySelector('#cart-icon-bubble .cart-count-bubble span');
      const cartBubble = document.querySelector('#cart-icon-bubble .cart-count-bubble');

      cartBubble.classList.remove('visually-hidden');
      cartCount.textContent = Number(cartCount.textContent) + Number(selectedQuantity.textContent);
      errorMessage.style.display = 'none';

      return response.json();
    })
    .catch(({ message }) => {
      errorMessage.textContent = message;
      errorMessage.style.display = 'inline-block';
      console.error('Error: ', message);
    });
};

const firstAvailableVariant = product.variants.find((variant) => variant.available);
let activeVariantId = window.location.search.replace('?variant=', '') || firstAvailableVariant.id;
const addToCartContainer = document.querySelector('.js-add-to-cart-wrapper');

addToCartContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-add-to-cart')) {
    addToCartHandler({ id: activeVariantId, quantity: selectedQuantity.textContent });
  }
});

const outOfStock = document.querySelector('.js-out-of-stock');
const productOptions = document.querySelectorAll('.js-options input');

productOptions.forEach((option) =>
  option.addEventListener('click', () => {
    const checkedInputs = [...productOptions].filter((el) => el.checked);
    const activeInput = product.variants.find(({ options }) => {
      return checkedInputs.every(({ id }) => options.includes(id));
    });
    activeVariantId = activeInput.id;

    selectedQuantity.textContent = minQuantity;
    window.history.pushState({}, '', `?variant=${activeVariantId}`);

    const urlParams = window.location.search;
    const ajaxUrlParams = urlParams
      .split('')
      .filter((el, index) => el !== '?' && index !== 0)
      .join('');

    fetch(window.location.pathname + `?section_id=${sectionId}&${ajaxUrlParams}`)
      .then((res) => res.text())
      .then((resText) => {
        const html = new DOMParser().parseFromString(resText, 'text/html');
        const sourcePrice = html.querySelector('.js-product-price');
        const targetPrice = document.querySelector('.js-product-price');
        const sourceAddToCart = html.querySelector('.js-add-to-cart');
        const targetAddToCart = document.querySelector('.js-add-to-cart');
        const configElement = html.querySelector('#config');
        const updatedConfigData = JSON.parse(configElement.textContent);

        maxQuantity = updatedConfigData.inventoryQuantity;
        targetPrice.innerHTML = sourcePrice.innerHTML;
        targetAddToCart.outerHTML = sourceAddToCart.outerHTML;
      })
      .catch((err) => console.error(err));
  })
);

const tabs = document.querySelector('.js-tabs');
const tabDescription = document.querySelectorAll('.js-tab-description');
const tabBtns = document.querySelectorAll('.js-tab-btn');

tabs.addEventListener('click', (e) => {
  tabDescription.forEach((el) => {
    if (el.id === e.target.id) {
      return el.classList.add('product__tab-description_active');
    }

    return el.classList.remove('product__tab-description_active');
  });

  tabBtns.forEach((btn) => {
    if (btn.id === e.target.id) {
      return btn.classList.add('product__tab-btn_active');
    }

    return btn.classList.remove('product__tab-btn_active');
  });
});
