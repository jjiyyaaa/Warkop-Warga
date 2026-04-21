const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table');

let cart = [];
let currentOrder = null;
let currentFilter = 'all';

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function init() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  if (!tableNumber) {
    showScreen('error');
    return;
  }
  
  document.getElementById('header-table-number').innerText = `Meja ${tableNumber.toUpperCase()}`;
  document.getElementById('checkout-table-number').innerText = `Meja ${tableNumber.toUpperCase()}`;
  
  cart = [];
  updateCartUI();
  showScreen('menu');
  setFilter('all');
}

function showScreen(screenId) {
  const isCartOpen = !document.getElementById('cart-drawer').classList.contains('translate-x-full');
  if(isCartOpen) toggleCartDrawer(); // Close it before navigating
  
  ['error', 'menu', 'checkout', 'waiting', 'countdown'].forEach(id => {
    document.getElementById(`screen-${id}`).classList.add('hidden');
  });
  document.getElementById(`screen-${screenId}`).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setFilter(category) {
  currentFilter = category;
  
  const titleEl = document.getElementById('menu-section-title');
  if(category === 'all') titleEl.innerHTML = `<i data-lucide="coffee"></i> Semua Menu`;
  else if(category === 'minuman') titleEl.innerHTML = `<i data-lucide="coffee"></i> Minuman`;
  else titleEl.innerHTML = `<i data-lucide="utensils-crossed"></i> Makanan`;

  ['all', 'minuman', 'makanan'].forEach(cat => {
    const btn = document.getElementById(`btn-filter-${cat}`);
    if (cat === category) {
      btn.className = "flex-shrink-0 px-5 py-2 rounded-full text-sm transition font-bold bg-primary text-white border-primary border flex items-center gap-2";
    } else {
      btn.className = "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition";
    }
  });
  
  renderMenu();
}

function addToCart(id) {
  const item = menuItems.find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });
  updateCartUI();
  renderMenu();
}

function updateQuantity(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(c => c.id !== id);
  updateCartUI();
  renderMenu();
}

function removeCartItem(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
  renderMenu();
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  
  if (drawer.classList.contains('translate-x-full')) {
    // Open
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    // slight delay for opacity transition
    setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
  } else {
    // Close
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('drawer-items');
  const totalContainer = document.getElementById('drawer-total');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  let totalPrice = 0;
  
  if (totalItems > 0) {
    badge.innerText = totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  
  itemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    itemsContainer.innerHTML = `<div class="text-center text-gray-400 mt-20"><i data-lucide="shopping-cart" class="w-12 h-12 mx-auto mb-3 opacity-50"></i><p>Keranjang masih kosong</p></div>`;
  } else {
    cart.forEach(item => {
      const sum = item.price * item.quantity;
      totalPrice += sum;
      itemsContainer.innerHTML += `
        <div class="border border-gray-100 rounded-xl p-4 relative bg-white shadow-sm">
          <button onclick="removeCartItem(${item.id})" class="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          <p class="font-bold text-gray-800 pr-6">${item.name}</p>
          <p class="text-primary font-medium text-sm mb-3">Rp ${formatRupiah(item.price)}</p>
          <div class="flex items-center justify-between">
             <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
               <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="minus" class="w-3 h-3"></i></button>
               <span class="w-8 text-center font-bold text-sm leading-8 bg-white border-x border-gray-200">${item.quantity}</span>
               <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="plus" class="w-3 h-3"></i></button>
             </div>
             <p class="font-bold text-gray-800">Rp ${formatRupiah(sum)}</p>
          </div>
        </div>
      `;
    });
  }
  
  totalContainer.innerText = `Rp ${formatRupiah(totalPrice)}`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMenu() {
  const container = document.getElementById('menu-items-container');
  container.innerHTML = '';
  
  const items = currentFilter === 'all' ? menuItems : menuItems.filter(i => i.category === currentFilter);
  
  items.forEach(item => {
    const cartItem = cart.find(c => c.id === item.id);
    
    let actionHTML = `<button onclick="addToCart(${item.id})" class="bg-primary hover:bg-[#6c856a] transition text-white w-full py-3 flex items-center justify-center gap-2 font-bold text-sm"><i data-lucide="plus" class="w-4 h-4"></i> Tambah</button>`;
    
    if (cartItem) {
      actionHTML = `
        <div class="w-full bg-white border-t border-gray-100 pb-3 pt-3 flex items-center justify-center">
            <div class="flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-50 shadow-sm">
              <button onclick="updateQuantity(${item.id}, -1)" class="w-10 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="minus" class="w-4 h-4"></i></button>
              <span class="w-10 text-center font-bold text-gray-800 bg-white border-x border-gray-200 leading-8">${cartItem.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)" class="w-10 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="plus" class="w-4 h-4"></i></button>
            </div>
        </div>
      `;
    }
    
    container.innerHTML += `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
        <div class="p-5 flex-1">
           <div class="flex justify-between items-start mb-1">
             <h3 class="font-bold text-gray-800 text-base leading-tight">${item.name}</h3>
             ${item.popular ? '<span class="bg-[#F0DEB4] text-[#8C6D46] text-xs font-bold px-2 py-0.5 rounded-full ml-2">Populer</span>' : ''}
           </div>
           <p class="text-primary font-bold text-sm mt-1">Rp ${formatRupiah(item.price)}</p>
        </div>
        ${actionHTML}
      </div>
    `;
  });
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function goToCheckout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }
  
  const container = document.getElementById('checkout-items');
  container.innerHTML = '';
  
  let total = 0;
  cart.forEach(item => {
    const sum = item.price * item.quantity;
    total += sum;
    container.innerHTML += `
      <div class="flex justify-between items-start text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
         <div>
            <p class="font-bold text-gray-800">${item.name}</p>
            <p class="text-xs text-gray-400 mt-0.5 tracking-wide">${item.quantity} x Rp ${formatRupiah(item.price)}</p>
         </div>
         <p class="font-medium text-gray-800">Rp ${formatRupiah(sum)}</p>
      </div>
    `;
  });
  
  document.getElementById('checkout-total').innerText = `Rp ${formatRupiah(total)}`;
  document.getElementById('checkout-final-total').innerText = `Rp ${formatRupiah(total)}`;
  
  showScreen('checkout');
}

function processCheckout() {
  const paymentInput = document.querySelector('input[name="payment"]:checked');
  if (!paymentInput) return alert("Pilih metode pembayaran terlebih dahulu!");
  
  const method = paymentInput.value;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderId = String(orders.length + 1);
  
  currentOrder = {
    id: orderId,
    tableNumber,
    items: cart,
    total,
    status: 'unpaid',
    createdAt: new Date().toISOString(),
    paymentMethod: method
  };
  
  orders.push(currentOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  document.getElementById('waiting-total').innerText = `Rp ${formatRupiah(total)}`;
  document.getElementById('waiting-order-id').innerText = orderId; // Show flat ID since UI shows "ORDER NO"
  
  showScreen('waiting');
  pollOrderStatus();
}

function pollOrderStatus() {
  const interval = setInterval(() => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const latest = orders.find(o => o.id === currentOrder.id);
    
    if (latest && latest.status !== 'unpaid') {
      clearInterval(interval);
      document.getElementById('success-order-id').innerText = currentOrder.id;
      showScreen('countdown'); // using your success/no-countdown box
    }
  }, 2000);
}

window.addEventListener('DOMContentLoaded', init);
