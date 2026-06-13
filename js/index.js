// * Global constants
const cartItemsContainer = document.getElementById("cartItemsContainer");
const emptyCartContainer = document.getElementById("emptyCartContainer");
const subtotal = document.getElementById("subtotal");
const rightSection = document.getElementById("rightSection");
const addCouponBtn = document.getElementById("addCouponBtn");
const addCouponContainer = document.getElementById("addCouponContainer");
const applyCouponBtn = document.getElementById("applyCouponBtn");
// const addCouponInput = addCouponContainer.querySelector("input");

//* State / source of truth
let cart = {};
let inventory = [];
let products = [];
let coupons = [];
let enteredCoupon = null;
let isCouponFormOpen = false;
let appliedCoupon = null;

const fetchData = async (url) => {
  const response = await fetch(url);
  const result = await response.json();
  return result;
};

async function init() {
  // ? fetch cart data
  cart = await fetchData("../data/sample-cart.json");

  // ? fetch product descriptions
  products = await fetchData("../data/products.json");

  // ? fetch inventory
  inventory = await fetchData("../data/inventory.json");

  // ? fetch coupons
  coupons = await fetchData("../data/coupons.json");

  render();
}

init();

const couponInputVal = document.querySelector("#coupon-input");
console.log(couponInputVal);

// ? Event listeners
cartItemsContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  const action = button.dataset.action;
  const sku = button.dataset.sku;

  let variant = inventory.find((item) => item.sku === sku);
  let cartItemIndex = cart.items.findIndex((item) => item.unit.sku === sku);

  if (!variant) return;
  if (!cart.items[cartItemIndex]) return;

  // * Extract stock, and sold properties from variant
  const { stock, sold } = variant;

  // * Extract quantity, property from variant
  const { quantity } = cart.items[cartItemIndex];

  // * Increment
  if (action === "increment") {
    if (quantity >= stock) return;

    // ? Update cart state
    cart.items[cartItemIndex] = {
      ...cart.items[cartItemIndex],
      quantity: quantity + 1,
    };
  }

  // * Decrement
  if (action === "decrement") {
    if (quantity <= 1) return;

    // ? Update cart state
    cart.items[cartItemIndex] = {
      ...cart.items[cartItemIndex],
      quantity: quantity - 1,
    };
  }

  // * Remove item from cart
  if (action === "remove") {
    cart.items = cart.items.filter((item) => item.unit.sku !== sku);
  }

  // ? Update cart subtotal
  updateCartSummary();

  // ? Re-render cart items
  render();
});

rightSection.addEventListener("click", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  const action = button.dataset.action;

  // * Add a coupon
  if (action === "add-coupon") {
    console.log(coupons);
    isCouponFormOpen = true;
  }

  // * Apply coupon
  if (action === "apply-coupon") {
    enteredCoupon = rightSection.querySelector("#coupon-input").value;

    if (!enteredCoupon.length) return;

    const coupon = coupons.find((item) => item.coupon_code === enteredCoupon);

    if (!coupon) return;

    appliedCoupon = coupon;

    const { coupon_code, discount_amount, discount_percentage } = coupon;

    // * Update cart summary
    cart.summary = {
      ...cart.summary,
      discount_code: coupon_code,
      discount: discount_amount
        ? discount_amount
        : calculateDiscountAmount(discount_percentage, cart.summary.subtotal),
    };

    console.log(cart.summary, "cart summary after coupon applied");

    console.log(enteredCoupon);
    console.log(coupons);
  }

  updateCartSummary();
  render();
});

