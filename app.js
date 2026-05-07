const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table');

let cart = [];
let currentOrder = null;
let currentFilter = 'all';

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
  currentOrder = null;
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

function updateNote(id, note) {
  const item = cart.find(c => c.id === id);
  if (item) item.notes = note;
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
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
  } else {
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
          <div class="flex items-center justify-between mb-3">
             <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
               <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="minus" class="w-3 h-3"></i></button>
               <span class="w-8 text-center font-bold text-sm leading-8 bg-white border-x border-gray-200">${item.quantity}</span>
               <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"><i data-lucide="plus" class="w-3 h-3"></i></button>
             </div>
             <p class="font-bold text-gray-800">Rp ${formatRupiah(sum)}</p>
          </div>
          <input type="text" placeholder="Catatan: es dipisah, dll (opsional)" class="w-full text-xs px-3 py-2 border border-gray-200 rounded bg-gray-50 outline-primary text-gray-600" value="${item.notes || ''}" onchange="updateNote(${item.id}, this.value)">
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
            ${item.notes ? `<p class="text-xs text-gray-500 italic mt-1 font-medium"><i data-lucide="info" class="w-3 h-3 inline"></i> Catatan: ${item.notes}</p>` : ''}
         </div>
         <p class="font-medium text-gray-800">Rp ${formatRupiah(sum)}</p>
      </div>
    `;
  });
  
  document.getElementById('checkout-total').innerText = `Rp ${formatRupiah(total)}`;
  document.getElementById('checkout-final-total').innerText = `Rp ${formatRupiah(total)}`;
  
  showScreen('checkout');
}

async function processCheckout() {
  const paymentInput = document.querySelector('input[name="payment"]:checked');
  if (!paymentInput) return alert("Pilih metode pembayaran terlebih dahulu!");
  
  const method = paymentInput.value;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const payload = {
    tableNumber,
    items: cart,
    total,
    paymentMethod: method
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const orderData = await response.json();
    currentOrder = orderData;
    
    document.getElementById('waiting-order-id').innerText = orderData.id;
    
    if (method === 'qris') {
      document.getElementById('waiting-cash-view').classList.add('hidden');
      document.getElementById('waiting-qris-view').classList.remove('hidden');
      document.getElementById('waiting-title').innerText = "Selesaikan Pembayaran QRIS";
      document.getElementById('waiting-total-qris').innerText = `Rp ${formatRupiah(total)}`;
      
      // Render dummy QRIS
      new QRious({
        element: document.getElementById('qr-qris-payment'),
        value: `QRIS-PAYMENT-MOCK-${orderData.id}`,
        size: 200,
        level: 'H'
      });
    } else {
      document.getElementById('waiting-qris-view').classList.add('hidden');
      document.getElementById('waiting-cash-view').classList.remove('hidden');
      document.getElementById('waiting-title').innerText = "Tunggu Konfirmasi Kasir";
      document.getElementById('waiting-total-cash').innerText = `Rp ${formatRupiah(total)}`;
    }
    
    showScreen('waiting');
    pollOrderStatus();
  } catch(e) {
    console.error("Failed to checkout:", e);
    alert("Terjadi kesalahan sistem.");
  }
}

function pollOrderStatus() {
  const interval = setInterval(async () => {
    if (!currentOrder) {
       clearInterval(interval);
       return;
    }
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      const latest = orders.find(o => o.id === currentOrder.id);
      
      if (latest && latest.status !== 'unpaid') {
        clearInterval(interval);
        currentOrder = latest; // sync
        showSuccessReceipt();
      }
    } catch(e) {
      console.error("Polling error", e);
    }
  }, 2000);
}

function showSuccessReceipt() {
  // Update Success UI Elements
  document.getElementById('receipt-order-id').innerText = currentOrder.id;
  document.getElementById('receipt-date').innerText = formatDate(currentOrder.createdAt);
  
  const receiptItems = document.getElementById('receipt-items');
  receiptItems.innerHTML = currentOrder.items.map(item => `
    <div class="flex justify-between">
      <div class="flex-1 pr-2">
         <span class="block">${item.name}</span>
         ${item.notes ? `<span class="block text-[10px] italic text-gray-500 border-l border-gray-300 pl-1 mt-0.5 ml-1">*Note: ${item.notes}</span>` : ''}
         <span class="text-gray-400 mt-0.5 block">${item.quantity} x ${formatRupiah(item.price)}</span>
      </div>
      <div class="font-bold whitespace-nowrap">
         ${formatRupiah(item.price * item.quantity)}
      </div>
    </div>
  `).join('');
  
  document.getElementById('receipt-total').innerText = `Rp ${formatRupiah(currentOrder.total)}`;
  document.getElementById('receipt-method').innerText = currentOrder.paymentMethod === 'cash' ? 'Tunai' : 'QRIS';
  
  // Reset print button
  const printBtn = document.getElementById('btn-request-print');
  printBtn.disabled = false;
  printBtn.innerHTML = `<i data-lucide="printer" class="w-4 h-4"></i> Minta Nota Fisik ke Meja`;
  printBtn.classList.replace('bg-green-600', 'bg-gray-800');
  
  showScreen('countdown');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function requestPhysicalReceipt() {
  if (!currentOrder) return;
  try {
    const btn = document.getElementById('btn-request-print');
    btn.disabled = true;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memproses...`;
    
    await fetch(`/api/orders/${currentOrder.id}/print`, { method: 'POST' });
    
    btn.classList.replace('bg-gray-800', 'bg-green-600');
    btn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Kasir Sedang Mencetak`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
  } catch(e) {
    console.error("Print request failed", e);
    alert("Gagal meminta struk fisik. Coba lagi.");
    document.getElementById('btn-request-print').disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', init);
