/**
 * Bloom & Box - Unified Store Engine
 * Handles Cart, Wishlist, WhatsApp Concierge Checkout, Quick View, Search & Notifications.
 */

const DEFAULT_ADMIN_WHATSAPP = "918169188117";
const FREE_DELIVERY_THRESHOLD = 5000;
const PROMO_CODES = {
  "BLOOM10": { type: "percent", value: 10, label: "10% Off Bloom Club Discount" },
  "WELCOME500": { type: "flat", value: 500, label: "₨500 Off Inaugural Gift" },
  "LUXURY15": { type: "percent", value: 15, label: "15% Off VIP Celebration" }
};

// --- ADMIN WHATSAPP ---
function getAdminWhatsApp() {
  const stored = localStorage.getItem('bloom_admin_whatsapp');
  if (stored && stored !== "923001234567") return stored;
  return DEFAULT_ADMIN_WHATSAPP;
}

function setAdminWhatsApp(newNumber) {
  const cleaned = newNumber.replace(/[^0-9]/g, '');
  if (cleaned.length >= 10) {
    localStorage.setItem('bloom_admin_whatsapp', cleaned);
    return true;
  }
  return false;
}

// --- CART STATE ---
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('bloom_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('bloom_cart', JSON.stringify(cart));
  updateUIBadges();
  renderCartDrawer();
}

function addToCart(productId, quantity = 1, options = null) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  const cart = getCart();

  const itemKey = options ? `${productId}-${JSON.stringify(options)}` : productId;
  const existing = cart.find(item => item.key === itemKey);

  const name = product ? product.name : (options?.customName || 'Artisanal Gift');
  const price = options?.customPrice || (product ? product.price : 0);
  const image = options?.customImage || (product ? product.images[0] : '');

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      key: itemKey,
      id: productId,
      name: name,
      price: price,
      image: image,
      quantity: quantity,
      options: options || null
    });
  }

  saveCart(cart);
  showToast(`✓ ${name} added to your bag`, "success");
  openCartDrawer();
}

function removeFromCart(itemKey) {
  let cart = getCart();
  cart = cart.filter(item => item.key !== itemKey);
  saveCart(cart);
  showToast("Item removed from your bag", "info");
}

function updateCartQuantity(itemKey, delta) {
  let cart = getCart();
  const item = cart.find(i => i.key === itemKey);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.key !== itemKey);
    }
    saveCart(cart);
  }
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getActivePromo() {
  try {
    return JSON.parse(localStorage.getItem('bloom_active_promo') || 'null');
  } catch (e) {
    return null;
  }
}

function applyPromoCode(codeStr) {
  const cleanCode = (codeStr || '').trim().toUpperCase();
  if (PROMO_CODES[cleanCode]) {
    localStorage.setItem('bloom_active_promo', JSON.stringify({ code: cleanCode, ...PROMO_CODES[cleanCode] }));
    showToast(`✓ Promo code "${cleanCode}" applied!`, "success");
    renderCartDrawer();
    return true;
  } else {
    showToast("Invalid or expired promo code", "error");
    return false;
  }
}

function removePromoCode() {
  localStorage.removeItem('bloom_active_promo');
  renderCartDrawer();
  showToast("Promo code removed", "info");
}

function isGiftWrapSelected() {
  return localStorage.getItem('bloom_gift_wrap') === 'true';
}

function toggleGiftWrap(isSelected) {
  localStorage.setItem('bloom_gift_wrap', isSelected ? 'true' : 'false');
  renderCartDrawer();
}

function calculateOrderTotals() {
  const subtotal = getCartSubtotal();
  const promo = getActivePromo();
  let discount = 0;

  if (promo && subtotal > 0) {
    if (promo.type === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100);
    } else if (promo.type === 'flat') {
      discount = Math.min(subtotal, promo.value);
    }
  }

  const giftWrap = isGiftWrapSelected() && subtotal > 0 ? 500 : 0;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 350;
  const finalTotal = Math.max(0, subtotal - discount + giftWrap + delivery);

  return { subtotal, discount, giftWrap, delivery, finalTotal, promo };
}

