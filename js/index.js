//* State / source of truth
let cartItems = [
  {
    sku: "ss-orange-xs",
    product_id: "stepsoft-socks",
    name: "StepSoft Socks",
    description:
      "Step into luxury with our StepSoft Socks, designed to pamper your feet with every step. Their cloud-like cushioning is like a spa for your soles.",
    color: "orange",
    size: "xs",
    quantity: 1,

    list_price: 25,
    sale_price: 22.5,
    discount: 2.5,
    discount_percentage: null,

    sold: 200,
    stock: 10,

    image_url:
      "https://vaqybtnqyonvlwtskzmv.supabase.co/storage/v1/object/public/e-commerce-track-images/stepsoft-socks/stepsoft-socks-1.jpg",

    createdAt: Date.now(),
  },

  {
    sku: "es-beige-6",
    product_id: "elemental-sneakers",
    name: "Elemental Sneakers",
    description:
      "Ground your steps in style with our Elemental Sneakers. Designed with the elements in mind, they bring a natural balance to your stride and your ensemble.",
    color: "beige",
    size: 6,
    quantity: 1,

    list_price: 100,
    sale_price: 80,
    discount: null,
    discount_percentage: 20,

    sold: 60,
    stock: 440,

    image_url:
      "https://vaqybtnqyonvlwtskzmv.supabase.co/storage/v1/object/public/e-commerce-track-images/elemental-sneakers/elemental-sneakers-1.jpg",

    createdAt: Date.now(),
  },

  {
    sku: "aas-blue",
    product_id: "azure-attitude-shades",
    name: "Azure Attitude Shades",
    description:
      "Step out in style with our Azure Attitude Shades, featuring a bold blue tint and modern design. These sunglasses are not just an accessory but a statement of confidence.",
    color: "blue",
    size: null,
    quantity: 1,

    list_price: 45,
    sale_price: 45,
    discount: null,
    discount_percentage: null,

    sold: 65,
    stock: 435,

    image_url:
      "https://vaqybtnqyonvlwtskzmv.supabase.co/storage/v1/object/public/e-commerce-track-images/azure-attitude-shades/azure-attitude-shades-1.jpg",

    createdAt: Date.now(),
  },

  {
    sku: "udbh-white",
    product_id: "urban-drift-bucket-hat",
    name: "Urban Drift Bucket Hat",
    description:
      "Navigate the urban jungle with our Urban Drift Bucket Hat. It's not only trendy but also practical, offering shade from the hustle and bustle.",
    color: "white",
    size: null,
    quantity: 1,

    list_price: 15,
    sale_price: 15,
    discount: null,
    discount_percentage: null,

    sold: 65,
    stock: 435,

    image_url:
      "https://vaqybtnqyonvlwtskzmv.supabase.co/storage/v1/object/public/e-commerce-track-images/urban-drift-bucket-hat/urban-drift-bucket-hat-5.jpg",

    createdAt: Date.now(),
  },
];

// cartItems = [];

// * Global constants
const cartItemsContainer = document.getElementById("cartItemsContainer");
const subtotal = document.getElementById("subtotal");

// * Initial render
render();

renderSubtotal();

// * Rendering functions
function renderCartItems(cartItems) {
//   // ! If cart is empty display empty cart
//   if (!cartItems.length) console.log("Empty Cart! Nothing to render");

//   if (!cartItems.length) {
//     // 
//   }

  return cartItems
    .map((item) => {
      const {
        sku,
        image_url,
        list_price,
        sale_price,
        discount,
        discount_percentage,
        size,
        color,
        quantity,
        stock,
      } = item;

      return `<div
          class="product-card flex gap-y-4 flex-col border-b-2 border-dotted border-neutral-200 pb-8 mb-8 last:border-b-0 md:flex-row md:gap-x-8"
          id="${item.sku}"
        >
          <figure class="min-w-[280px] h-[200px]">
            <img
              class="w-full h-full object-cover rounded-lg md:w-[280px]"
              src="${item.image_url}"
              alt="product image"
            />
          </figure>

          <!-- Card title -->
          <div class="flex flex-col gap-y-4">
            <h2 class="text-2xl font-medium text-neutral-900">
              ${item.name}
            </h2>

            <!-- Product specs -->
            <p class="font-medium text-neutral-600 capitalize">${color} ${size ? "•" : ""} ${formatSize(size)}</p>

            <!-- Product description -->
            <p class="text-sm text-neutral-600">
              ${item.description}
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

function render() {
  cartItemsContainer.innerHTML = renderCartItems(cartItems);
}

function renderSubtotal() {
  subtotal.innerText = `$${formatPrice(calculateSubtotal(cartItems))}`;
}

// * Event listeners
cartItemsContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  const action = button.dataset.action;
  const sku = button.dataset.sku;

  const itemIndex = cartItems.findIndex((item) => item.sku === sku);
  const item = cartItems[itemIndex];
  
  if (!item) return;
  
  const { stock, quantity } = item;

  // * Increment
  if (action === "increment") {
    if (quantity >= stock) return;

    // ? Update cart state
    cartItems[itemIndex] = {
      ...cartItems[itemIndex],
      quantity: quantity + 1,
    };
  }

  // * Decrement
  if (action === "decrement") {
    if (quantity <= 1) return;

    // ? Update cart state
    cartItems[itemIndex] = {
      ...cartItems[itemIndex],
      quantity: quantity - 1,
    };
  }

  // * Remove
  if (action === "remove") {
    cartItems = cartItems.filter((item) => item.sku !== sku);
  }

  console.log(cartItems[itemIndex]);

  // ? Re-render cart items
  render();
  // ? Update subtotal
  renderSubtotal();
});

// * Helper utility functions
function formatPrice(price) {
  if (Number.isInteger(price)) return price;
  else return price.toFixed(2);
}

function formatSize(size) {
  let formattedSize = size;

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
      default:
        formattedSize = "";
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
