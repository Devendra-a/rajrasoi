/**
 * RAJ RASOI - King of Hotel, Restaurants & Banquet
 * Interactive Frontend Engine
 * - Dynamic Live Business Hours Calculator
 * - WhatsApp Plate / Cart Manager
 * - Dine-in, Highway Takeaway & Room Service Order Formatter
 * - Real-time Menu Filter & Search
 * - Banquet & Hotel Room WhatsApp Inquiry Handlers
 * - Lightbox & Mobile Drawer Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // Primary Contact & WhatsApp Configuration
  const RAJ_RASOI_PHONE = '917570006220'; // Primary mobile: +91 75700 06220
  const RAJ_RASOI_ALT_PHONE = '918601226876';

  // State
  let cart = JSON.parse(localStorage.getItem('raj_rasoi_cart') || '[]');
  let currentOrderType = 'dinein'; // 'dinein', 'takeaway', 'roomservice'

  // DOM Elements
  const liveStatusDot = document.getElementById('liveStatusDot');
  const liveStatusText = document.getElementById('liveStatusText');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const mobileCartBadge = document.getElementById('mobileCartBadge');
  const sendOrderWhatsAppBtn = document.getElementById('sendOrderWhatsAppBtn');
  const orderDetailsInput = document.getElementById('orderDetailsInput');
  const orderTypeBtns = document.querySelectorAll('.type-btn');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const toastMsg = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');

  /* ==========================================================================
     1. LIVE BUSINESS HOURS STATUS
     Open daily 9:00 AM to 12:00 AM (Midnight)
     ========================================================================== */
  function updateBusinessStatus() {
    if (!liveStatusText) return;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const openMinutes = 9 * 60; // 9:00 AM
    const closeMinutes = 24 * 60; // 12:00 AM (Midnight)

    const isOpen = totalMinutes >= openMinutes && totalMinutes < closeMinutes;

    if (isOpen) {
      if (liveStatusDot) {
        liveStatusDot.style.background = '#00d26a';
        liveStatusDot.style.boxShadow = '0 0 10px #00d26a';
      }
      liveStatusText.innerHTML = '<strong class="status-open-text">Open Now</strong> | Kitchen & Rooms Open Till 12:00 AM';
    } else {
      if (liveStatusDot) {
        liveStatusDot.style.background = '#ef4444';
        liveStatusDot.style.boxShadow = '0 0 10px #ef4444';
      }
      liveStatusText.innerHTML = '<strong class="status-closed-text">Closed Now</strong> | Opens at 9:00 AM Daily';
    }
  }
  updateBusinessStatus();
  setInterval(updateBusinessStatus, 60000);

  /* ==========================================================================
     2. TOAST NOTIFICATION
     ========================================================================== */
  let toastTimeout;
  function showToast(message) {
    if (!toastMsg) return;
    if (toastText) toastText.textContent = message;
    toastMsg.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2500);
  }

  /* ==========================================================================
     2.5 THEME SWITCHER (DAY / NIGHT)
     ========================================================================== */
  function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const htmlRoot = document.documentElement;

    function getCurrentTheme() {
      return htmlRoot.getAttribute('data-theme') || localStorage.getItem('raj_rasoi_theme') || 'dark';
    }

    function setTheme(theme) {
      htmlRoot.setAttribute('data-theme', theme);
      localStorage.setItem('raj_rasoi_theme', theme);
      updateToggleButtons(theme);
    }

    function updateToggleButtons(theme) {
      toggleBtns.forEach(btn => {
        const isNight = (theme === 'dark');
        const tooltip = isNight ? 'Switch to Day Theme (दिन का थीम)' : 'Switch to Night Theme (रात का थीम)';
        btn.setAttribute('title', tooltip);
        btn.setAttribute('aria-label', tooltip);
      });
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = getCurrentTheme();
        const nextTheme = (current === 'dark') ? 'light' : 'dark';
        setTheme(nextTheme);
        showToast(nextTheme === 'light' ? '☀️ Day Theme Activated' : '🌙 Night Theme Activated');
      });
    });

    updateToggleButtons(getCurrentTheme());

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('raj_rasoi_theme')) {
          setTheme(e.matches ? 'light' : 'dark');
        }
      });
    }
  }
  initThemeToggle();

  /* ==========================================================================
     3. ORDER PLATE / CART ENGINE
     ========================================================================== */
  function saveCart() {
    localStorage.setItem('raj_rasoi_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cartCountBadge) cartCountBadge.textContent = totalCount;
    if (mobileCartBadge) mobileCartBadge.textContent = totalCount;
    if (cartTotalAmount) cartTotalAmount.textContent = `₹${totalPrice}`;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <h4>Your Order Plate is Empty</h4>
          <p style="font-size:0.8rem; margin-top:0.4rem;">Browse our Handi specials & North Indian dishes and tap '+ Add to Plate'</p>
        </div>
      `;
      if (sendOrderWhatsAppBtn) sendOrderWhatsAppBtn.style.opacity = '0.5';
    } else {
      if (sendOrderWhatsAppBtn) sendOrderWhatsAppBtn.style.opacity = '1';
      cartItemsContainer.innerHTML = cart.map((item, idx) => `
        <div class="cart-item-card">
          <div class="cart-item-info">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="${item.veg ? 'veg-icon' : 'nonveg-icon'}"></span>
              <h5>${item.name}</h5>
            </div>
            <div class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="modifyItemQty(${idx}, -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="modifyItemQty(${idx}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  window.modifyItemQty = function(index, change) {
    if (cart[index]) {
      cart[index].qty += change;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
    }
  };

  // Add Item to Plate Event Listeners
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card');
      if (!card) return;

      const id = card.dataset.id || card.querySelector('.item-title').textContent;
      const name = card.querySelector('.item-title').textContent.trim();
      const priceText = card.querySelector('.item-price').textContent.replace(/[^0-9]/g, '');
      const price = parseInt(priceText, 10) || 0;
      const isVeg = card.dataset.diet === 'veg';

      const existingIndex = cart.findIndex(i => i.name === name);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1, veg: isVeg });
      }

      saveCart();
      showToast(`Added "${name}" to Order Plate!`);

      // Micro animation
      btn.textContent = '✓ Added';
      btn.style.background = '#10b981';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = '+ Add to Plate';
        btn.style.background = '';
        btn.style.color = '';
      }, 1200);
    });
  });

  // Drawer Toggles
  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartDrawerOverlay) cartDrawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartDrawerOverlay) cartDrawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
  const mobileCartTrigger = document.getElementById('mobileCartTrigger');
  if (mobileCartTrigger) mobileCartTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  });
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  // Order Type Selector in Drawer
  orderTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      orderTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOrderType = btn.dataset.type;

      if (orderDetailsInput) {
        if (currentOrderType === 'dinein') {
          orderDetailsInput.placeholder = 'Enter Table Number (e.g. Table 04 or AC Hall)';
        } else if (currentOrderType === 'takeaway') {
          orderDetailsInput.placeholder = 'Enter Car / Vehicle No. or Approx Arrival Time';
        } else if (currentOrderType === 'roomservice') {
          orderDetailsInput.placeholder = 'Enter Hotel Room Number (e.g. Room 102)';
        }
      }
    });
  });

  // Send Order on WhatsApp Button
  if (sendOrderWhatsAppBtn) {
    sendOrderWhatsAppBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your order plate is empty! Please add some dishes first.');
        return;
      }

      const specificDetail = orderDetailsInput ? orderDetailsInput.value.trim() : '';
      let typeLabel = '🍽️ Dine-in Table';
      if (currentOrderType === 'takeaway') typeLabel = '🚗 Highway Takeaway / Packing';
      if (currentOrderType === 'roomservice') typeLabel = '🏨 Hotel Room Service';

      let itemsText = '';
      let totalAmount = 0;

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        totalAmount += itemTotal;
        const icon = item.veg ? '🟢' : '🔴';
        itemsText += `${index + 1}. ${icon} *${item.name}* × ${item.qty} = ₹${itemTotal}\n`;
      });

      const message = 
