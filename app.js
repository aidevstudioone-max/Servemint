let globalMenuDatabase = [];
let globalActiveCart = [];
let activeUserSession = null;
let selectedStaffRecord = null;
let globalTables = [];
let activeDiscount = { type: 'none', value: 0 };

// ================= MOCK BACKEND (localStorage-based demo data layer) =================
// Everything below simulates the real Orderly API so every screen works with
// zero server — same function names/shapes the UI already expects.

const DEMO_USER = { username: 'admin', password: 'admin123', empCode: 'EMP0001', role: 'Admin' };

function demoTodayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function demoDaysOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function loadDB(key, fallback) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
function saveDB(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function mkSeedOrder(invoice, date, customer, mobile, email, method, cashier, items, discountVal, discountType) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  let discountAmount = 0;
  if (discountType === 'percent') discountAmount = subtotal * (discountVal / 100);
  else if (discountType === 'flat') discountAmount = discountVal;
  const discounted = subtotal - discountAmount;
  const tax = discounted * 0.05;
  const amount = parseFloat((discounted + tax).toFixed(2));
  return { invoice: invoice, date: date, customer: customer, customerMobile: mobile, customerEmail: email, amount: amount, discountAmount: parseFloat(discountAmount.toFixed(2)), method: method, cashier: cashier, items: items };
}

function seedMockDataIfEmpty() {
  if (localStorage.getItem('orderly_menu') !== null) return;

  const menu = [
    { id: 'MI0001', name: 'Paneer Tikka', category: 'Starters', fullPrice: 220, halfPrice: 130, status: 'Available', imgUrl: '' },
    { id: 'MI0002', name: 'Chicken 65', category: 'Starters', fullPrice: 260, halfPrice: 150, status: 'Available', imgUrl: '' },
    { id: 'MI0003', name: 'Butter Chicken', category: 'Main Course', fullPrice: 320, halfPrice: 190, status: 'Available', imgUrl: '' },
    { id: 'MI0004', name: 'Paneer Butter Masala', category: 'Main Course', fullPrice: 280, halfPrice: 160, status: 'Available', imgUrl: '' },
    { id: 'MI0005', name: 'Dal Makhani', category: 'Main Course', fullPrice: 210, halfPrice: 130, status: 'Available', imgUrl: '' },
    { id: 'MI0006', name: 'Tandoori Roti', category: 'Breads', fullPrice: 25, halfPrice: 0, status: 'Available', imgUrl: '' },
    { id: 'MI0007', name: 'Garlic Naan', category: 'Breads', fullPrice: 45, halfPrice: 0, status: 'Available', imgUrl: '' },
    { id: 'MI0008', name: 'Chicken Biryani', category: 'Rice & Biryani', fullPrice: 300, halfPrice: 180, status: 'Available', imgUrl: '' },
    { id: 'MI0009', name: 'Veg Biryani', category: 'Rice & Biryani', fullPrice: 220, halfPrice: 140, status: 'Available', imgUrl: '' },
    { id: 'MI0010', name: 'Gulab Jamun', category: 'Desserts', fullPrice: 90, halfPrice: 0, status: 'Available', imgUrl: '' },
    { id: 'MI0011', name: 'Masala Chai', category: 'Beverages', fullPrice: 30, halfPrice: 0, status: 'Available', imgUrl: '' },
    { id: 'MI0012', name: 'Fresh Lime Soda', category: 'Beverages', fullPrice: 60, halfPrice: 0, status: 'Available', imgUrl: '' },
  ];
  saveDB('orderly_menu', menu);
  function item(name) { return menu.find(function (m) { return m.name === name; }); }

  saveDB('orderly_tables', [
    { id: 'T01', number: 1, name: 'Table 1', capacity: 2, status: 'Free' },
    { id: 'T02', number: 2, name: 'Table 2', capacity: 2, status: 'Occupied' },
    { id: 'T03', number: 3, name: 'Table 3', capacity: 4, status: 'Free' },
    { id: 'T04', number: 4, name: 'Table 4', capacity: 4, status: 'Free' },
    { id: 'T05', number: 5, name: 'Table 5', capacity: 4, status: 'Reserved' },
    { id: 'T06', number: 6, name: 'Table 6', capacity: 6, status: 'Free' },
    { id: 'T07', number: 7, name: 'Garden A', capacity: 6, status: 'Occupied' },
    { id: 'T08', number: 8, name: 'Garden B', capacity: 2, status: 'Free' },
  ]);

  saveDB('orderly_employees', [
    { code: 'EMP0001', name: 'Administrator', mobile: '9000000001', email: 'admin@orderly.local', aadhar: '', role: 'Admin', status: 'Active', imgUrl: '' },
    { code: 'EMP0002', name: 'Rahul Singh', mobile: '9000000002', email: 'rahul.singh@orderly.local', aadhar: '', role: 'Cashier', status: 'Active', imgUrl: '' },
  ]);

  const orders = [
    mkSeedOrder('INV-1001', demoTodayISO(), 'Walk-In', '', '', 'CASH', 'EMP0001', [
      { name: 'Butter Chicken', portion: 'Full', quantity: 1, unitPrice: item('Butter Chicken').fullPrice },
      { name: 'Garlic Naan', portion: 'Full', quantity: 2, unitPrice: item('Garlic Naan').fullPrice },
    ]),
    mkSeedOrder('INV-1002', demoTodayISO(), 'Ravi Kumar', '9876543210', 'ravi.kumar@example.com', 'UPI', 'EMP0002', [
      { name: 'Chicken Biryani', portion: 'Full', quantity: 2, unitPrice: item('Chicken Biryani').fullPrice },
      { name: 'Masala Chai', portion: 'Full', quantity: 2, unitPrice: item('Masala Chai').fullPrice },
    ], 10, 'percent'),
    mkSeedOrder('INV-1003', demoTodayISO(), 'Anita Verma', '9123456780', '', 'CARD', 'EMP0001', [
      { name: 'Paneer Tikka', portion: 'Full', quantity: 1, unitPrice: item('Paneer Tikka').fullPrice },
      { name: 'Dal Makhani', portion: 'Full', quantity: 1, unitPrice: item('Dal Makhani').fullPrice },
      { name: 'Tandoori Roti', portion: 'Full', quantity: 3, unitPrice: item('Tandoori Roti').fullPrice },
    ]),
    mkSeedOrder('INV-0998', demoDaysOffset(-1), 'Walk-In', '', '', 'CASH', 'EMP0002', [
      { name: 'Veg Biryani', portion: 'Full', quantity: 1, unitPrice: item('Veg Biryani').fullPrice },
      { name: 'Gulab Jamun', portion: 'Full', quantity: 2, unitPrice: item('Gulab Jamun').fullPrice },
    ]),
    mkSeedOrder('INV-0999', demoDaysOffset(-1), 'Sanjay Mehta', '9988776655', '', 'UPI', 'EMP0001', [
      { name: 'Chicken 65', portion: 'Full', quantity: 1, unitPrice: item('Chicken 65').fullPrice },
      { name: 'Fresh Lime Soda', portion: 'Full', quantity: 2, unitPrice: item('Fresh Lime Soda').fullPrice },
    ]),
    mkSeedOrder('INV-0994', demoDaysOffset(-2), 'Priya Nair', '9012345678', '', 'CARD', 'EMP0001', [
      { name: 'Butter Chicken', portion: 'Full', quantity: 2, unitPrice: item('Butter Chicken').fullPrice },
      { name: 'Garlic Naan', portion: 'Full', quantity: 4, unitPrice: item('Garlic Naan').fullPrice },
    ], 50, 'flat'),
    mkSeedOrder('INV-0995', demoDaysOffset(-2), 'Walk-In', '', '', 'CASH', 'EMP0002', [
      { name: 'Paneer Butter Masala', portion: 'Full', quantity: 1, unitPrice: item('Paneer Butter Masala').fullPrice },
      { name: 'Tandoori Roti', portion: 'Full', quantity: 2, unitPrice: item('Tandoori Roti').fullPrice },
    ]),
  ];
  saveDB('orderly_orders', orders);

  saveDB('orderly_inventory', menu.map(function (m, i) {
    const stockLevels = [40, 35, 18, 22, 30, 8, 6, 25, 20, 45, 60, 50];
    const thresholds = [15, 15, 10, 10, 12, 10, 10, 10, 10, 15, 20, 20];
    return { id: m.id, name: m.name, category: m.category, stock: stockLevels[i], threshold: thresholds[i], unit: 'pcs' };
  }));

  saveDB('orderly_reservations', [
    { id: 'RES001', customerName: 'Kavya Reddy', mobile: '9765432109', date: demoDaysOffset(1), time: '19:30', partySize: 4, tableId: 'T04', status: 'Confirmed', notes: 'Window seat if possible' },
    { id: 'RES002', customerName: 'Arjun Rao', mobile: '9654321098', date: demoDaysOffset(2), time: '20:00', partySize: 2, tableId: '', status: 'Confirmed', notes: '' },
    { id: 'RES003', customerName: 'Meera Iyer', mobile: '9543210987', date: demoTodayISO(), time: '21:00', partySize: 6, tableId: 'T06', status: 'Confirmed', notes: 'Birthday celebration' },
  ]);
}

