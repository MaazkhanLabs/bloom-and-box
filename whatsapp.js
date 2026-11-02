/**
 * Bloom & Box - WhatsApp Ordering & Payment System
 * Configured for admin WhatsApp redirection with full order breakdown
 */

// Default Admin WhatsApp Number (International format without '+' or spaces)
// Configured to admin's WhatsApp number: +91 8169188117
const DEFAULT_ADMIN_WHATSAPP = "918169188117";

function getAdminWhatsApp() {
  const stored = localStorage.getItem('bloom_admin_whatsapp');
  if (stored && stored !== "923001234567") {
    return stored;
  }
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

// Shopping Cart State synced via localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('bloom_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('bloom_cart', JSON.stringify(cart));
  updateCartCounters();
}

function addToCartGlobal(name, price, image, details) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      name: name,
      price: parseInt(price) || 0,
      image: image || '',
      details: details || '',
      quantity: 1
    });
  }
  saveCart(cart);
  showWhatsAppToast(`✓ ${name} added to cart!`);
  openCartDrawer();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartDrawer();
}

function updateQuantity(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity = (cart[index].quantity || 1) + delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCartDrawer();
  }
}

function clearCart() {
  saveCart([]);
  renderCartDrawer();
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

function updateCartCounters() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-count-badge, #cart-count-label').forEach(el => {
    el.textContent = `Bag (${totalCount})`;
  });
}