// * Rendering functions
function renderCartItems(cartItems, productInfo, inventory) {
  // ! If cart is empty display empty cart
  if (!cartItems.length) console.log("Empty Cart! Nothing to render");

  return cartItems
    .map((item) => {
      const { unit, product, quantity, total_list_price, total_sale_price } =
        item;
      const { image_url, size, color, sku, list_price, sale_price } = unit;

      const { name, product_id } = product;

      const variant = inventory.find((item) => item.sku === sku);

      const { sold, stock, discount, discount_percentage } = variant;

      return `<div
          class="product-card flex gap-y-4 flex-col border-b-2 border-dotted border-neutral-200 pb-8 mb-8 last:border-b-0 md:flex-row md:gap-x-8"
          id="${sku}"
        >
          <figure class="min-w-[280px] h-[200px]">
            <img
              class="w-full h-full object-cover rounded-lg md:w-[280px]"
              src="${image_url}"
              alt="product image"
            />
          </figure>

          <!-- Card title -->
          <div class="flex flex-col gap-y-4">
            <h2 class="text-2xl font-medium text-neutral-900">
              ${name}
            </h2>

            <!-- Product specs -->
            <p class="font-medium text-neutral-600 capitalize">${color} ${size ? "•" : ""} ${formatSize(size)}</p>

            <!-- Product description -->
            <p class="text-sm text-neutral-600">
              ${getDescription(productInfo, product_id)}
            </p>

            <!-- Cart Controls -->
            <div class="flex items-center">
              <div
                class="bg-neutral-50 rounded-md max-w-[125px] px-1.5 py-2 flex justify-center"
              >
                <button
                 ${quantity <= 1 ? "disabled" : ""}
                 data-action="decrement" data-sku="${sku}" class="text-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed">
                  <i class="ri-subtract-fill text-[20px]"></i>
                </button>
                <input
                  class="w-12 text-sm mx-3 bg-neutral-50 [appearance:textfield] text-center outline-none"
                  type="number"
                  value="${quantity}"
                  readonly
                />
                <button
                ${quantity >= stock ? "disabled" : ""}
                data-action="increment" data-sku="${sku}" class="text-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed">
                  <i class="ri-add-fill text-[20px]"></i>
                </button>
              </div>

              <button
                data-action="remove"
                data-sku="${sku}"
                aria-disabled="false"
                class="text-sm text-neutral-600 font-medium ml-4 hover:text-neutral-900 focus:ring-4 focus:ring-neutral-200 rounded px-1 aria-disabled:text-neutral-400"
                >
                Remove
              </button>

              <div class="ml-auto">
                <span class="text-lg text-neutral-900 font-medium">$${formatPrice(sale_price * quantity)}</span>
                <span class="text-neutral-600 text-[12px] line-through"
                  >${discount || discount_percentage ? `$${formatPrice(list_price * quantity)}` : ""}</span
                >
              </div>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

function renderEmptyState() {
  return `
        <div id="empty-state-message" class="flex flex-col gap-5 items-center xl:col-span-5">
              <div class="w-12 h-12 shadow flex justify-center items-center rounded-full">
                <i class="ri-shopping-cart-2-line text-2xl text-indigo-500"></i>
              </div>
              <div class="text-neutral-900 flex flex-col gap-2 text-center">
                <p class="text-xl font-medium">Your cart is empty</p>
                <p class="">Let's go explore some products</p>
              </div>
              <div class="">
                <button class="text-white text-center bg-indigo-700 font-medium py-2.5 px-4 rounded flex gap-1.5 items-center hover:bg-indigo-800 shadow-md focus:ring-4 focus:bg-indigo-800 focus:ring-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:shadow-none">
                    <span>Explore products</span>
                    <i class="ri-arrow-right-line text-xl"></i>
                </button>
              </div>
        </div>
        
        <div class="flex justify-center items-center xl:col-span-7">
        <img
          src="./img/emptyCart.png"
          alt="cart empty images"
          class="object-cover"
        />
        </div>`;
}

function render() {
  // ? If cart is empty then render cart empty state markup
  if (!cart.items.length) {
    cartItemsContainer.innerHTML = "";
    rightSection.innerHTML = "";
    emptyCartContainer.innerHTML = renderEmptyState();
    rightSection.innerHTML = "";
    rightSection.classList.add("hidden");
    return;
  }

  rightSection.classList.remove("hidden");
  cartItemsContainer.innerHTML = renderCartItems(
    cart.items,
    products,
    inventory,
  );

  rightSection.innerHTML = renderSummary(cart.summary);
  // console.log(cart);
}

function renderSummary(summaryData) {
  const { subtotal, total, discount_code, discount, shipping } = summaryData;
  // const { discount_amount, discount_percentage } = appliedCoupon;

  return `
  <h2 class="text-2xl font-semibold text-neutral-900">Order Summary</h2>
        <!-- subtotal & shipping -->
        <div class="">
          <div class="flex justify-between mb-4">
            <div class="text-neutral-600">Subtotal</div>
            <div
              id="subtotal"
              class="text-lg font-semibold text-neutral-900"
            >$${formatPrice(subtotal)}</div>
          </div>
          <div class="shipping flex justify-between mb-4">
            <div class="text-neutral-600">Shipping</div>
            <div class="text-lg font-semibold">${shipping ? `$${shipping}` : "FREE"}</div>
          </div>

          <div class="text-indigo-700 font-medium flex justify-end
          ${isCouponFormOpen ? "hidden" : ""}">
            <button
              data-action="add-coupon"
              id="addCouponBtn"
              aria-disabled="false"
              href="#"
              class="focus:ring-4 focus:ring-neutral-200 rounded px-1 aria-disabled:text-neutral-400"
            >
              <i class="ri-coupon-line"></i> Add coupon code
            </button>
          </div>

          <!-- Add coupon: success -->
          <div class="flex justify-between mb-4 ${discount_code ? "" : "hidden"}">
            <div
              class="text-indigo-700 text-sm font-normal bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1"
            >
              ${discount_code}
            </div>
            <div class="text-lg font-semibold">-${appliedCoupon?.discount_amount ? `$${formatPrice(appliedCoupon.discount_amount)}` : `${appliedCoupon?.discount_percentage}%`}</div>
          </div>

          <!-- Add coupon form: active -->
          <div id="addCouponContainer" class="flex flex-col gap-2
          ${isCouponFormOpen ? "" : "hidden"}">
            <div class="flex flex-col gap-1.5">
              <label
                for="coupon-input"
                class="text-neutral-700 text-sm font-medium mb-"
                >Coupon code</label
              >

              <div class="flex items-start gap-2">
                <div class="">
                  <input
                    id="coupon-input"
                    type="text"
                    value=""
                    placeholder="Enter coupon code"
                    class="placeholder:text- text-sm font-normal bg-neutral-50 px-3.5 py-2.5 rounded border-neutral-200 border"
                  />
                  <span class="text-sm font-normal text-red-600 hidden"
                    >Please enter a valid code.</span
                  >
                </div>
                <button
                  data-action="apply-coupon"
                  id="applyCouponBtn"
                  class="px-3.5 py-2.5 text-neutral-900 text-sm font-medium border-[0.5px] rounded shadow border-neutral-200"
                >
                  Apply
                </button>
              </div>
            </div>

            <!-- Coupon code -->
            <div
              class="couponCodeContainer bg-gray-200 px-2 py-1 border-[0.5px] flex max-w-fit items-center justify-center gap-1 rounded ${discount_code ? "" : "hidden"}"
            >
              <span id="couponCode" class="text-neutral-900 text-sm font-medium"
                >${!discount_code ? "" : discount_code}</span>
              <button
                <i class="ri-close-fill text-black text-xl"></i>
              </button>
            </div>
          </div>

          <hr class="border-dotted border-t-2 my-8" />
        </div>

        <!-- Total -->
        <div class="total flex justify-between">
          <div class="text-2xl font-medium">Total</div>
          <div class="text-4xl font-semibold">$${formatPrice(total)}</div>
        </div>
        <div class="checkout-button">
          <button
            class="font-medium w-full bg-indigo-700 text-white hover:bg-indigo-800 shadow-md focus:ring-4 focus:bg-indigo-800 focus:ring-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:shadow-none py-3 rounded"
          >
            Checkout
          </button>
        </div>`;
}

// * Helper utility functions
function formatPrice(price) {
  if (Number.isInteger(price)) return price;
  else return price.toFixed(2);
}

function formatSize(size) {
  let formattedSize = size ? size : "";

  if (typeof size !== "number") {
    switch (size) {
      case "xs":
        formattedSize = "Extra Small";
        break;
      case "sm":
        formattedSize = "Small";
        break;
      case "md":
        formattedSize = "Medium";
        break;
      case "lg":
        formattedSize = "Large";
        break;
      case "xl":
        formattedSize = "Extra Large";
        break;
    }
    return formattedSize;
  } else {
    return formattedSize;
  }
}

function calculateSubtotal(cartItems) {
  return cartItems.reduce((subtotal, item) => {
    return subtotal + item.unit.sale_price * item.quantity;
  }, 0);
}

function calculateDiscountAmount(discountPercentage, subtotal) {
  return (discountPercentage / 100) * subtotal;
}

function getDescription(data, productId) {
  return data.find((item) => item.product_id === productId).description;
}

function updateCartSummary() {
  const subtotal = calculateSubtotal(cart.items);
  let discount = 0;

  const { shipping } = cart.summary;

  if (appliedCoupon) {
    discount = appliedCoupon.discount_amount
      ? appliedCoupon.discount_amount
      : calculateDiscountAmount(appliedCoupon.discount_percentage, subtotal);
  }

  // ? Update cart summary
  cart.summary = {
    ...cart.summary,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount + shipping),
  };
}