function computeMetrics(orders) {
  const totalSales = orders.reduce(function (s, o) { return s + o.amount; }, 0);
  const totalBills = orders.length;
  const avgOrder = totalBills ? totalSales / totalBills : 0;
  const payments = { CASH: 0, UPI: 0, CARD: 0 };
  orders.forEach(function (o) { payments[o.method] = (payments[o.method] || 0) + o.amount; });
  return { totalSales: totalSales, totalBills: totalBills, avgOrder: avgOrder, payments: payments };
}

function mockApiRouter(method, path, body) {
  if (method === 'POST' && path === '/api/auth/login') {
    if (body.username === DEMO_USER.username && body.password === DEMO_USER.password) {
      return { success: true, username: DEMO_USER.username, token: 'demo-' + Date.now(), empCode: DEMO_USER.empCode, role: DEMO_USER.role };
    }
    return { success: false, message: 'Invalid Username or Password.' };
  }
  if (method === 'GET' && path === '/api/auth/verify') {
    const token = localStorage.getItem('sessionToken');
    if (!token) return { success: false };
    return { success: true, username: localStorage.getItem('sessionUser'), empCode: localStorage.getItem('sessionEmpCode'), role: localStorage.getItem('sessionRole') };
  }

  if (method === 'GET' && path === '/api/dashboard/metrics') {
    return computeMetrics(loadDB('orderly_orders', []).filter(function (o) { return o.date === demoTodayISO(); }));
  }

  if (method === 'GET' && path === '/api/menu') return loadDB('orderly_menu', []);
  if (method === 'POST' && path === '/api/menu') {
    const menu = loadDB('orderly_menu', []);
    const id = 'MI' + String(menu.length + 1).padStart(4, '0');
    menu.push(Object.assign({ id: id }, body));
    saveDB('orderly_menu', menu);
    return { success: true };
  }
  let m = path.match(/^\/api\/menu\/(.+)$/);
  if (method === 'DELETE' && m) {
    saveDB('orderly_menu', loadDB('orderly_menu', []).filter(function (row) { return row.id !== m[1]; }));
    return { success: true };
  }

  if (method === 'GET' && path === '/api/orders') {
    return loadDB('orderly_orders', []).slice().sort(function (a, b) { return a.invoice < b.invoice ? 1 : -1; });
  }
  if (method === 'POST' && path === '/api/orders') {
    const orders = loadDB('orderly_orders', []);
    const invoiceNumber = 'INV-' + (2000 + orders.length + Math.floor(Math.random() * 500));
    const order = {
      invoice: invoiceNumber, date: demoTodayISO(), customer: body.customerName || 'Walk-In Customer',
      customerMobile: body.customerMobile, customerEmail: body.customerEmail,
      amount: body.totalAmount, discountAmount: body.discountAmount, method: body.paymentMethod,
      cashier: localStorage.getItem('sessionEmpCode') || 'EMP0001', items: body.items
    };
    orders.push(order);
    saveDB('orderly_orders', orders);
    return { success: true, invoiceNumber: invoiceNumber, gstin: '27ORDLY0001Z1', date: order.date, totalAmount: body.totalAmount };
  }

  if (method === 'GET' && path === '/api/tables') return loadDB('orderly_tables', []);
  if (method === 'POST' && path === '/api/tables') {
    const tables = loadDB('orderly_tables', []);
    const num = tables.length + 1;
    tables.push({ id: 'T' + String(num).padStart(2, '0') + '-' + Date.now().toString().slice(-4), number: num, name: body.name, capacity: body.capacity, status: 'Free' });
    saveDB('orderly_tables', tables);
    return { success: true };
  }
  m = path.match(/^\/api\/tables\/(.+)\/status$/);
  if (method === 'PATCH' && m) {
    const tables = loadDB('orderly_tables', []);
    const t = tables.find(function (row) { return row.id === m[1]; });
    if (t) t.status = body.status;
    saveDB('orderly_tables', tables);
    return { success: true };
  }

  if (method === 'GET' && path === '/api/reservations') {
    return loadDB('orderly_reservations', []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  if (method === 'POST' && path === '/api/reservations') {
    const list = loadDB('orderly_reservations', []);
    list.push(Object.assign({ id: 'RES' + String(list.length + 1).padStart(3, '0') }, body));
    saveDB('orderly_reservations', list);
    return { success: true };
  }

  if (method === 'GET' && path === '/api/reports/daily') {
    const todays = loadDB('orderly_orders', []).filter(function (o) { return o.date === demoTodayISO(); });
    const metrics = computeMetrics(todays);
    const itemMap = {};
    todays.forEach(function (o) {
      (o.items || []).forEach(function (i) {
        if (!itemMap[i.name]) itemMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
        itemMap[i.name].qty += i.quantity;
        itemMap[i.name].revenue += i.quantity * i.unitPrice;
      });
    });
    const topItems = Object.values(itemMap).sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, 5);
    const totalDiscount = todays.reduce(function (s, o) { return s + (o.discountAmount || 0); }, 0);
    return { date: demoTodayISO(), totalSales: metrics.totalSales, totalOrders: metrics.totalBills, avgOrder: metrics.avgOrder, payments: metrics.payments, totalDiscount: totalDiscount, topItems: topItems };
  }
  if (method === 'POST' && path === '/api/reports/daily/email') {
    return { success: true };
  }

  if (method === 'GET' && path === '/api/inventory') return loadDB('orderly_inventory', []);
  m = path.match(/^\/api\/inventory\/(.+)$/);
  if (method === 'PATCH' && m) {
    const inv = loadDB('orderly_inventory', []);
    const row = inv.find(function (r) { return r.id === m[1]; });
    if (!row) return { success: false, message: 'Item not found in inventory.' };
    if (body.op === 'add') row.stock += body.qty;
    else if (body.op === 'subtract') row.stock = Math.max(0, row.stock - body.qty);
    else row.stock = body.qty;
    saveDB('orderly_inventory', inv);
    return { success: true };
  }

  if (method === 'GET' && path === '/api/employees') return loadDB('orderly_employees', []);
  if (method === 'POST' && path === '/api/employees') {
    const emps = loadDB('orderly_employees', []);
    const code = 'EMP' + String(emps.length + 1).padStart(4, '0');
    emps.push({ code: code, name: body.name, mobile: body.mobile, email: body.email, aadhar: body.aadhar, role: body.role, status: body.status, imgUrl: body.imgUrl });
    saveDB('orderly_employees', emps);
    return { success: true };
  }
  m = path.match(/^\/api\/employees\/([^\/]+)\/performance$/);
  if (method === 'GET' && m) {
    const empOrders = loadDB('orderly_orders', []).filter(function (o) { return o.cashier === m[1]; });
    const totalSales = empOrders.reduce(function (s, o) { return s + o.amount; }, 0);
    return { totalSales: totalSales, totalOrders: empOrders.length, peakHour: empOrders.length ? '7:00 PM – 9:00 PM' : 'No data yet' };
  }
  m = path.match(/^\/api\/employees\/([^\/]+)$/);
  if (method === 'DELETE' && m) {
    saveDB('orderly_employees', loadDB('orderly_employees', []).filter(function (e) { return e.code !== m[1]; }));
    return { success: true };
  }

  if (method === 'GET' && path === '/api/customers') {
    const orders = loadDB('orderly_orders', []);
    const seen = {};
    const list = [];
    orders.forEach(function (o) {
      if (!o.customerMobile || seen[o.customerMobile]) return;
      seen[o.customerMobile] = true;
      list.push({ id: 'CUST' + String(list.length + 1).padStart(3, '0'), name: o.customer, mobile: o.customerMobile, email: o.customerEmail || '—', dob: '—' });
    });
    return list;
  }

  return { success: false, message: 'Not found (demo).' };
}

// ─── API HELPER (simulated network call over the mock backend above) ──────
async function apiCall(method, path, body) {
  await new Promise(function (resolve) { setTimeout(resolve, 120 + Math.random() * 150); });
  return mockApiRouter(method, path, body);
}

// ─── INIT ─────────────────────────────────────────────────
window.onload = function() {
  seedMockDataIfEmpty();
  initClockEngine();
  evaluateStoredSession();
};

function initClockEngine() {
  setInterval(() => {
    const el = document.getElementById('elegantClock');
    if (el) el.innerText = "⏱️ " + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  }, 1000);
}

// ─── TOAST ────────────────────────────────────────────────
function showToast(message, type) {
  type = type || "info";
  const colors = { success: "background:#059669", error: "background:#dc2626", info: "background:#ea580c", warning: "background:#d97706" };
  const toast = document.createElement('div');
  toast.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;color:white;font-size:12px;font-weight:700;padding:12px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:320px;transition:opacity 0.3s;" + (colors[type] || colors.info);
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 350); }, 3500);
}