// Redirect Order to Admin WhatsApp with Full Breakdown
function sendWhatsAppOrder(customDetails = null) {
  const adminNumber = getAdminWhatsApp();
  const cart = getCart();

  let message = `🌸 *New Order Request — Bloom & Box* 🌸\n\n`;

  if (customDetails) {
    message += `*Custom Commission Details:*\n`;
    if (customDetails.base) message += `• Base: ${customDetails.base}\n`;
    if (customDetails.addons && customDetails.addons.length) {
      message += `• Add-ons: ${customDetails.addons.join(', ')}\n`;
    }
    if (customDetails.wrapping) message += `• Packaging: ${customDetails.wrapping}\n`;
    if (customDetails.ribbon) message += `• Ribbon Text: "${customDetails.ribbon}" (${customDetails.ribbonColor || 'Silk'})\n`;
    if (customDetails.note) message += `• Card Message: "${customDetails.note}"\n`;
    if (customDetails.mist) message += `• Botanical Mist: ${customDetails.mist}\n`;
    if (customDetails.total) message += `\n💰 *Total Price: ₨${Number(customDetails.total).toLocaleString('en-PK')}*\n`;
  } else if (cart.length > 0) {
    message += `*Ordered Items:*\n`;
    cart.forEach(item => {
      const q = item.quantity || 1;
      message += `• ${q}x ${item.name} — ₨${(item.price * q).toLocaleString('en-PK')}\n`;
      if (item.details) message += `   _${item.details}_\n`;
    });
    const total = getCartTotal();
    message += `\n💰 *Total Estimated Amount: ₨${total.toLocaleString('en-PK')}*\n`;
  } else {
    message += `Hello! I would like to inquire about placing a custom gift order.\n`;
  }

  // Delivery details if provided
  const cityInput = document.getElementById('delivery-area-select');
  if (cityInput) {
    message += `📍 *Delivery Area:* ${cityInput.value}\n`;
  }

  message += `\nPlease confirm availability and share payment instructions (Bank Transfer / EasyPaisa / Cash on Delivery). Thank you!`;

  const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Direct Buy / Commission Single Product on WhatsApp
function buyDirectOnWhatsApp(productName, price, packaging, category) {
  const adminNumber = getAdminWhatsApp();
  let message = `🌸 *Order Inquiry — Bloom & Box* 🌸\n\n`;
  message += `Hello, I want to order the following masterpiece:\n\n`;
  message += `*Product:* ${productName}\n`;
  message += `*Price:* ₨${Number(price).toLocaleString('en-PK')}\n`;
  if (packaging) message += `*Packaging:* ${packaging}\n`;
  if (category) message += `*Category:* ${category}\n`;
  message += `\n📍 Delivery: Lahore, Pakistan\n`;
  message += `Please confirm availability and payment details. Thank you!`;

  const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Quick Toast Notification
function showWhatsAppToast(msg) {
  let toast = document.getElementById('wa-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wa-global-toast';
    toast.className = 'fixed bottom-24 right-6 z-50 px-5 py-3 rounded-xl bg-[#231917] text-[#fff8f6] font-semibold text-sm shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="material-symbols-outlined text-[18px] text-[#25D366]">check_circle</span><span>${msg}</span>`;
  toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
  }, 3000);
}

// Build Floating WhatsApp Button and Cart Drawer
function initWhatsAppUI() {
  // 1. Floating WhatsApp Button
  if (!document.getElementById('floating-wa-btn')) {
    const waBtn = document.createElement('div');
    waBtn.id = 'floating-wa-btn';
    waBtn.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-2 group';
    waBtn.innerHTML = `
      <a href="https://wa.me/${getAdminWhatsApp()}?text=${encodeURIComponent('Hello Bloom & Box! 🌸 I would like to ask about custom bouquets and gift hampers.')}" target="_blank"
         class="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm shadow-xl hover:bg-[#20ba5a] hover:scale-105 transition-all cursor-pointer">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span class="tracking-wide">Order on WhatsApp</span>
      </a>
      <button onclick="promptChangeAdminWhatsApp()" title="Configure Admin WhatsApp Number"
              class="w-8 h-8 rounded-full bg-[#fdeae5] hover:bg-[#91462f] hover:text-white text-[#91462f] shadow flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-[16px]">settings</span>
      </button>
    `;
    document.body.appendChild(waBtn);
  }

  // 2. Cart Drawer Overlay
  if (!document.getElementById('wa-cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'wa-cart-drawer';
    drawer.className = 'fixed inset-0 z-50 hidden';
    drawer.innerHTML = `
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onclick="closeCartDrawer()"></div>
      <div class="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#fff8f6] shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-[#dac1ba]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#91462f] text-[24px]">shopping_bag</span>
              <h2 class="font-serif text-xl font-bold text-[#231917]">Your Gift Bag</h2>
            </div>
            <button onclick="closeCartDrawer()" class="w-8 h-8 rounded-full hover:bg-[#fdeae5] flex items-center justify-center text-[#54433e]">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div id="wa-cart-items-container" class="py-4 space-y-3">
            <!-- Dynamic Cart Items -->
          </div>
        </div>
        <div class="pt-4 border-t border-[#dac1ba] space-y-3">
          <div class="flex items-center justify-between font-bold text-lg text-[#231917]">
            <span>Total:</span>
            <span id="wa-cart-total-label" class="text-[#91462f]">₨0</span>
          </div>
          <button onclick="sendWhatsAppOrder()"
                  class="w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Proceed to WhatsApp Checkout</span>
          </button>
          <p class="text-[11px] text-center text-[#54433e]">Orders &amp; payments are processed securely via direct WhatsApp concierge.</p>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  // Hook all cart open buttons
  document.querySelectorAll('button[aria-label="Open Cart"], #cart-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      openCartDrawer();
    };
  });

  updateCartCounters();
}

function openCartDrawer() {
  const drawer = document.getElementById('wa-cart-drawer');
  if (drawer) {
    renderCartDrawer();
    drawer.classList.remove('hidden');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('wa-cart-drawer');
  if (drawer) {
    drawer.classList.add('hidden');
  }
}

function renderCartDrawer() {
  const container = document.getElementById('wa-cart-items-container');
  const totalLabel = document.getElementById('wa-cart-total-label');
  if (!container || !totalLabel) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 space-y-2">
        <span class="material-symbols-outlined text-[48px] text-[#dac1ba]">shopping_basket</span>
        <p class="text-sm text-[#54433e]">Your gift bag is empty.</p>
        <p class="text-xs text-[#54433e]/70">Explore our bouquets and curated hampers to add items.</p>
      </div>
    `;
    totalLabel.textContent = '₨0';
    return;
  }

  let html = '';
  cart.forEach((item, idx) => {
    const q = item.quantity || 1;
    html += `
      <div class="p-3 rounded-xl bg-[#fff1ed] flex items-center justify-between gap-3 shadow-sm">
        <div class="flex-1">
          <h4 class="font-serif font-bold text-sm text-[#231917]">${item.name}</h4>
          <span class="text-xs text-[#91462f] font-semibold">₨${(item.price * q).toLocaleString('en-PK')}</span>
          ${item.details ? `<p class="text-[11px] text-[#54433e] truncate">${item.details}</p>` : ''}
        </div>
        <div class="flex items-center gap-1.5 bg-[#fdeae5] px-2 py-1 rounded-full text-xs">
          <button onclick="updateQuantity(${idx}, -1)" class="w-5 h-5 flex items-center justify-center font-bold text-[#91462f] hover:bg-[#fff8f6] rounded-full">-</button>
          <span class="font-bold px-1">${q}</span>
          <button onclick="updateQuantity(${idx}, 1)" class="w-5 h-5 flex items-center justify-center font-bold text-[#91462f] hover:bg-[#fff8f6] rounded-full">+</button>
        </div>
        <button onclick="removeFromCart(${idx})" class="text-[#54433e] hover:text-[#ba1a1a]">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  totalLabel.textContent = `₨${getCartTotal().toLocaleString('en-PK')}`;
}

// Dialog to allow admin to quickly enter or change their WhatsApp number in browser
function promptChangeAdminWhatsApp() {
  const current = getAdminWhatsApp();
  const num = prompt("Enter your WhatsApp phone number for receiving orders (e.g. 923001234567):", current);
  if (num !== null) {
    if (setAdminWhatsApp(num)) {
      alert(`✓ WhatsApp orders will now be sent to: +${getAdminWhatsApp()}`);
      location.reload();
    } else {
      alert("Please enter a valid phone number with country code (e.g. 923001234567)");
    }
  }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppUI();
});
