function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

let knownOrdersCount = 0;
let audioEnabled = false;

function enableAudio() {
  audioEnabled = true;
  const btn = document.getElementById('btn-audio');
  btn.classList.remove('bg-amber-500', 'hover:bg-amber-600', 'animate-pulse');
  btn.classList.add('bg-white/20', 'hover:bg-white/30');
  btn.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4 md:mr-2"></i> <span class="hidden md:inline">Suara Aktif</span>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  playBeep();
}

function playBeep() {
  if (!audioEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; 
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch(e) {}
}

function init() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  loadOrders();
  setInterval(loadOrders, 3000);
}

async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    const ordersList = await res.json();
    const orders = ordersList.reverse(); // Newest first
    
    // Audio Alert check
    if (orders.length > knownOrdersCount) {
       if (knownOrdersCount !== 0) playBeep(); // Don't beep on first load
       knownOrdersCount = orders.length;
    }
    
    const activeOrders = orders.filter(o => o.status !== 'completed' || o.printRequested);
    const unpaidCount = orders.filter(o => o.status === 'unpaid').length;
    
    const todayRevenue = orders
      .filter(o => o.status !== 'unpaid' && new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.total, 0);
      
    document.getElementById('stat-unpaid').innerText = unpaidCount;
    document.getElementById('stat-revenue').innerText = `Rp ${formatRupiah(todayRevenue)}`;
    
    renderOrderList('active-orders-list', activeOrders);
    renderHistoryList(orders);
  } catch(e) {
    console.error("Failed to load orders from backend:", e);
  }
}