// ─── LOGIN ────────────────────────────────────────────────
function handleLoginKeyPress(event) {
  if (event.key === 'Enter') { event.preventDefault(); executeAuthentication(); }
}

function executeAuthentication() {
  var u = document.getElementById('userInput').value.trim();
  var p = document.getElementById('passwordInput').value.trim();
  if (!u || !p) { showToast("Please enter username and password.", "error"); return; }
  var btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.innerText = "Authenticating...";
  apiCall('POST', '/api/auth/login', { username: u, password: p })
    .then(function(response) {
      btn.disabled = false; btn.innerText = "Secure Login";
      if (response.success) {
        showToast("Welcome, " + response.username + "!", "success");
        activeUserSession = response;
        localStorage.setItem('sessionToken', response.token);
        localStorage.setItem('sessionUser', response.username);
        localStorage.setItem('sessionEmpCode', response.empCode);
        localStorage.setItem('sessionRole', response.role);
        establishAppState(response);
        navigateView('home');
      } else {
        var errEl = document.getElementById('authErrorMsg');
        errEl.innerText = response.message || "Invalid Username or Password.";
        errEl.classList.remove('hidden');
        showToast(response.message || "Login failed.", "error");
      }
    })
    .catch(function(error) {
      btn.disabled = false; btn.innerText = "Secure Login";
      showToast("Connection error: " + error.message, "error");
    });
}

function evaluateStoredSession() {
  if (localStorage.getItem('posDarkTheme') === 'ENABLED') toggleDarkTheme();
  var savedToken = localStorage.getItem('sessionToken');
  var savedView = localStorage.getItem('sessionActiveView') || 'home';
  if (savedToken) {
    apiCall('GET', '/api/auth/verify').then(function(res) {
      if (res && res.success) { establishAppState(res); navigateView(savedView); }
      else clearSessionData();
    }).catch(function() { clearSessionData(); });
  }
}

function establishAppState(userObj) {
  activeUserSession = userObj;
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');
  applyRoleVisibility(userObj.role);
  document.getElementById('headerUserName').innerText = userObj.username;
  document.getElementById('headerUserRole').innerText = userObj.role;
  syncDashboardMetrics();
  syncMenuCatalog();
  syncLedgerRegistry();
  syncCrmDatabase();
  syncStaffRoster();
  syncTableGrid();
  syncReservations();
}

function clearSessionData() {
  ['sessionUser','sessionEmpCode','sessionRole','sessionActiveView','sessionToken'].forEach(function(k) { localStorage.removeItem(k); });
  window.location.reload();
}

// ─── ROLE-BASED ACCESS ────────────────────────────────────
function applyRoleVisibility(role) {
  var adminOnly = ['nav-menu','nav-staff','nav-reports'];
  if (role !== 'Admin') {
    adminOnly.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  }
}

