const selectors = {
  productQuantity: '.js-quantity',
  productQuantityContainer: '.js-product-quantity-wrapper',
  configEl: '#config',
  errorMessage: '.js-error-message',
  loader: '.js-loader',
  addToCartBtn: '.js-add-to-cart',
  addToCartContainer: '.js-add-to-cart-wrapper',
  cartBubble: '#cart-icon-bubble .cart-count-bubble',
  outOfStock: '.js-out-of-stock',
  productOptions: '.js-options',
  productPrice: '.js-product-price',
  productTitle: '.js-product-title',
  productCompareAtPrice: '.js-product-compare-at-price',
  descriptionTabs: '.js-tabs',
  tab: '.js-tab-description',
  tabBtn: '.js-tab-btn',
};

const classes = {
  activeLoader: 'collection-section__loader-active',
  cartBubbleVisualHidden: 'visually-hidden',
  hidden: 'hidden',
  descriptionTabActive: 'product__tab-description--active',
  tabBtnActive: 'product__tab-btn_active',
};

const configEl = document.querySelector(selectors.configEl);
const configInner = configEl.innerHTML;
const productList = JSON.parse(configInner);
const { product, inventoryQuantity, sectionId } = productList;

const minQuantity = 1;
let maxQuantity = inventoryQuantity;

const selectedQuantity = document.querySelector(selectors.productQuantity);
const productQuantity = document.querySelector(selectors.productQuantityContainer);

productQuantity?.addEventListener('click', (e) => {
  const quantityToNumber = +selectedQuantity.textContent;

  if (e.target.id === 'increase' && quantityToNumber < maxQuantity) {
    selectedQuantity.textContent = quantityToNumber + 1;
  } else if (e.target.id === 'decrease' && selectedQuantity.textContent > minQuantity) {
    selectedQuantity.textContent -= 1;
  }
});

const errorMessage = document.querySelector(selectors.errorMessage);
const loader = document.querySelector(selectors.loader);
const addToCartBtn = document.querySelector(selectors.addToCartBtn);
const cartCount = document.querySelector(`${selectors.cartBubble} span`);
const cartBubble = document.querySelector(selectors.cartBubble);

const toggleLoader = (isLoading) => {
  loader.classList.toggle(classes.activeLoader, isLoading);
  addToCartContainer.classList.toggle(classes.hidden, isLoading);
};

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
      toggleLoader(false);

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      cartBubble.classList.remove(classes.cartBubbleVisualHidden);
      cartCount.textContent = Number(cartCount.textContent) + Number(selectedQuantity.textContent);
      errorMessage.style.display = 'none';

      return response.json();
    })
    .catch((error) => {
      addToCartBtn.setAttribute('disabled', 'true');
      errorMessage.style.display = 'inline-block';
      errorMessage.textContent = `Error ${error.message}`;
      console.error(error);
    });
};

const firstAvailableVariant = product.variants.find((variant) => variant.available);
let activeVariantId = window.location.search.replace('?variant=', '') || firstAvailableVariant.id;
const addToCartContainer = document.querySelector(selectors.addToCartContainer);

addToCartBtn?.addEventListener('click', () => {
  toggleLoader(true);
  addToCartHandler({ id: activeVariantId, quantity: selectedQuantity.textContent });
});

const moneyFormatter = (price) => `₴${(price / 100).toFixed(2)}`;

const outOfStock = document.querySelector(selectors.outOfStock);
const productOptions = document.querySelectorAll(`${selectors.productOptions} input`);
const productPrice = document.querySelector(selectors.productPrice);
const productTitle = document.querySelector(selectors.productTitle);
const productCompareAtPrice = document.querySelector(selectors.productCompareAtPrice);

productOptions.forEach((option) =>
  option.addEventListener('click', () => {
    const checkedInputs = [...productOptions].filter((el) => el.checked);
    const activeInput = product.variants.find(({ options }) => {
      return checkedInputs.every(({ id }) => options.includes(id));
    });
    activeVariantId = activeInput.id;

    window.history.replaceState({}, '', `?variant=${activeVariantId}`);

    const priceComparisonsCondition =
      activeInput.compare_at_price > activeInput.price && activeInput.compare_at_price !== activeInput.price;

    outOfStock?.classList.toggle(classes.hidden, activeInput.available);
    productCompareAtPrice?.classList.toggle(classes.hidden, !priceComparisonsCondition);

    if (priceComparisonsCondition && productCompareAtPrice) {
      productCompareAtPrice.textContent = moneyFormatter(activeInput.compare_at_price);
    }

    selectedQuantity && (selectedQuantity.textContent = minQuantity);

    productPrice.textContent = moneyFormatter(activeInput.price);
    productTitle.textContent = activeInput.title;

    addToCartBtn.textContent = activeInput.available ? 'Add to cart' : 'Sold out';
    addToCartBtn.disabled = !activeInput.available;

    productQuantity.classList.toggle(classes.hidden, !activeInput.available);

    const ajaxUrlParams = new URLSearchParams(window.location.search);
    fetch(window.location.pathname + `?section_id=${sectionId}&${ajaxUrlParams}`)
      .then((res) => res.text())
      .then((resText) => {
        const html = new DOMParser().parseFromString(resText, 'text/html');
        const configElement = html.querySelector(selectors.configEl);
        const updatedConfigData = JSON.parse(configElement.textContent);

        maxQuantity = updatedConfigData.inventoryQuantity;
      })
      .catch((err) => console.error(err));
  })
);

const tabs = document.querySelector(selectors.descriptionTabs);
const tabDescription = document.querySelectorAll(selectors.tab);
const tabBtns = document.querySelectorAll(selectors.tabBtn);

tabs.addEventListener('click', (e) => {
  tabDescription.forEach((el) => {
    el.classList.toggle(classes.descriptionTabActive, el.id === e.target.id);
  });

  tabBtns.forEach((btn) => {
    btn.classList.toggle(classes.tabBtnActive, btn.id === e.target.id);
  });
});