`👑 *NEW ORDER - RAJ RASOI (King of Hotel & Restaurant)*
📍 *Location:* Grand Trunk Road (NH-19), Chandauli

*Order Type:* ${typeLabel}
${specificDetail ? `*Details/Location:* ${specificDetail}\n` : ''}
──────────────
*Order Items:*
${itemsText}──────────────
💰 *Estimated Total:* ₹${totalAmount}
⏱️ *Requested Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

_Please confirm my order and inform estimated preparation time. Thank you!_`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${RAJ_RASOI_PHONE}?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  /* ==========================================================================
     4. MENU CATEGORY TABS & DIET FILTERS
     ========================================================================== */
  const catTabBtns = document.querySelectorAll('.cat-tab-btn');
  const dietBtns = document.querySelectorAll('.diet-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  const menuSearchInput = document.getElementById('menuSearchInput');

  let activeCategory = 'all';
  let activeDiet = 'all'; // 'all', 'veg', 'nonveg'
  let searchQuery = '';

  function filterMenu() {
    menuCards.forEach(card => {
      const cardCat = card.dataset.category || '';
      const cardDiet = card.dataset.diet || '';
      const title = (card.querySelector('.item-title')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.item-desc')?.textContent || '').toLowerCase();

      const matchCat = (activeCategory === 'all') || (cardCat === activeCategory);
      const matchDiet = (activeDiet === 'all') || (cardDiet === activeDiet);
      const matchSearch = (!searchQuery) || (title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchCat && matchDiet && matchSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  catTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterMenu();
    });
  });

  dietBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedDiet = btn.dataset.diet;
      if (activeDiet === selectedDiet) {
        // Toggle off
        activeDiet = 'all';
        btn.classList.remove('active-veg', 'active-nonveg');
      } else {
        dietBtns.forEach(b => b.classList.remove('active-veg', 'active-nonveg'));
        activeDiet = selectedDiet;
        if (selectedDiet === 'veg') btn.classList.add('active-veg');
        if (selectedDiet === 'nonveg') btn.classList.add('active-nonveg');
      }
      filterMenu();
    });
  });

  if (menuSearchInput) {
    menuSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterMenu();
    });
  }

  /* ==========================================================================
     5. BANQUET & WEDDING INQUIRY FORM -> WHATSAPP
     ========================================================================== */
  const banquetInquiryForm = document.getElementById('banquetInquiryForm');
  if (banquetInquiryForm) {
    banquetInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('banquetName')?.value.trim() || 'Guest';
      const phone = document.getElementById('banquetPhone')?.value.trim() || '';
      const eventType = document.getElementById('banquetEventType')?.value || 'Wedding / Reception';
      const date = document.getElementById('banquetDate')?.value || 'Upcoming';
      const guests = document.getElementById('banquetGuests')?.value || '100-300';
      const notes = document.getElementById('banquetNotes')?.value.trim() || 'None';

      const msg = 
`👑 *BANQUET & PARTY LAWN INQUIRY - RAJ RASOI*
📍 Grand Trunk Road (NH-19), Chandauli

*Host Name:* ${name}
*Contact Number:* ${phone}
*Event Type:* ${eventType}
*Preferred Date:* ${date}
*Expected Guests:* ${guests}
*Special Requirements:* ${notes}

_Hello Raj Rasoi Team, please share the banquet packages, menu options, and availability for this date._`;

      window.open(`https://wa.me/${RAJ_RASOI_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
      showToast('Redirecting to WhatsApp with your inquiry!');
    });
  }

  /* ==========================================================================
     6. HOTEL ROOM BOOKING INQUIRY -> WHATSAPP
     ========================================================================== */
  window.bookRoomWhatsApp = function(roomType, price) {
    const msg = 
`🏨 *HOTEL ROOM BOOKING INQUIRY - RAJ RASOI*
📍 Grand Trunk Road (NH-19), Chandauli

*Room Category:* ${roomType}
*Tariff:* ${price}
*Date:* ${new Date().toLocaleDateString()}

_Hello Raj Rasoi Hotel, I would like to check availability and book a room for my highway travel stay. Please confirm._`;

    window.open(`https://wa.me/${RAJ_RASOI_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ==========================================================================
     7. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  function openMobileNav() {
    if (mobileNavMenu) mobileNavMenu.classList.add('open');
    if (mobileNavOverlay) mobileNavOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNavMenu) mobileNavMenu.classList.remove('open');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileNavToggle) mobileNavToggle.addEventListener('click', openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ==========================================================================
     8. LIGHTBOX PREVIEW
     ========================================================================== */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.zoomable-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      if (lightboxModal) lightboxModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Initial cart UI render
  updateCartUI();
});