// ─── NAVIGATION ───────────────────────────────────────────
function navigateView(viewId) {
  var adminViews = ['menu','staff','reports'];
  if (adminViews.indexOf(viewId) !== -1 && activeUserSession && activeUserSession.role !== 'Admin') {
    showToast("Access restricted. Admin only.", "error"); return;
  }
  localStorage.setItem('sessionActiveView', viewId);
  document.querySelectorAll('.view-container').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('#top-navigation-row button').forEach(function(el) {
    el.style.background = "var(--nav-inactive-bg)"; el.style.color = "var(--nav-inactive-text)";
    el.classList.remove('bg-orange-600','text-white');
  });
  var activeTarget = document.getElementById('view-' + viewId);
  if (activeTarget) activeTarget.classList.add('active');
  var activeNav = document.getElementById('nav-' + viewId);
  if (activeNav) { activeNav.style.background = "#ea580c"; activeNav.style.color = "#ffffff"; }
  if (viewId === 'home') syncDashboardMetrics();
  if (viewId === 'tables') syncTableGrid();
  if (viewId === 'reservations') { syncReservations(); populateResTableDropdown(); }
  if (viewId === 'reports') syncDailyReport();
  if (viewId === 'inventory') syncInventory();
}

// ─── DARK THEME ───────────────────────────────────────────
function toggleDarkTheme() {
  document.body.classList.toggle('dark-theme');
  var isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('posDarkTheme', isDark ? 'ENABLED' : 'DISABLED');
  document.getElementById('themeIcon').className = isDark ? "fas fa-sun text-sm" : "fas fa-moon text-sm";
}