// --- WISHLIST STATE ---
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('bloom_wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  const title = product ? product.name : "Item";

  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
    showToast(`Removed from your wishlist`, "info");
  } else {
    list.push(productId);
    showToast(`♥ Saved "${title}" to your wishlist`, "success");
  }

  localStorage.setItem('bloom_wishlist', JSON.stringify(list));
  updateUIBadges();
  renderWishlistDrawer();

  // Update heart icons on page
  document.querySelectorAll(`[data-wishlist-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('text-[#B97980]', list.includes(productId));
    btn.classList.toggle('text-[#443535]', !list.includes(productId));
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.style.fontVariationSettings = list.includes(productId) ? "'FILL' 1" : "'FILL' 0";
    }
  });
}

// --- WHATSAPP CONCIERGE DISPATCH ---
function proceedToWhatsAppCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your gift bag is empty", "error");
    return;
  }

  const totals = calculateOrderTotals();
  const adminNumber = getAdminWhatsApp();

  let message = `🌸 *New Order Commission — Bloom & Box* 🌸\n\n`;
  message += `Hello! I would like to confirm my order from the online boutique:\n\n`;
  message += `*Ordered Items:*\n`;

  cart.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}* (x${item.quantity}) — ₨${(item.price * item.quantity).toLocaleString('en-PK')}\n`;
    if (item.options) {
      if (item.options.ribbon) message += `   • Ribbon: "${item.options.ribbon}" (${item.options.ribbonColor || 'Silk'})\n`;
      if (item.options.note) message += `   • Note: "${item.options.note}"\n`;
      if (item.options.addons && item.options.addons.length) message += `   • Add-ons: ${item.options.addons.join(', ')}\n`;
      if (item.options.wrapping) message += `   • Wrap: ${item.options.wrapping}\n`;
    }
  });

  message += `\n-------------------------\n`;
  message += `*Subtotal:* ₨${totals.subtotal.toLocaleString('en-PK')}\n`;
  if (totals.discount > 0) {
    message += `*Promo Discount (${totals.promo.code}):* -₨${totals.discount.toLocaleString('en-PK')}\n`;
  }
  if (totals.giftWrap > 0) {
    message += `*Luxury Keepsake Gift Box Wrapping:* +₨500\n`;
  }
  message += `*Courier Logistics:* ${totals.delivery === 0 ? 'FREE (Same-Day Eligible)' : '₨' + totals.delivery}\n`;
  message += `💰 *Final Amount Payable:* ₨${totals.finalTotal.toLocaleString('en-PK')}\n\n`;

  // Delivery Notes if in cart form
  const deliveryDateInput = document.getElementById('cart-delivery-date');
  if (deliveryDateInput && deliveryDateInput.value) {
    message += `📅 *Preferred Delivery Date:* ${deliveryDateInput.value}\n`;
  }
  const customerCityInput = document.getElementById('cart-delivery-city');
  if (customerCityInput && customerCityInput.value) {
    message += `📍 *Delivery Destination:* ${customerCityInput.value}\n`;
  }
  const specialInstructions = document.getElementById('cart-special-notes');
  if (specialInstructions && specialInstructions.value) {
    message += `📝 *Client Note:* ${specialInstructions.value}\n`;
  }

  message += `\nPlease confirm stock availability and share payment transfer details (Bank Transfer / EasyPaisa / JazzCash / COD). Thank you!`;

  const waUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "info") {
  let container = document.getElementById('bloom-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'bloom-toast-container';
    container.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'error' ? 'bg-[#93000A] text-white' : type === 'success' ? 'bg-[#443535] text-[#F7EDEB]' : 'bg-[#443535] text-[#F7EDEB]';
  const icon = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';

  toast.className = `flex items-center gap-2.5 px-5 py-3 rounded-full text-xs md:text-sm font-medium shadow-2xl transition-all duration-300 transform translate-y-6 opacity-0 pointer-events-auto ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px] text-[#E8C9C9]" style="font-variation-settings: 'FILL' 1;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-6', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-6', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --- UPDATE BADGES (Cart & Wishlist) ---
function updateUIBadges() {
  const cart = getCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = cartCount;
    el.classList.toggle('hidden', cartCount === 0);
  });
  document.querySelectorAll('.cart-bag-label').forEach(el => {
    el.textContent = `Bag (${cartCount})`;
  });

  const wishlist = getWishlist();
  const wishCount = wishlist.length;
  document.querySelectorAll('.wishlist-badge-count').forEach(el => {
    el.textContent = wishCount;
    el.classList.toggle('hidden', wishCount === 0);
  });
}

// --- RENDER CART DRAWER ---
function renderCartDrawer() {
  const drawer = document.getElementById('bloom-cart-drawer');
  if (!drawer) return;

  const itemsContainer = document.getElementById('cart-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  const filledState = document.getElementById('cart-filled-state');
  const cart = getCart();
  const totals = calculateOrderTotals();

  // Free delivery progress
  const progressPercent = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const progressFill = document.getElementById('cart-delivery-progress-bar');
  const progressText = document.getElementById('cart-delivery-progress-text');
  if (progressFill && progressText) {
    progressFill.style.width = `${progressPercent}%`;
    if (totals.subtotal >= FREE_DELIVERY_THRESHOLD) {
      progressText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked FREE Delivery.`;
    } else {
      const remaining = FREE_DELIVERY_THRESHOLD - totals.subtotal;
      progressText.innerHTML = `Add <strong>₨${remaining.toLocaleString('en-PK')}</strong> more for <strong>FREE Delivery</strong>`;
    }
  }

  if (cart.length === 0) {
    if (itemsContainer) itemsContainer.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (filledState) filledState.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (filledState) filledState.classList.remove('hidden');

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="flex gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8C9C9]/40 shadow-sm transition-all hover:border-[#B97980]/40">
        <img src="${item.image || 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200'}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#F7EDEB]">
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-serif font-semibold text-sm text-[#443535] leading-snug">${item.name}</h4>
              <button onclick="removeFromCart('${item.key}')" class="text-[#443535]/50 hover:text-[#93000A] p-0.5 transition-colors" title="Remove item">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            ${item.options?.ribbon ? `<p class="text-[11px] text-[#B97980] italic mt-0.5 font-serif">Ribbon: "${item.options.ribbon}"</p>` : ''}
            ${item.options?.details ? `<p class="text-[11px] text-[#443535]/70 line-clamp-1 mt-0.5">${item.options.details}</p>` : ''}
          </div>
          <div class="flex items-center justify-between pt-2 mt-1 border-t border-[#F7EDEB]">
            <div class="flex items-center border border-[#E8C9C9] rounded-full overflow-hidden bg-[#F7EDEB]">
              <button onclick="updateCartQuantity('${item.key}', -1)" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#443535] hover:bg-[#E8C9C9] transition-colors">-</button>
              <span class="px-2 text-xs font-semibold text-[#443535]">${item.quantity}</span>
              <button onclick="updateCartQuantity('${item.key}', 1)" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#443535] hover:bg-[#E8C9C9] transition-colors">+</button>
            </div>
            <span class="font-serif font-bold text-sm text-[#443535]">₨${(item.price * item.quantity).toLocaleString('en-PK')}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update summary numbers
  const subtotalEl = document.getElementById('cart-subtotal-val');
  if (subtotalEl) subtotalEl.textContent = `₨${totals.subtotal.toLocaleString('en-PK')}`;

  const discountRow = document.getElementById('cart-discount-row');
  const discountVal = document.getElementById('cart-discount-val');
  if (discountRow && discountVal) {
    if (totals.discount > 0) {
      discountRow.classList.remove('hidden');
      discountVal.textContent = `-₨${totals.discount.toLocaleString('en-PK')}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  const wrapCheck = document.getElementById('cart-giftwrap-check');
  if (wrapCheck) wrapCheck.checked = isGiftWrapSelected();

  const wrapRow = document.getElementById('cart-wrap-row');
  if (wrapRow) {
    wrapRow.classList.toggle('hidden', !isGiftWrapSelected());
  }

  const deliveryVal = document.getElementById('cart-delivery-val');
  if (deliveryVal) {
    deliveryVal.textContent = totals.delivery === 0 ? "FREE" : `₨${totals.delivery}`;
    deliveryVal.className = totals.delivery === 0 ? "text-emerald-700 font-semibold" : "font-semibold text-[#443535]";
  }

  const finalTotalEl = document.getElementById('cart-final-total-val');
  if (finalTotalEl) finalTotalEl.textContent = `₨${totals.finalTotal.toLocaleString('en-PK')}`;
}

// --- RENDER WISHLIST DRAWER ---
function renderWishlistDrawer() {
  const container = document.getElementById('wishlist-items-list');
  const emptyState = document.getElementById('wishlist-empty-state');
  if (!container) return;

  const wishlist = getWishlist();
  if (wishlist.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const products = wishlist.map(id => typeof getProductById === 'function' ? getProductById(id) : null).filter(Boolean);

  container.innerHTML = products.map(product => `
    <div class="flex gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8C9C9]/40 shadow-sm items-center justify-between">
      <img src="${product.images[0]}" alt="${product.name}" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#F7EDEB]">
      <div class="flex-1">
        <h4 class="font-serif font-semibold text-sm text-[#443535] leading-snug">${product.name}</h4>
        <span class="font-serif font-bold text-xs text-[#B97980]">₨${product.price.toLocaleString('en-PK')}</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="addToCart('${product.id}'); toggleWishlist('${product.id}')" class="px-3 py-1.5 rounded-full bg-[#B97980] text-white text-xs font-semibold hover:bg-[#443535] transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">shopping_bag</span> Add
        </button>
        <button onclick="toggleWishlist('${product.id}')" class="text-[#443535]/40 hover:text-[#93000A] p-1" title="Remove">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  `).join('');
}

// --- QUICK VIEW MODAL ---
function openQuickView(productId) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  const modal = document.getElementById('bloom-quickview-modal');
  if (!modal) return;

  document.getElementById('qv-product-img').src = product.images[0];
  document.getElementById('qv-product-title').textContent = product.name;
  document.getElementById('qv-product-price').textContent = `₨${product.price.toLocaleString('en-PK')}`;
  document.getElementById('qv-product-category').textContent = `${product.category.toUpperCase()} · ${product.subCategory || ''}`;
  document.getElementById('qv-product-desc').textContent = product.description;
  document.getElementById('qv-product-details').textContent = product.details;
  document.getElementById('qv-product-link').href = `product.html?id=${product.id}`;

  const addBtn = document.getElementById('qv-add-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const qtyInput = document.getElementById('qv-qty-input');
      const qty = parseInt(qtyInput?.value) || 1;
      addToCart(product.id, qty);
      closeQuickView();
    };
  }

  modal.classList.remove('hidden');
}

function closeQuickView() {
  const modal = document.getElementById('bloom-quickview-modal');
  if (modal) modal.classList.add('hidden');
}

// --- DRAWER OPEN/CLOSE HELPERS ---
function openCartDrawer() {
  const drawer = document.getElementById('bloom-cart-drawer');
  if (drawer) {
    renderCartDrawer();
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('bloom-cart-drawer');
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function openWishlistDrawer() {
  const drawer = document.getElementById('bloom-wishlist-drawer');
  if (drawer) {
    renderWishlistDrawer();
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('bloom-wishlist-drawer');
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Global Search Overlay
function openSearchModal() {
  const modal = document.getElementById('bloom-search-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('global-search-input')?.focus();
  }
}

function closeSearchModal() {
  const modal = document.getElementById('bloom-search-modal');
  if (modal) modal.classList.add('hidden');
}

function handleSearchQuery(query) {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  const clean = (query || '').trim().toLowerCase();
  if (clean.length < 2) {
    container.innerHTML = `<p class="text-xs text-[#443535]/60 text-center py-6">Type at least 2 letters to search bouquets, hampers & keepsakes...</p>`;
    return;
  }

  const matches = (typeof getAllProducts === 'function' ? getAllProducts() : []).filter(p =>
    p.name.toLowerCase().includes(clean) ||
    p.category.toLowerCase().includes(clean) ||
    p.description.toLowerCase().includes(clean) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(clean)))
  );

  if (matches.length === 0) {
    container.innerHTML = `<p class="text-xs text-[#443535]/60 text-center py-6">No matching gifts found for "${query}".</p>`;
    return;
  }

  container.innerHTML = matches.map(p => `
    <a href="product.html?id=${p.id}" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7EDEB] transition-colors group">
      <img src="${p.images[0]}" alt="${p.name}" class="w-12 h-12 rounded-lg object-cover">
      <div class="flex-1">
        <h5 class="font-serif text-sm font-semibold text-[#443535] group-hover:text-[#B97980] transition-colors">${p.name}</h5>
        <span class="text-xs text-[#B97980] font-semibold">₨${p.price.toLocaleString('en-PK')}</span>
      </div>
      <span class="material-symbols-outlined text-[18px] text-[#443535]/40 group-hover:text-[#B97980]">chevron_right</span>
    </a>
  `).join('');
}

// Config WhatsApp Prompt
function promptChangeAdminWhatsApp() {
  const current = getAdminWhatsApp();
  const num = prompt("Enter your WhatsApp phone number with country code (e.g. 918169188117):", current);
  if (num !== null) {
    if (setAdminWhatsApp(num)) {
      alert(`✓ WhatsApp orders will now be sent to: +${getAdminWhatsApp()}`);
      location.reload();
    } else {
      alert("Please enter a valid phone number with country code (e.g. 918169188117)");
    }
  }
}

// --- INITIALIZE GLOBAL STORE MODALS ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  injectGlobalModals();
  updateUIBadges();
});

function injectGlobalModals() {
  // If cart drawer does not exist, inject it
  if (!document.getElementById('bloom-cart-drawer')) {
    const cartDrawer = document.createElement('div');
    cartDrawer.id = 'bloom-cart-drawer';
    cartDrawer.className = 'fixed inset-0 z-[90] hidden';
    cartDrawer.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeCartDrawer()"></div>
      <div class="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#F7EDEB] shadow-2xl flex flex-col justify-between overflow-hidden z-10">
        <!-- Header -->
        <div class="p-5 bg-white border-b border-[#E8C9C9] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[24px] text-[#B97980]">shopping_bag</span>
            <h3 class="font-serif font-bold text-lg text-[#443535]">Your Gift Bag</h3>
          </div>
          <button onclick="closeCartDrawer()" class="w-8 h-8 rounded-full hover:bg-[#F7EDEB] flex items-center justify-center text-[#443535]/70 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Free Delivery Progress Bar -->
        <div class="px-5 py-3 bg-[#E8C9C9]/30 border-b border-[#E8C9C9]/50">
          <p id="cart-delivery-progress-text" class="text-xs text-[#443535] mb-1.5 text-center">Free Delivery on orders above ₨5,000</p>
          <div class="w-full h-1.5 bg-white rounded-full overflow-hidden">
            <div id="cart-delivery-progress-bar" class="h-full bg-[#B97980] transition-all duration-500" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Items Container -->
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <div id="cart-empty-state" class="text-center py-12 space-y-3 hidden">
            <div class="w-16 h-16 rounded-full bg-[#E8C9C9]/40 flex items-center justify-center mx-auto text-[#B97980]">
              <span class="material-symbols-outlined text-[32px]">local_mall</span>
            </div>
            <h4 class="font-serif font-bold text-base text-[#443535]">Your gift bag is empty</h4>
            <p class="text-xs text-[#443535]/70 max-w-xs mx-auto">Explore our fresh bouquets, curated hampers and forever keepsakes.</p>
            <a href="shop.html" onclick="closeCartDrawer()" class="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#B97980] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#443535] transition-colors shadow">
              Explore Shop
            </a>
          </div>
          <div id="cart-items-list" class="space-y-3"></div>
        </div>

        <!-- Footer / Checkout Section -->
        <div id="cart-filled-state" class="p-5 bg-white border-t border-[#E8C9C9] space-y-3">
          <!-- Gift wrap add-on toggle -->
          <label class="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7EDEB] cursor-pointer text-xs text-[#443535]">
            <input type="checkbox" id="cart-giftwrap-check" onchange="toggleGiftWrap(this.checked)" class="w-4 h-4 rounded text-[#B97980] focus:ring-[#B97980]">
            <span class="flex-1 font-medium">Add Signature Velvet Gift Wrap (+₨500)</span>
            <span class="material-symbols-outlined text-[18px] text-[#B97980]">card_giftcard</span>
          </label>

          <!-- Promo Code input -->
          <div class="flex gap-2">
            <input type="text" id="cart-promo-input" placeholder="Promo Code (try BLOOM10)" class="flex-1 px-3 py-2 bg-[#F7EDEB] border border-[#E8C9C9] rounded-xl text-xs uppercase focus:outline-none focus:ring-1 focus:ring-[#B97980]">
            <button onclick="applyPromoCode(document.getElementById('cart-promo-input').value)" class="px-4 py-2 bg-[#443535] text-[#F7EDEB] text-xs font-semibold rounded-xl hover:bg-[#B97980] transition-colors">Apply</button>
          </div>

          <!-- Price Summary Breakdown -->
          <div class="space-y-1 text-xs text-[#443535]/80 pt-1">
            <div class="flex justify-between"><span>Subtotal:</span><span id="cart-subtotal-val" class="font-semibold text-[#443535]">₨0</span></div>
            <div id="cart-discount-row" class="flex justify-between text-emerald-700 hidden"><span>Promo Discount:</span><span id="cart-discount-val">-₨0</span></div>
            <div id="cart-wrap-row" class="flex justify-between text-[#B97980] hidden"><span>Signature Velvet Wrap:</span><span>+₨500</span></div>
            <div class="flex justify-between"><span>Courier Delivery:</span><span id="cart-delivery-val" class="font-semibold text-[#443535]">₨0</span></div>
            <div class="flex justify-between text-base font-bold text-[#443535] pt-2 border-t border-[#F7EDEB]">
              <span>Estimated Total:</span>
              <span id="cart-final-total-val" class="font-serif text-[#B97980]">₨0</span>
            </div>
          </div>

          <!-- Checkout via WhatsApp Button -->
          <button onclick="proceedToWhatsAppCheckout()" class="w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>Proceed to WhatsApp Checkout</span>
          </button>
          <p class="text-[10px] text-center text-[#443535]/60">Order &amp; payment instructions provided via direct atelier concierge.</p>
        </div>
      </div>
    `;
    document.body.appendChild(cartDrawer);
  }

  // Wishlist Drawer
  if (!document.getElementById('bloom-wishlist-drawer')) {
    const wishDrawer = document.createElement('div');
    wishDrawer.id = 'bloom-wishlist-drawer';
    wishDrawer.className = 'fixed inset-0 z-[90] hidden';
    wishDrawer.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeWishlistDrawer()"></div>
      <div class="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#F7EDEB] shadow-2xl flex flex-col justify-between overflow-hidden z-10">
        <div class="p-5 bg-white border-b border-[#E8C9C9] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[24px] text-[#B97980]" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <h3 class="font-serif font-bold text-lg text-[#443535]">Saved Treasures</h3>
          </div>
          <button onclick="closeWishlistDrawer()" class="w-8 h-8 rounded-full hover:bg-[#F7EDEB] flex items-center justify-center text-[#443535]/70 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <div id="wishlist-empty-state" class="text-center py-12 space-y-3 hidden">
            <div class="w-16 h-16 rounded-full bg-[#E8C9C9]/40 flex items-center justify-center mx-auto text-[#B97980]">
              <span class="material-symbols-outlined text-[32px]">favorite_border</span>
            </div>
            <h4 class="font-serif font-bold text-base text-[#443535]">Your Wishlist is Empty</h4>
            <p class="text-xs text-[#443535]/70 max-w-xs mx-auto">Tap the heart on any arrangement to save it for your special upcoming moment.</p>
          </div>
          <div id="wishlist-items-list" class="space-y-3"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wishDrawer);
  }

  // Global Search Modal
  if (!document.getElementById('bloom-search-modal')) {
    const searchModal = document.createElement('div');
    searchModal.id = 'bloom-search-modal';
    searchModal.className = 'fixed inset-0 z-[100] hidden flex items-start justify-center pt-20 px-4';
    searchModal.innerHTML = `
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeSearchModal()"></div>
      <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#E8C9C9]">
        <div class="p-4 border-b border-[#E8C9C9] flex items-center gap-3">
          <span class="material-symbols-outlined text-[#B97980] text-[24px]">search</span>
          <input type="text" id="global-search-input" oninput="handleSearchQuery(this.value)" placeholder="Search flowers, hampers, occasions..." class="flex-1 bg-transparent text-sm text-[#443535] focus:outline-none">
          <button onclick="closeSearchModal()" class="text-[#443535]/50 hover:text-[#443535]">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div id="search-results-container" class="p-4 max-h-80 overflow-y-auto divide-y divide-[#F7EDEB]">
          <p class="text-xs text-[#443535]/60 text-center py-6">Type to discover handcrafted arrangements...</p>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);
  }

  // Quick View Modal
  if (!document.getElementById('bloom-quickview-modal')) {
    const qvModal = document.createElement('div');
    qvModal.id = 'bloom-quickview-modal';
    qvModal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center p-4';
    qvModal.innerHTML = `
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeQuickView()"></div>
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 border border-[#E8C9C9]">
        <button onclick="closeQuickView()" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-[#443535] flex items-center justify-center hover:bg-white shadow">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
        <div class="h-64 md:h-full bg-[#F7EDEB] relative">
          <img id="qv-product-img" src="" alt="" class="w-full h-full object-cover">
        </div>
        <div class="p-6 flex flex-col justify-between space-y-4">
          <div>
            <span id="qv-product-category" class="text-[11px] font-bold text-[#B97980] uppercase tracking-widest block"></span>
            <h3 id="qv-product-title" class="font-serif font-bold text-xl text-[#443535] mt-1 leading-tight"></h3>
            <span id="qv-product-price" class="font-serif font-bold text-lg text-[#B97980] block mt-1"></span>
            <p id="qv-product-desc" class="text-xs text-[#443535]/80 mt-3 leading-relaxed"></p>
            <p id="qv-product-details" class="text-[11px] text-[#443535]/60 mt-2 bg-[#F7EDEB] p-2.5 rounded-xl"></p>
          </div>
          <div class="space-y-2 pt-2 border-t border-[#F7EDEB]">
            <div class="flex items-center gap-2">
              <input type="number" id="qv-qty-input" value="1" min="1" max="10" class="w-14 px-2 py-2 rounded-xl border border-[#E8C9C9] text-center text-xs font-bold text-[#443535]">
              <button id="qv-add-btn" class="flex-1 py-2.5 rounded-full bg-[#B97980] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#443535] transition-colors shadow">
                Add to Bag
              </button>
            </div>
            <a id="qv-product-link" href="#" class="block text-center text-xs text-[#B97980] font-semibold hover:underline">
              View Full Details &amp; Options →
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(qvModal);
  }

  // Floating WhatsApp Widget
  if (!document.getElementById('bloom-floating-whatsapp')) {
    const waPill = document.createElement('div');
    waPill.id = 'bloom-floating-whatsapp';
    waPill.className = 'fixed bottom-6 right-6 z-40 flex items-center gap-2';
    waPill.innerHTML = `
      <a href="https://wa.me/${getAdminWhatsApp()}?text=${encodeURIComponent('Hello Bloom & Box! 🌸 I would like to inquire about placing an order.')}" target="_blank"
         class="flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold text-xs md:text-sm shadow-xl hover:bg-[#20ba5a] hover:scale-105 transition-all">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        <span class="tracking-wide hidden sm:inline">Order on WhatsApp</span>
      </a>
      <button onclick="promptChangeAdminWhatsApp()" title="Configure Admin WhatsApp Number"
              class="w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#B97980] hover:text-white text-[#443535] shadow-lg flex items-center justify-center transition-colors border border-[#E8C9C9]">
        <span class="material-symbols-outlined text-[16px]">settings</span>
      </button>
    `;
    document.body.appendChild(waPill);
  }
}
