// * Global constants
const cartItemsContainer = document.getElementById("cartItemsContainer");
const emptyCartContainer = document.getElementById("emptyCartContainer");
const subtotal = document.getElementById("subtotal");
const rightSection = document.getElementById("rightSection");
const addCouponBtn = document.getElementById("addCouponBtn");
const addCouponContainer = document.getElementById("addCouponContainer");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const addCouponInput = addCouponContainer.querySelector("input");

//* State / source of truth
let cartItems = [];
let inventory = [];
let products = [];

const fetchData = async (url) => {
  const response = await fetch(url);
  const result = await response.json();
  return result;
};

async function init() {
  // ? fetch cart data
  const cart = await fetchData("../data/sample-cart.json");
  cartItems = cart.items;

  // ? fetch product descriptions
  products = await fetchData("../data/products.json");

  // ? fetch inventory
  inventory = await fetchData("../data/inventory.json");

  render();
}

init();

// ? Event listeners
  cartItemsContainer.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const sku = button.dataset.sku;

    let variant = inventory.find((item) => item.sku === sku);
    let cartItemIndex = cartItems.findIndex((item) => item.unit.sku === sku);

    if (!variant) return;
    if (!cartItems[cartItemIndex]) return;

    // * Extract stock, and sold properties from variant
    const { stock, sold } = variant;

    // * Extract quantity, property from variant
    const { quantity } = cartItems[cartItemIndex];

    // * Increment
    if (action === "increment") {
      if (quantity >= stock) return;

      // ? Update cart state
      cartItems[cartItemIndex] = {
        ...cartItems[cartItemIndex],
        quantity: quantity + 1,
      };

      console.log(cartItems[cartItemIndex]);
    }

    // * Decrement
    if (action === "decrement") {
      if (quantity <= 1) return;

      // ? Update cart state
      cartItems[cartItemIndex] = {
        ...cartItems[cartItemIndex],
        quantity: quantity - 1,
      };

      console.log(cartItems[cartItemIndex]);
    }

    // console.log("Cart items after increment/decrement", cartItems);

    // * Remove
    if (action === "remove") {
      cartItems = cartItems.filter((item) => item.unit.sku !== sku);
    }

    //   console.log(cartItems[itemIndex]);

    // ? Re-render cart items
    render();
    // ? Update subtotal
    // renderSubtotal();
  });

// * Initial render

// renderSubtotal();

// * Rendering functions
function renderCartItems(cartItems, productInfo, inventory) {
  // ! If cart is empty display empty cart
  if (!cartItems.length) console.log("Empty Cart! Nothing to render");

  if (!cartItems.length) {
    return renderEmptyState();
  }

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
  // ? Hide cart items container / left section
  cartItemsContainer.classList.add("hidden");
  // ? Hide order summary / right section
  rightSection.classList.add("hidden");

  emptyCartContainer.innerHTML = `
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

// function renderSubtotal() {
//   subtotal.innerText = `$${formatPrice(calculateSubtotal(cartItems))}`;
// }

function render() {
  cartItemsContainer.innerHTML = renderCartItems(
    cartItems,
    products,
    inventory,
  );
}

// * Event listeners

addCouponBtn.addEventListener("click", () => {
  addCouponBtn.classList.add("hidden");
  addCouponContainer.classList.remove("hidden");
});

applyCouponBtn.addEventListener("click", () => {
  const couponCodeContainer = addCouponContainer.querySelector(
    ".couponCodeContainer",
  );
  const couponCode = document.getElementById("couponCode");
  couponCode.innerText = addCouponInput.value;
  couponCodeContainer.classList.remove("hidden");
});

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

function calculateSubtotal(items) {
  return items.reduce((subtotal, item) => {
    return subtotal + item.sale_price * item.quantity;
  }, 0);
}

function getDescription(data, productId) {
  return data.find((item) => item.product_id === productId).description;
}
