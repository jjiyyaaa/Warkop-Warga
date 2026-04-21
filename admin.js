function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function init() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  loadOrders();
  setInterval(loadOrders, 3000);
}

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]').reverse();
  
  const activeOrders = orders.filter(o => o.status !== 'completed');
  const unpaidCount = orders.filter(o => o.status === 'unpaid').length;
  
  const todayRevenue = orders
    .filter(o => o.status !== 'unpaid' && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total, 0);
    
  document.getElementById('stat-unpaid').innerText = unpaidCount;
  document.getElementById('stat-revenue').innerText = `Rp ${formatRupiah(todayRevenue)}`;
  
  renderOrderList('active-orders-list', activeOrders);
  renderOrderList('history-orders-list', orders);
}

function renderOrderList(containerId, ordersList) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if(ordersList.length === 0) {
    container.innerHTML = `<div class="card p-12 text-center text-gray-400">Belum ada data</div>`;
    return;
  }
  
  ordersList.forEach(order => {
    let statusHTML = '';
    if (order.status === 'unpaid') statusHTML = `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">Belum Bayar</span>`;
    else if (order.status === 'paid') statusHTML = `<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">Diproses</span>`;
    else statusHTML = `<span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">${order.status.toUpperCase()}</span>`;
    
    let btnHTML = '';
    if (order.status === 'unpaid') {
      btnHTML = `<button onclick="updateStatus('${order.id}', 'paid')" class="btn btn-primary w-full mt-4 border-0">Terima Pembayaran</button>`;
    } else if (order.status === 'paid') {
      btnHTML = `<button onclick="updateStatus('${order.id}', 'completed')" class="btn btn-outline border-blue-500 text-blue-600 w-full mt-4">Tandai Selesai</button>`;
    }
    
    let itemsHTML = order.items.map(i => `<div class="flex justify-between text-sm mb-1"><span>${i.quantity}x ${i.name}</span><span class="font-medium">Rp ${formatRupiah(i.price*i.quantity)}</span></div>`).join('');
    
    container.innerHTML += `
      <div class="card p-4 relative overflow-hidden">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-lg">Order #${order.id}</h3>
          ${statusHTML}
        </div>
        <div class="text-xs text-gray-500 flex gap-2 mb-4 font-semibold">
          <span>MEJA ${order.tableNumber.toUpperCase()}</span> &bull; 
          <span>${order.paymentMethod.toUpperCase()}</span> &bull; 
          <span>${formatDate(order.createdAt)}</span>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg mb-2">
           ${itemsHTML}
           <hr class="my-2 border-gray-200">
           <div class="flex justify-between font-bold text-lg"><span>Total</span><span class="text-primary">Rp ${formatRupiah(order.total)}</span></div>
        </div>
        ${btnHTML}
      </div>
    `;
  });
}

function updateStatus(id, newStatus) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
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