function getOrderCardHTML(order) {
    let isUnpaid = order.status === 'unpaid';
    
    let statusHTML = '';
    if (isUnpaid) statusHTML = `<span class="${isUnpaid ? 'bg-red-600 animate-pulse' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full font-bold">Belum Bayar</span>`;
    else if (order.status === 'paid') statusHTML = `<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">Diproses</span>`;
    else statusHTML = `<span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">${order.status.toUpperCase()}</span>`;
    
    let btnHTML = '';
    if (isUnpaid) {
      if(order.paymentMethod === 'cash') {
         btnHTML = `<button onclick="updateStatus('${order.id}', 'paid')" class="btn bg-red-600 hover:bg-red-700 text-white w-full mt-4 font-bold shadow-md animate-bounce">Terima Pembayaran Tunai</button>`;
      } else {
         btnHTML = `<div class="text-center mt-4 p-2 bg-yellow-50 text-yellow-800 rounded font-bold text-xs border border-yellow-200">Menunggu Pelanggan Scan QRIS</div>`;
         btnHTML += `<button onclick="updateStatus('${order.id}', 'paid')" class="btn btn-outline border-red-200 text-red-500 w-full mt-2 text-xs">Bypass Pembayaran (Manual)</button>`;
      }
    } else if (order.status === 'paid') {
      btnHTML = `<button onclick="updateStatus('${order.id}', 'completed')" class="btn btn-outline border-blue-500 text-blue-600 w-full mt-4">Tandai Selesai</button>`;
    }
    
    let printAlertHTML = '';
    if (order.printRequested) {
       printAlertHTML = `
       <div class="bg-gray-800 text-white text-xs font-bold p-2 flex items-center justify-between gap-2 mb-3 rounded shadow-md border border-gray-600 animate-pulse">
         <div class="flex items-center gap-2"><i data-lucide="printer" class="w-4 h-4"></i> MINTA STRUK FISIK!</div>
         <button onclick="clearPrintAlert('${order.id}')" class="bg-white text-gray-800 px-2 py-1 rounded text-[10px] hover:bg-gray-200 uppercase">Telah Dicetak</button>
       </div>`;
    }
    
    let cardClasses = "card relative overflow-hidden transition-all duration-300 ";
    if (isUnpaid) cardClasses += "p-3 border-2 border-red-500 shadow-lg bg-red-50/20";
    else cardClasses += "p-4 border border-gray-200";

    let itemsHTML = order.items.map(i => `
      <div class="mb-2 last:mb-0">
        <div class="flex justify-between text-sm">
           <span class="font-semibold text-gray-800">${i.quantity}x ${i.name}</span>
           <span class="font-medium text-gray-600">Rp ${formatRupiah(i.price*i.quantity)}</span>
        </div>
        ${i.notes ? `<div class="text-[11px] text-amber-700 italic font-medium ml-4 mt-0.5 tracking-wide"><i data-lucide="message-square" class="w-3 h-3 inline"></i> ${i.notes}</div>` : ''}
      </div>
    `).join('');
    
    return `
      <div class="${cardClasses} mb-4">
        ${isUnpaid ? `<div class="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div><div class="mt-2"></div>` : ''}
        ${printAlertHTML}
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-lg text-gray-800">Order #${order.id}</h3>
          ${statusHTML}
        </div>
        <div class="text-xs text-gray-500 flex gap-2 mb-4 font-semibold uppercase">
          <span class="text-primary font-black">${order.tableNumber.toLowerCase() === 'takeaway' ? 'TAKEAWAY' : `MEJA ${order.tableNumber}`}</span> &bull; 
          <span class="${order.paymentMethod==='qris'?'text-blue-500':'text-green-600'}">${order.paymentMethod}</span> &bull; 
          <span>${formatDate(order.createdAt)}</span>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg mb-2 border border-gray-100">
           ${itemsHTML}
           <hr class="my-2 border-gray-200">
           <div class="flex justify-between font-bold text-lg text-gray-800"><span>Total</span><span class="text-primary">Rp ${formatRupiah(order.total)}</span></div>
        </div>
        ${btnHTML}
      </div>
    `;
}

function renderOrderList(containerId, ordersList) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if(ordersList.length === 0) {
    container.innerHTML = `<div class="card p-12 text-center text-gray-400">Belum ada pesanan aktif</div>`;
    return;
  }
  
  ordersList.forEach(order => {
    container.innerHTML += getOrderCardHTML(order);
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderHistoryList(ordersList) {
  const container = document.getElementById('history-orders-list');
  container.innerHTML = '';
  
  if(ordersList.length === 0) {
    container.innerHTML = `<div class="card p-12 text-center text-gray-400">Belum ada data riwayat</div>`;
    return;
  }

  // Group by date
  const groups = {};
  ordersList.forEach(order => {
    const d = new Date(order.createdAt);
    const dateKey = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[dateKey]) {
      groups[dateKey] = { date: dateKey, total: 0, items: [] };
    }
    groups[dateKey].items.push(order);
    if (order.status !== 'unpaid') {
      groups[dateKey].total += order.total;
    }
  });

  for (const dateKey in groups) {
    const group = groups[dateKey];
    
    container.innerHTML += `
      <div class="col-span-full mt-6 first:mt-0 mb-2 flex items-center justify-between border-b-2 border-gray-300 pb-2">
         <h3 class="font-bold text-gray-800 flex items-center gap-2"><i data-lucide="calendar" class="w-5 h-5 text-primary"></i> ${group.date}</h3>
         <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">Total Omzet: Rp ${formatRupiah(group.total)}</span>
      </div>
    `;
    
    group.items.forEach(order => {
      container.innerHTML += getOrderCardHTML(order);
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function updateStatus(id, newStatus) {
  try {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadOrders();
  } catch(e) {
    console.error("Failed to update status", e);
  }
}

async function clearPrintAlert(id) {
  try {
    await fetch(`/api/orders/${id}/clear-print`, { method: 'POST' });
    loadOrders();
  } catch(e) {
    console.error("Failed to clear print alert", e);
  }
}

function switchTab(tabId) {
  document.getElementById('view-active').classList.add('hidden');
  document.getElementById('view-history').classList.add('hidden');
  if (document.getElementById('view-qr')) document.getElementById('view-qr').classList.add('hidden');
  
  document.getElementById(`view-${tabId}`).classList.remove('hidden');
  
  if (tabId !== 'qr') {
    document.getElementById('tab-active').className = "pb-3 border-b-4 font-black text-lg px-2 border-primary text-primary transition";
    document.getElementById('tab-history').className = "pb-3 border-b-4 font-bold text-lg px-2 border-transparent text-gray-400 hover:text-gray-600 transition";
    
    // Switch the exact selected
    if (tabId === 'history') {
        document.getElementById('tab-active').className = "pb-3 border-b-4 font-bold text-lg px-2 border-transparent text-gray-400 hover:text-gray-600 transition";
        document.getElementById('tab-history').className = "pb-3 border-b-4 font-black text-lg px-2 border-primary text-primary transition";
    }
  } else {
    document.getElementById('tab-active').className = "pb-3 border-b-4 font-bold text-lg px-2 border-transparent text-gray-400 hover:text-gray-600 transition";
    document.getElementById('tab-history').className = "pb-3 border-b-4 font-bold text-lg px-2 border-transparent text-gray-400 hover:text-gray-600 transition";
  }
}

let qrRendered = false;
function renderQRList() {
  if(qrRendered) return;
  qrRendered = true;
  
  const container = document.getElementById('qr-list');
  container.innerHTML = '';
  const baseUrl = window.location.href.split('?')[0].replace('admin.html', 'index.html');
  
  new QRious({
     element: document.getElementById('qr-takeaway'),
     value: `${baseUrl}?table=takeaway`,
     size: 200,
     level: 'H'
  });

  for(let i=1; i<=10; i++) {
     container.innerHTML += `
       <div class="card p-4 text-center bg-gray-50 border border-gray-200">
         <h4 class="font-bold mb-2">Meja ${i}</h4>
         <div class="bg-white p-2 inline-block rounded-lg shadow-sm border mb-2"><canvas id="qr-meja-${i}"></canvas></div>
         <button onclick="downloadQR('meja-${i}', 'MEJA ${i}')" class="btn btn-outline text-xs w-full bg-white font-bold shadow-sm">Download</button>
       </div>
     `;
  }
  
  setTimeout(() => {
    for(let i=1; i<=10; i++) {
       new QRious({
          element: document.getElementById(`qr-meja-${i}`),
          value: `${baseUrl}?table=${i}`,
          size: 150,
          level: 'H'
       });
    }
  }, 100);
}

function downloadQR(id, title) {
  const canvas = document.getElementById(`qr-${id}`);
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = canvas.width;
  combinedCanvas.height = canvas.height + 50;
  const ctx = combinedCanvas.getContext('2d');
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, combinedCanvas.width / 2, canvas.height + 30);
  
  const link = document.createElement('a');
  link.download = `warkop-warga-qr-${id}.png`;
  link.href = combinedCanvas.toDataURL('image/png');
  link.click();
}

function addManualTable() {
  const input = document.getElementById('input-manual-table');
  const tableName = input.value.trim();
  if(!tableName) return alert('Masukkan nama meja terlebih dahulu!');
  
  // Convert spaces to dashes for ID parameter
  const tableId = tableName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const container = document.getElementById('qr-list');
  const wrapperId = `wrapper-manual-${tableId}`;
  
  if(document.getElementById(wrapperId)) return alert('Meja ini sudah dicetak/ada di layar!');
  
  container.innerHTML = `
     <div id="${wrapperId}" class="card p-4 text-center bg-green-50 border border-green-200">
       <h4 class="font-bold mb-2 uppercase text-gray-800">${tableName}</h4>
       <div class="bg-white p-2 inline-block rounded-lg shadow-sm border mb-2"><canvas id="qr-manual-${tableId}"></canvas></div>
       <button onclick="downloadQR('manual-${tableId}', '${tableName.toUpperCase()}')" class="btn btn-primary text-xs w-full font-bold shadow-sm">Download</button>
     </div>
  ` + container.innerHTML;
  const baseUrl = window.location.href.split('?')[0].replace('admin.html', 'index.html');

  setTimeout(() => {
    new QRious({
        element: document.getElementById(`qr-manual-${tableId}`),
        value: `${baseUrl}?table=${encodeURIComponent(tableId)}`,
        size: 150,
        level: 'H'
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, 100);
  
  input.value = '';
}

window.addEventListener('DOMContentLoaded', init);