// ─── DASHBOARD ────────────────────────────────────────────
function syncDashboardMetrics() {
  apiCall('GET', '/api/dashboard/metrics').then(function(res) {
    document.getElementById('dashTotalSales').innerText = '₹' + res.totalSales.toFixed(2);
    document.getElementById('dashTotalBills').innerText = res.totalBills;
    document.getElementById('dashAvgValue').innerText = '₹' + res.avgOrder.toFixed(2);
    document.getElementById('breakdownCash').innerText = '₹' + res.payments.CASH.toFixed(2);
    document.getElementById('breakdownUpi').innerText = '₹' + res.payments.UPI.toFixed(2);
    document.getElementById('breakdownCard').innerText = '₹' + res.payments.CARD.toFixed(2);
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── MENU CATALOG ─────────────────────────────────────────
function syncMenuCatalog() {
  apiCall('GET', '/api/menu').then(function(data) {
    globalMenuDatabase = data;
    renderPosWorkspaceGrid();
    renderAdminMenuTable();
    buildCategoryTabs(data);
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function buildCategoryTabs(items) {
  var tabRow = document.getElementById('posCategoryTabs');
  var cats = ['All'];
  items.forEach(function(i) { if (cats.indexOf(i.category) === -1) cats.push(i.category); });
  tabRow.innerHTML = '';
  cats.forEach(function(cat) {
    tabRow.innerHTML += '<button onclick="renderPosWorkspaceGrid(\'' + cat + '\')" style="background:var(--border-color);color:var(--text-muted);" class="px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap hover:opacity-80">' + cat + '</button>';
  });
}

function renderPosWorkspaceGrid(filter) {
  filter = filter || 'All';
  var grid = document.getElementById('posMenuGrid');
  if (!grid) return;
  grid.innerHTML = '';
  var items = filter === 'All' ? globalMenuDatabase : globalMenuDatabase.filter(function(i) { return i.category === filter; });
  items.forEach(function(item) {
    if (item.status !== "Available") return;
    var img = item.imgUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop";
    var halfBtn = item.halfPrice > 0 ? '<button onclick="addToCart(\'' + item.id + '\',\'' + item.name.replace(/'/g,"\\'") + '\',\'Half\',' + item.halfPrice + ')" class="flex-1 font-bold py-1 rounded text-[10px] transition" style="background:var(--border-color);color:var(--text-main);">Half: ₹' + item.halfPrice + '</button>' : '';
    grid.innerHTML += '<div class="gourmet-panel rounded-xl p-3 shadow-sm flex flex-col justify-between space-y-2"><div class="flex items-center space-x-3"><img src="' + img + '" class="w-11 h-11 rounded-lg object-cover bg-slate-100"><div><h4 class="text-xs font-black">' + item.name + '</h4><p class="text-[10px] font-semibold text-orange-400 uppercase">' + item.category + '</p></div></div><div class="flex items-center gap-1.5 pt-1.5 border-t" style="border-color:var(--border-color);"><button onclick="addToCart(\'' + item.id + '\',\'' + item.name.replace(/'/g,"\\'") + '\',\'Full\',' + item.fullPrice + ')" class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 rounded text-[10px] transition">Full: ₹' + item.fullPrice + '</button>' + halfBtn + '</div></div>';
  });
}

// ─── CART ─────────────────────────────────────────────────
function addToCart(id, name, portion, price) {
  var existing = globalActiveCart.find(function(i) { return i.id === id && i.portion === portion; });
  if (existing) { existing.quantity++; } else { globalActiveCart.push({ id: id, name: name, portion: portion, unitPrice: price, quantity: 1 }); }
  updateCartDOM();
  showToast(name + ' (' + portion + ') added', "success");
}

function mutateCartQty(id, portion, delta) {
  var match = globalActiveCart.find(function(i) { return i.id === id && i.portion === portion; });
  if (match) {
    match.quantity += delta;
    if (match.quantity <= 0) globalActiveCart = globalActiveCart.filter(function(i) { return !(i.id === id && i.portion === portion); });
  }
  updateCartDOM();
}

function clearCart() {
  globalActiveCart = [];
  activeDiscount = { type: 'none', value: 0 };
  document.getElementById('discountType').value = 'none';
  document.getElementById('discountValue').value = '';
  document.getElementById('discountRow').classList.add('hidden');
  updateCartDOM();
}

function updateCartDOM() {
  var list = document.getElementById('cartRows');
  list.innerHTML = '';
  var subtotal = 0;
  globalActiveCart.forEach(function(item) {
    var lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    list.innerHTML += '<div class="flex items-center justify-between p-2 rounded-lg text-xs" style="background:var(--border-color);"><div class="flex-1 min-w-0 pr-2"><p class="font-bold truncate">' + item.name + '</p><p class="text-[10px] text-slate-400">' + item.portion + ' @ ₹' + item.unitPrice + '</p></div><div class="flex items-center space-x-2"><div class="flex items-center rounded border" style="border-color:var(--border-color);background:var(--input-bg);"><button onclick="mutateCartQty(\'' + item.id + '\',\'' + item.portion + '\',-1)" class="px-1.5 font-bold text-slate-400 hover:text-orange-600">-</button><span class="px-1 font-mono text-[10px] font-bold">' + item.quantity + '</span><button onclick="mutateCartQty(\'' + item.id + '\',\'' + item.portion + '\',1)" class="px-1.5 font-bold text-slate-400 hover:text-orange-600">+</button></div><span class="font-bold min-w-[45px] text-right">₹' + lineTotal.toFixed(2) + '</span></div></div>';
  });
  var discountAmount = 0;
  if (activeDiscount.type === 'percent') discountAmount = subtotal * (activeDiscount.value / 100);
  else if (activeDiscount.type === 'flat') discountAmount = Math.min(activeDiscount.value, subtotal);
  var discounted = subtotal - discountAmount;
  var tax = discounted * 0.05;
  var payable = discounted + tax;
  document.getElementById('lblSubtotal').innerText = '₹' + subtotal.toFixed(2);
  document.getElementById('lblDiscount').innerText = discountAmount > 0 ? '-₹' + discountAmount.toFixed(2) : '₹0.00';
  document.getElementById('lblTax').innerText = '₹' + tax.toFixed(2);
  document.getElementById('lblTotal').innerText = '₹' + payable.toFixed(2);
}

// ─── DISCOUNT ─────────────────────────────────────────────
function applyDiscount() {
  var type = document.getElementById('discountType').value;
  var val = parseFloat(document.getElementById('discountValue').value) || 0;
  if (type === 'none') { activeDiscount = { type: 'none', value: 0 }; }
  else if (type === 'percent' && val > 0 && val <= 100) { activeDiscount = { type: 'percent', value: val }; showToast(val + '% discount applied', "success"); }
  else if (type === 'flat' && val > 0) { activeDiscount = { type: 'flat', value: val }; showToast('₹' + val + ' flat discount applied', "success"); }
  else { showToast("Invalid discount value.", "error"); return; }
  updateCartDOM();
}

function toggleDiscountRow() {
  var sel = document.getElementById('discountType').value;
  document.getElementById('discountRow').classList.toggle('hidden', sel === 'none');
  if (sel === 'none') { activeDiscount = { type: 'none', value: 0 }; updateCartDOM(); }
}

// ─── CHECKOUT ─────────────────────────────────────────────
function commitActiveOrder() {
  if (globalActiveCart.length === 0) { showToast("Cart is empty.", "error"); return; }
  var tableId = document.getElementById('cartTableSelect') ? document.getElementById('cartTableSelect').value : '';
  var subtotal = globalActiveCart.reduce(function(s, i) { return s + i.quantity * i.unitPrice; }, 0);
  var discountAmount = 0;
  if (activeDiscount.type === 'percent') discountAmount = subtotal * (activeDiscount.value / 100);
  else if (activeDiscount.type === 'flat') discountAmount = Math.min(activeDiscount.value, subtotal);
  var discounted = subtotal - discountAmount;
  var tax = discounted * 0.05;
  var totalAmount = parseFloat((discounted + tax).toFixed(2));

  var orderPayload = {
    customerName: document.getElementById('cartCustName').value.trim(),
    customerMobile: document.getElementById('cartCustMobile').value.trim(),
    customerEmail: document.getElementById('cartCustEmail').value.trim(),
    customerDob: document.getElementById('cartCustDob').value.trim(),
    items: globalActiveCart,
    totalAmount: totalAmount,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    paymentMethod: document.getElementById('cartPaymentMethod').value,
    tableId: tableId
  };

  var btn = document.getElementById('checkoutBtn');
  btn.disabled = true; btn.innerText = "Processing...";

  apiCall('POST', '/api/orders', orderPayload).then(function(res) {
    btn.disabled = false; btn.innerText = "Checkout";
    if (res.success) {
      printKOT(orderPayload.items, res.invoiceNumber, tableId);
      showReceipt(res, orderPayload);
      if (tableId) updateTableStatus(tableId, 'Occupied');
      clearCart();
      syncLedgerRegistry(); syncCrmDatabase(); syncDashboardMetrics();
    } else { showToast("Checkout failed: " + res.error, "error"); }
  }).catch(function(err) {
    btn.disabled = false; btn.innerText = "Checkout";
    showToast("Checkout failed: " + err.message, "error");
  });
}

function showReceipt(res, orderPayload) {
  document.getElementById('recGstinLabel').innerText = 'GSTIN: ' + res.gstin;
  document.getElementById('recTimeLabel').innerText = 'Date: ' + res.date + ' ' + new Date().toLocaleTimeString('en-IN');
  document.getElementById('recInvoiceNum').innerText = res.invoiceNumber;
  document.getElementById('recCashierNum').innerText = activeUserSession ? activeUserSession.empCode : '';
  document.getElementById('recClientName').innerText = orderPayload.customerName || "Walk-In Customer";
  var itemsHtml = ''; var grossSum = 0;
  orderPayload.items.forEach(function(i) {
    var lineSum = i.quantity * i.unitPrice; grossSum += lineSum;
    itemsHtml += '<tr class="border-b border-slate-100"><td class="py-1">' + i.name + ' (' + i.portion + ')</td><td class="text-center py-1">' + i.quantity + '</td><td class="text-right py-1">₹' + lineSum.toFixed(2) + '</td></tr>';
  });
  document.getElementById('recItems').innerHTML = itemsHtml;
  document.getElementById('recSub').innerText = '₹' + grossSum.toFixed(2);
  document.getElementById('recDiscountLine').innerText = orderPayload.discountAmount > 0 ? '-₹' + orderPayload.discountAmount.toFixed(2) : '₹0.00';
  document.getElementById('recTax').innerText = '₹' + ((grossSum - orderPayload.discountAmount) * 0.05).toFixed(2);
  document.getElementById('recTotal').innerText = '₹' + res.totalAmount.toFixed(2);
  document.getElementById('receiptModal').style.display = "flex";
}

// ─── KOT ──────────────────────────────────────────────────
function printKOT(items, invoiceNumber, tableId) {
  var kotWindow = window.open('', '_blank', 'height=500,width=350');
  if (!kotWindow) { showToast('Kitchen ticket popup was blocked by the browser.', 'warning'); return; }
  var rows = items.map(function(i) { return '<tr><td style="padding:4px 0;font-size:13px;font-weight:bold;">' + i.name + ' (' + i.portion + ')</td><td style="text-align:right;padding:4px 0;font-size:14px;font-weight:900;">x' + i.quantity + '</td></tr>'; }).join('');
  kotWindow.document.write('<html><head><title>KOT</title><style>body{font-family:monospace;padding:20px;max-width:300px;}hr{border:1px dashed #000;}</style></head><body><div style="text-align:center;"><h2 style="margin:0;font-size:16px;">KITCHEN ORDER TICKET</h2><p style="margin:4px 0;font-size:11px;">Orderly</p><p style="margin:4px 0;font-size:11px;">' + new Date().toLocaleString('en-IN') + '</p></div><hr><p style="font-size:12px;"><b>Invoice:</b> ' + invoiceNumber + '</p>' + (tableId ? '<p style="font-size:12px;"><b>Table:</b> ' + tableId + '</p>' : '<p style="font-size:12px;">Walk-In / Takeaway</p>') + '<hr><table style="width:100%;border-collapse:collapse;">' + rows + '</table><hr><p style="text-align:center;font-size:10px;">-- KITCHEN COPY --</p></body></html>');
  kotWindow.document.close(); kotWindow.focus();
  setTimeout(function() { kotWindow.print(); kotWindow.close(); }, 400);
}

function printReceiptWindow() {
  var content = document.getElementById('receiptContent').innerHTML;
  var w = window.open('', '_blank', 'height=600,width=450');
  if (!w) { showToast('Print popup was blocked by the browser.', 'warning'); return; }
  w.document.write('<html><head><title>Receipt</title><style>body{font-family:monospace;padding:25px;font-size:11px;}table{width:100%;border-collapse:collapse;}th,td{padding:4px 0;}.text-right{text-align:right;}.text-center{text-align:center;}</style></head><body><div style="max-width:350px;margin:0 auto;">' + content + '</div></body></html>');
  w.document.close(); w.focus(); setTimeout(function() { w.print(); w.close(); }, 500);
}

function closeReceiptModal() { document.getElementById('receiptModal').style.display = "none"; }

// ─── TABLE MANAGEMENT ─────────────────────────────────────
function syncTableGrid() {
  apiCall('GET', '/api/tables').then(function(tables) {
    globalTables = tables || [];
    renderTableGrid(globalTables);
    populateTableDropdown(globalTables);
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function renderTableGrid(tables) {
  var grid = document.getElementById('tableGrid');
  if (!grid) return;
  if (!tables || tables.length === 0) { grid.innerHTML = '<p class="text-xs col-span-5 text-center py-8" style="color:var(--text-muted);">No tables added yet. Add your first table using the form.</p>'; return; }
  grid.innerHTML = '';
  tables.forEach(function(t) {
    var statusColor = t.status === 'Free' ? 'background:#10b981' : t.status === 'Occupied' ? 'background:#ef4444' : 'background:#f59e0b';
    var textColor = t.status === 'Free' ? 'color:#065f46' : t.status === 'Occupied' ? 'color:#7f1d1d' : 'color:#78350f';
    grid.innerHTML += '<div class="gourmet-panel rounded-xl p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow" onclick="openTableOptions(\'' + t.id + '\',\'' + t.status + '\')" style="border:2px solid ' + (t.status === 'Occupied' ? '#fca5a5' : 'var(--border-color)') + '"><div style="width:40px;height:40px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px;' + statusColor + '">' + t.number + '</div><p class="text-xs font-black">' + t.name + '</p><p class="text-[10px] font-bold mt-0.5" style="' + textColor + '">' + t.status + '</p><p class="text-[9px] mt-0.5" style="color:var(--text-muted);">' + t.capacity + ' seats</p></div>';
  });
}

function populateTableDropdown(tables) {
  var sel = document.getElementById('cartTableSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">No Table (Takeaway)</option>';
  (tables || []).forEach(function(t) { sel.innerHTML += '<option value="' + t.id + '">' + t.name + ' (' + t.status + ')</option>'; });
}

function openTableOptions(tableId, currentStatus) {
  var actions = '';
  if (currentStatus === 'Free') {
    actions = '<button onclick="updateTableStatus(\'' + tableId + '\',\'Occupied\');closeModal(\'tableModal\')" style="width:100%;background:#ef4444;color:white;font-weight:700;padding:8px;border-radius:8px;font-size:12px;margin-bottom:8px;border:none;cursor:pointer;">Mark Occupied</button><button onclick="updateTableStatus(\'' + tableId + '\',\'Reserved\');closeModal(\'tableModal\')" style="width:100%;background:#f59e0b;color:white;font-weight:700;padding:8px;border-radius:8px;font-size:12px;margin-bottom:8px;border:none;cursor:pointer;">Mark Reserved</button>';
  } else {
    actions = '<button onclick="updateTableStatus(\'' + tableId + '\',\'Free\');closeModal(\'tableModal\')" style="width:100%;background:#10b981;color:white;font-weight:700;padding:8px;border-radius:8px;font-size:12px;margin-bottom:8px;border:none;cursor:pointer;">Mark Free</button>';
  }
  document.getElementById('tableModalBody').innerHTML = '<p class="text-xs mb-3 font-semibold" style="color:var(--text-muted);">Table: ' + tableId + ' | Status: <b>' + currentStatus + '</b></p>' + actions + '<button onclick="closeModal(\'tableModal\')" style="width:100%;font-weight:700;padding:8px;border-radius:8px;font-size:12px;background:var(--border-color);color:var(--text-main);border:none;cursor:pointer;">Cancel</button>';
  document.getElementById('tableModal').style.display = 'flex';
}

function updateTableStatus(tableId, status) {
  apiCall('PATCH', '/api/tables/' + tableId + '/status', { status: status }).then(function() {
    syncTableGrid(); showToast('Table updated to ' + status, "success");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function addNewTable() {
  var name = document.getElementById('newTableName').value.trim();
  var cap = parseInt(document.getElementById('newTableCapacity').value) || 4;
  if (!name) { showToast("Enter a table name.", "error"); return; }
  apiCall('POST', '/api/tables', { name: name, capacity: cap }).then(function(res) {
    if (res.success) { showToast("Table added!", "success"); document.getElementById('newTableName').value = ''; syncTableGrid(); }
    else showToast(res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── RESERVATIONS ─────────────────────────────────────────
function syncReservations() {
  apiCall('GET', '/api/reservations').then(function(data) {
    var tbody = document.getElementById('reservationTbody');
    tbody.innerHTML = '';
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-xs" style="color:var(--text-muted);">No reservations found.</td></tr>'; return; }
    data.forEach(function(r) {
      var sc = r.status === 'Confirmed' ? 'background:#ecfdf5;color:#065f46' : r.status === 'Cancelled' ? 'background:#fff1f2;color:#9f1239' : 'background:#fffbeb;color:#78350f';
      tbody.innerHTML += '<tr><td class="p-2 font-mono text-[10px] text-orange-500">' + r.id + '</td><td class="p-2 font-bold text-xs">' + r.customerName + '</td><td class="p-2 font-mono text-xs">' + r.mobile + '</td><td class="p-2 text-xs">' + r.date + ' ' + r.time + '</td><td class="p-2 text-xs text-center">' + r.partySize + '</td><td class="p-2 text-xs">' + (r.tableId || '-') + '</td><td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold" style="' + sc + '">' + r.status + '</span></td></tr>';
    });
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function populateResTableDropdown() {
  var sel = document.getElementById('resTable');
  if (!sel) return;
  sel.innerHTML = '<option value="">Not Assigned</option>';
  globalTables.forEach(function(t) { sel.innerHTML += '<option value="' + t.id + '">' + t.name + '</option>'; });
}

function submitReservation() {
  var name = document.getElementById('resName').value.trim();
  var mobile = document.getElementById('resMobile').value.trim();
  var date = document.getElementById('resDate').value;
  var time = document.getElementById('resTime').value;
  var party = parseInt(document.getElementById('resParty').value) || 0;
  var tableId = document.getElementById('resTable').value;
  var notes = document.getElementById('resNotes').value.trim();
  if (!name || !mobile || !date || !time || party < 1) { showToast("Fill all required fields.", "error"); return; }
  apiCall('POST', '/api/reservations', { customerName: name, mobile: mobile, date: date, time: time, partySize: party, tableId: tableId, notes: notes, status: 'Confirmed' }).then(function(res) {
    if (res.success) { showToast("Reservation confirmed!", "success"); ['resName','resMobile','resDate','resTime','resParty','resNotes'].forEach(function(id) { document.getElementById(id).value = ''; }); syncReservations(); }
    else showToast(res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── DAILY REPORT ─────────────────────────────────────────
function syncDailyReport() {
  apiCall('GET', '/api/reports/daily').then(function(data) {
    if (!data) return;
    document.getElementById('rptDate').innerText = data.date;
    document.getElementById('rptTotalSales').innerText = '₹' + data.totalSales.toFixed(2);
    document.getElementById('rptTotalOrders').innerText = data.totalOrders;
    document.getElementById('rptAvgOrder').innerText = '₹' + data.avgOrder.toFixed(2);
    document.getElementById('rptCash').innerText = '₹' + data.payments.CASH.toFixed(2);
    document.getElementById('rptUpi').innerText = '₹' + data.payments.UPI.toFixed(2);
    document.getElementById('rptCard').innerText = '₹' + data.payments.CARD.toFixed(2);
    document.getElementById('rptDiscount').innerText = '₹' + (data.totalDiscount || 0).toFixed(2);
    var tbody = document.getElementById('rptTopItems');
    tbody.innerHTML = '';
    if (data.topItems && data.topItems.length > 0) {
      data.topItems.forEach(function(item, idx) {
        tbody.innerHTML += '<tr class="border-b" style="border-color:var(--border-color);"><td class="py-1.5 px-2 font-bold text-xs">#' + (idx+1) + '</td><td class="py-1.5 px-2 text-xs">' + item.name + '</td><td class="py-1.5 px-2 text-xs text-center font-mono">' + item.qty + '</td><td class="py-1.5 px-2 text-xs text-right font-mono">₹' + item.revenue.toFixed(2) + '</td></tr>';
      });
    } else { tbody.innerHTML = '<tr><td colspan="4" class="py-3 text-center text-xs" style="color:var(--text-muted);">No sales data for today.</td></tr>'; }
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function emailDailyReport() {
  var email = document.getElementById('rptEmailInput').value.trim();
  if (!email || email.indexOf('@') === -1) { showToast("Enter a valid email.", "error"); return; }
  apiCall('POST', '/api/reports/daily/email', { email: email }).then(function(res) {
    if (res.success) showToast("Report emailed to " + email + " (demo — not actually sent)", "success");
    else showToast("Failed: " + res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── INVENTORY ────────────────────────────────────────────
function syncInventory() {
  apiCall('GET', '/api/inventory').then(function(data) {
    var tbody = document.getElementById('inventoryTbody');
    tbody.innerHTML = '';
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-xs" style="color:var(--text-muted);">No inventory data. Add stock for menu items using the form.</td></tr>'; return; }
    data.forEach(function(item) {
      var low = item.stock <= item.threshold;
      tbody.innerHTML += '<tr><td class="p-2 text-xs font-bold">' + item.name + '</td><td class="p-2 text-xs">' + item.category + '</td><td class="p-2 text-xs font-mono text-center' + (low ? ' text-rose-600 font-black' : '') + '">' + item.stock + ' ' + item.unit + '</td><td class="p-2 text-xs text-center font-mono">' + item.threshold + ' ' + item.unit + '</td><td class="p-2 text-xs">' + (low ? '<span style="padding:2px 6px;border-radius:4px;background:#fee2e2;color:#991b1b;font-weight:700;font-size:10px;">⚠ Low Stock</span>' : '<span style="padding:2px 6px;border-radius:4px;background:#d1fae5;color:#065f46;font-weight:700;font-size:10px;">OK</span>') + '</td></tr>';
    });
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function updateStock() {
  var itemId = document.getElementById('stockItemId').value.trim();
  var qty = parseInt(document.getElementById('stockQty').value) || 0;
  var op = document.getElementById('stockOp').value;
  if (!itemId || qty <= 0) { showToast("Enter item ID and quantity.", "error"); return; }
  apiCall('PATCH', '/api/inventory/' + itemId, { qty: qty, op: op }).then(function(res) {
    if (res.success) { showToast("Stock updated!", "success"); syncInventory(); }
    else showToast(res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── ADMIN: MENU ──────────────────────────────────────────
function validateAndCommitMenu() {
  var name = document.getElementById('mItemName');
  var fPrice = document.getElementById('mItemFullPrice');
  var hPrice = document.getElementById('mItemHalfPrice');
  var hasErr = false;
  [name, fPrice, hPrice].forEach(function(el) { el.classList.remove('input-field-error'); el.nextElementSibling.classList.add('hidden'); });
  if (!name.value.trim()) { name.classList.add('input-field-error'); name.nextElementSibling.classList.remove('hidden'); hasErr = true; }
  if (!fPrice.value.trim()) { fPrice.classList.add('input-field-error'); fPrice.nextElementSibling.classList.remove('hidden'); hasErr = true; }
  if (!hPrice.value.trim()) { hPrice.classList.add('input-field-error'); hPrice.nextElementSibling.classList.remove('hidden'); hasErr = true; }
  if (hasErr) return;
  var payload = { name: name.value.trim(), category: document.getElementById('mItemCategory').value, fullPrice: parseFloat(fPrice.value), halfPrice: parseFloat(hPrice.value), status: document.getElementById('mItemStatus').value, imgUrl: document.getElementById('mItemImg').value.trim() };
  apiCall('POST', '/api/menu', payload).then(function(res) {
    if (res.success) { showToast("Menu item added!", "success"); name.value = ''; fPrice.value = ''; hPrice.value = '0'; document.getElementById('mItemImg').value = ''; syncMenuCatalog(); }
    else showToast(res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function renderAdminMenuTable() {
  var tbody = document.getElementById('menuAdminTbody');
  tbody.innerHTML = '';
  globalMenuDatabase.forEach(function(row) {
    var sc = row.status === 'Available' ? 'background:#ecfdf5;color:#065f46' : 'background:#fff1f2;color:#9f1239';
    tbody.innerHTML += '<tr><td class="py-2 font-bold text-xs">' + row.name + '<span class="text-[9px] font-mono block" style="color:var(--text-muted);">' + row.id + '</span></td><td class="py-2 text-xs">' + row.category + '</td><td class="py-2 font-mono text-xs">₹' + row.fullPrice + '</td><td class="py-2 font-mono text-xs">₹' + row.halfPrice + '</td><td class="py-2"><span class="text-[10px] px-1.5 py-0.5 rounded" style="' + sc + '">' + row.status + '</span></td><td class="py-2 text-right"><button onclick="executeMenuDeletion(\'' + row.id + '\')" class="text-rose-500 font-bold text-xs"><i class="fas fa-trash-alt"></i></button></td></tr>';
  });
}

function executeMenuDeletion(id) {
  if (confirm("Delete this menu item?")) {
    apiCall('DELETE', '/api/menu/' + id).then(function() {
      syncMenuCatalog(); showToast("Item deleted.", "info");
    }).catch(function(err) { showToast(err.message, 'error'); });
  }
}

// ─── ADMIN: STAFF ─────────────────────────────────────────
function syncStaffRoster() {
  apiCall('GET', '/api/employees').then(function(data) {
    var tbody = document.getElementById('staffAdminTbody');
    tbody.innerHTML = '';
    data.forEach(function(row) {
      var sc = row.status === 'Active' ? 'background:#ecfdf5;color:#065f46' : 'background:#fffbeb;color:#78350f';
      tbody.innerHTML += '<tr class="cursor-pointer" onclick="focusStaffProfile(' + JSON.stringify(row).replace(/"/g,'&quot;') + ')"><td class="py-2 font-bold text-xs">' + row.name + '<span class="text-[9px] font-mono block" style="color:var(--text-muted);">' + row.code + '</span></td><td class="py-2 uppercase tracking-wide text-[10px] font-bold">' + row.role + '</td><td class="py-2"><span class="px-1.5 py-0.5 text-[10px] rounded" style="' + sc + '">' + row.status + '</span></td><td class="py-2 text-right"><button onclick="event.stopPropagation();executeStaffDeletion(\'' + row.code + '\')" class="text-rose-500 text-xs font-bold"><i class="fas fa-user-minus"></i></button></td></tr>';
    });
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function validateAndCommitStaff() {
  var fields = ['sEmpName','sEmpMobile','sEmpEmail','sEmpAadhar','sEmpLogin','sEmpPassword'];
  var hasErr = false;
  fields.forEach(function(id) { var el = document.getElementById(id); el.classList.remove('input-field-error'); el.nextElementSibling.classList.add('hidden'); if (!el.value.trim()) { el.classList.add('input-field-error'); el.nextElementSibling.classList.remove('hidden'); hasErr = true; } });
  if (hasErr) return;
  var payload = { name: document.getElementById('sEmpName').value.trim(), mobile: document.getElementById('sEmpMobile').value.trim(), email: document.getElementById('sEmpEmail').value.trim(), aadhar: document.getElementById('sEmpAadhar').value.trim(), loginId: document.getElementById('sEmpLogin').value.trim(), password: document.getElementById('sEmpPassword').value.trim(), role: document.getElementById('sEmpRole').value, status: document.getElementById('sEmpStatus').value, imgUrl: document.getElementById('sEmpImg').value.trim() };
  apiCall('POST', '/api/employees', payload).then(function(res) {
    if (res.success) { showToast("Staff account created!", "success"); fields.forEach(function(id) { document.getElementById(id).value = ''; }); document.getElementById('sEmpImg').value = ''; syncStaffRoster(); }
    else showToast(res.message, "error");
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function focusStaffProfile(emp) {
  selectedStaffRecord = emp;
  document.getElementById('focusStaffImg').src = emp.imgUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";
  document.getElementById('focusStaffName').innerText = emp.name;
  document.getElementById('focusStaffRole').innerText = emp.role;
  document.getElementById('focusStaffPhone').innerText = emp.mobile;
  document.getElementById('focusStaffEmail').innerText = emp.email;
  document.getElementById('focusStaffAadhar').innerText = emp.aadhar || "Omitted";
  document.getElementById('focusStaffTrackBtn').onclick = function() { launchEmployeePerformanceInsight(emp.code, emp.name); };
  document.getElementById('staffFocusPanel').classList.remove('hidden');
}

function launchEmployeePerformanceInsight(code, name) {
  apiCall('GET', '/api/employees/' + code + '/performance').then(function(metrics) {
    var w = window.open('', '_blank', 'width=480,height=420');
    w.document.write('<html><head><title>Performance: ' + name + '</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css"></head><body class="bg-slate-950 text-slate-50 p-6 font-sans"><div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6"><div class="border-b border-slate-800 pb-4 mb-4 text-center"><h2 class="text-lg font-black text-orange-400">' + name + '</h2><p class="text-xs text-slate-400 mt-1">Code: ' + code + '</p></div><div class="space-y-3"><div class="p-3 bg-slate-950 border border-slate-800 rounded-xl"><span class="text-[10px] text-slate-400 font-bold uppercase block">Total Revenue</span><p class="text-xl font-black text-emerald-400 mt-1">₹' + metrics.totalSales.toFixed(2) + '</p></div><div class="p-3 bg-slate-950 border border-slate-800 rounded-xl"><span class="text-[10px] text-slate-400 font-bold uppercase block">Total Orders</span><p class="text-xl font-black text-orange-400 mt-1">' + metrics.totalOrders + '</p></div><div class="p-3 bg-slate-950 border border-slate-800 rounded-xl"><span class="text-[10px] text-slate-400 font-bold uppercase block">Peak Hour</span><p class="text-sm font-bold text-amber-400 mt-1">&#128336; ' + metrics.peakHour + '</p></div></div></div></body></html>');
    w.document.close();
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function executeStaffDeletion(code) {
  if (confirm("Remove this employee?")) {
    apiCall('DELETE', '/api/employees/' + code).then(function() {
      document.getElementById('staffFocusPanel').classList.add('hidden'); syncStaffRoster(); showToast("Employee removed.", "info");
    }).catch(function(err) { showToast(err.message, 'error'); });
  }
}

// ─── LEDGER / CRM ─────────────────────────────────────────
function syncLedgerRegistry() {
  apiCall('GET', '/api/orders').then(function(data) {
    var tbody = document.getElementById('ledgerTbody');
    tbody.innerHTML = '';
    data.forEach(function(row) {
      tbody.innerHTML += '<tr><td class="p-3 font-mono font-bold text-orange-500 text-xs">' + row.invoice + '</td><td class="p-3 text-xs">' + row.date + '</td><td class="p-3 text-xs">' + row.customer + '</td><td class="p-3 font-bold text-xs">₹' + parseFloat(row.amount).toFixed(2) + '</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background:var(--border-color);">' + row.method + '</span></td><td class="p-3 font-mono text-xs">' + row.cashier + '</td></tr>';
    });
  }).catch(function(err) { showToast(err.message, 'error'); });
}

function syncCrmDatabase() {
  apiCall('GET', '/api/customers').then(function(data) {
    var tbody = document.getElementById('crmTbody');
    tbody.innerHTML = '';
    data.forEach(function(row) {
      tbody.innerHTML += '<tr><td class="p-3 font-mono text-xs" style="color:var(--text-muted);">' + row.id + '</td><td class="p-3 font-bold text-xs">' + row.name + '</td><td class="p-3 font-mono text-xs">' + row.mobile + '</td><td class="p-3 text-xs">' + row.email + '</td><td class="p-3 text-xs">' + row.dob + '</td></tr>';
    });
  }).catch(function(err) { showToast(err.message, 'error'); });
}

// ─── MODAL ────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
