/**
 * SmartPark - Hệ thống Quản lý Bãi đỗ xe Thông minh
 * Tự động đồng bộ thời gian thực & tính phí tự động
 */
const SUPABASE_URL = 'https://jgvegymigpbgqmoylljf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmVneW1pZ3BiZ3Ftb3lsbGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3ODA3NDcsImV4cCI6MjEwOTM1Njc0N30.mvoavuNlw6V4ONaYht546D1-_tgehSDwh_GvQ7tubQ8';

const state = { zones: [], slots: [], vehicles: [], bookings: [], sessions: [], cppOnline: false };

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const typeLabel = (t) => (t === 'CAR' ? 'Ô tô' : 'Xe máy');
const zoneLabel = (z) => 'Khu ' + String(z?.zone_code || '').replace('ZONE-', '');
const BOOKING_STATUS = { RESERVED: 'Đã đặt', CHECKED_IN: 'Đã check-in', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' };

/* ---------------- Modern web fallbacks (dialog light-dismiss, :user-invalid) ---------------- */
function initModernWebFallbacks() {
  const modal = $('qr-modal');
  modal.addEventListener('close', () => { modal.returnValue = ''; });
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    modal.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, modal); });
    modal.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, modal)) modal.close(); });
  }
  const syncAria = (el) => {
    try { if (el?.matches) el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false'); } catch (_) { /* unsupported */ }
  };
  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => { if (e.target?.hasAttribute?.('aria-invalid')) syncAria(e.target); });

  if (!(CSS.supports && CSS.supports('selector(:user-invalid)'))) {
    const dirty = new WeakMap();
    const update = (i) => {
      const ok = i.checkValidity();
      i.classList.toggle('user-invalid-fallback', !ok);
      i.classList.toggle('user-valid-fallback', ok);
    };
    document.addEventListener('input', (e) => { if (e.target.checkValidity) { const s = dirty.get(e.target) || {}; s.touched = true; dirty.set(e.target, s); if (s.blurred) update(e.target); } });
    document.addEventListener('blur', (e) => { if (e.target.checkValidity) { const s = dirty.get(e.target) || {}; s.blurred = true; dirty.set(e.target, s); if (s.touched) update(e.target); } }, true);
  }
}

/* ---------------- Supabase REST ---------------- */
async function sb(endpoint, { method = 'GET', body, prefer = 'return=representation' } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text || res.statusText);
    err.status = res.status;
    try { err.code = JSON.parse(text).code; } catch (_) { /* not json */ }
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

/* ---------------- Tính phí tự động theo khung 30 phút ---------------- */
async function calcFee(vehicleType, hourlyRate, minutes, overtime) {
  const actualHours = Math.max(0.1, minutes / 60);
  if (state.cppOnline) {
    try {
      const r = await fetch(`/api/calculate-fee?rate=${hourlyRate}&minutes=${Math.round(minutes)}&overtime=${overtime ? 1 : 0}`);
      if (r.ok) {
        const d = await r.json();
        return {
          actualHours,
          billableHours: d.billed_hours ?? d.billableHours,
          hourlyRate: d.hourly_rate ?? hourlyRate,
          baseFee: d.base_fee ?? d.baseFee,
          overtimeSurcharge: d.overtime_surcharge ?? d.overtimeSurcharge,
          totalFee: d.total_fee ?? d.totalFee,
          engine: 'Tính tự động theo khung 30 phút'
        };
      }
    } catch (_) { /* dùng bản JS */ }
  }
  const billableHours = Math.max(1, Math.ceil(actualHours * 2) / 2);
  const baseFee = Math.round((billableHours * hourlyRate) / 1000) * 1000;
  const overtimeSurcharge = overtime ? Math.round((baseFee * 0.2) / 1000) * 1000 : 0;
  return { actualHours, billableHours, hourlyRate, baseFee, overtimeSurcharge, totalFee: baseFee + overtimeSurcharge, engine: 'Làm tròn theo khung 30 phút' };
}

const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0)) + ' ₫';
const fmtDT = (s) => (s ? new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const todayCode = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const rand = (n) => String(Math.floor(Math.random() * 10 ** n)).padStart(n, '0');

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ---------------- QR thật (qrcode-generator) ---------------- */
function qrSvg(text, size = 170) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 8} ${n + 8}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Mã QR ${esc(text)}"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#23115b"/></svg>`;
}

/* ---------------- Tự động đồng bộ dữ liệu thời gian thực ---------------- */
async function syncAll(silent = true) {
  try {
    const [zones, slots, vehicles, bookings, sessions] = await Promise.all([
      sb('parking_zones?select=*&order=zone_code.asc'),
      sb('parking_slots?select=*&order=slot_code.asc'),
      sb('vehicles?select=*&order=created_at.desc'),
      sb('bookings?select=*&order=created_at.desc'),
      sb('parking_sessions?select=*&order=check_in_time.desc'),
    ]);
    Object.assign(state, { zones, slots, vehicles, bookings, sessions });
    renderAll();
    if ($('supabase-dot')) $('supabase-dot').className = 'status-dot online';
    if (!silent) toast('✅ Đã đồng bộ dữ liệu mới nhất');
  } catch (err) {
    console.error(err);
    if ($('supabase-dot')) $('supabase-dot').className = 'status-dot';
  }
}

async function probeCpp() {
  try {
    const r = await fetch('/api/status');
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
      state.cppOnline = true;
    }
  } catch (_) { state.cppOnline = false; }
}

const zoneOf = (slot) => state.zones.find((z) => z.id === slot?.zone_id);
const slotById = (id) => state.slots.find((s) => s.id === Number(id));

function renderAll() {
  renderKPIs();
  fillSelects();
  renderMap();
  renderBookings();
  renderQrTab();
  renderVehicles();
  renderSlotsTab();
  renderHistory();
  renderDashboard();
}

/* ---------------- KPI + Sơ đồ (US02-04) ---------------- */
function renderKPIs() {
  const avail = state.slots.filter((s) => s.status === 'AVAILABLE');
  const occ = state.slots.filter((s) => s.status === 'OCCUPIED').length;
  const res = state.slots.filter((s) => s.status === 'RESERVED').length;
  const done = state.sessions.filter((s) => s.status === 'COMPLETED');
  $('kpi-total-slots').textContent = state.slots.length;
  $('kpi-zones-summary').textContent = `${state.zones.length} khu vực`;
  $('kpi-avail-slots').textContent = avail.length;
  $('kpi-avail-detail').textContent = `Ô tô: ${avail.filter((s) => s.vehicle_type === 'CAR').length} • Xe máy: ${avail.filter((s) => s.vehicle_type === 'MOTORBIKE').length}`;
  $('kpi-busy-slots').textContent = occ + res;
  $('kpi-busy-detail').textContent = `Đang đỗ: ${occ} • Đặt trước: ${res}`;
  $('kpi-revenue-total').textContent = fmtVND(done.reduce((a, s) => a + (s.fee_amount || 0), 0));
  $('kpi-sessions-count').textContent = `${done.length} lượt đã thanh toán`;
  $('nav-avail-badge').textContent = avail.length;
}

function fillSelects() {
  const fz = $('filter-zone');
  const cur = fz.value || 'ALL';
  fz.innerHTML = '<option value="ALL">Tất cả khu vực</option>' + state.zones.map((z) => `<option value="${z.id}">${esc(zoneLabel(z))} — ${esc(z.zone_name)}</option>`).join('');
  fz.value = [...fz.options].some((o) => o.value === cur) ? cur : 'ALL';

  const bv = $('bk-vehicle');
  const curV = bv.value;
  bv.innerHTML = state.vehicles.length
    ? state.vehicles.map((v) => `<option value="${v.id}">${esc(v.license_plate)} — ${esc(v.brand || typeLabel(v.vehicle_type))} (${esc(v.owner_name)})</option>`).join('')
    : '<option value="">Chưa có phương tiện - hãy đăng ký trước</option>';
  if (curV && [...bv.options].some((o) => o.value === curV)) bv.value = curV;
  fillBookingSlots();

  const wiType = $('wi-type').value;
  const wiSlots = state.slots.filter((s) => s.status === 'AVAILABLE' && s.vehicle_type === wiType);
  const curW = $('wi-slot').value;
  $('wi-slot').innerHTML = wiSlots.length
    ? wiSlots.map((s) => `<option value="${s.id}">${esc(s.slot_code)} (${esc(zoneLabel(zoneOf(s)))})</option>`).join('')
    : '<option value="">Hết chỗ trống cho loại xe này</option>';
  if (curW && [...$('wi-slot').options].some((o) => o.value === curW)) $('wi-slot').value = curW;

  $('sl-zone').innerHTML = state.zones.map((z) => `<option value="${z.id}">${esc(zoneLabel(z))} — ${esc(z.zone_name)} (${fmtVND(z.hourly_rate)}/giờ)</option>`).join('');
}

function fillBookingSlots() {
  const veh = state.vehicles.find((v) => v.id === Number($('bk-vehicle').value));
  const list = state.slots.filter((s) => s.status === 'AVAILABLE' && (!veh || s.vehicle_type === veh.vehicle_type));
  const cur = $('bk-slot').value;
  $('bk-slot').innerHTML = list.length
    ? list.map((s) => `<option value="${s.id}">${esc(s.slot_code)} (${esc(zoneLabel(zoneOf(s)))} • ${fmtVND(zoneOf(s)?.hourly_rate)}/giờ)</option>`).join('')
    : '<option value="">Không còn ô trống phù hợp</option>';
  if (cur && [...$('bk-slot').options].some((o) => o.value === cur)) $('bk-slot').value = cur;
  updateEstimate();
}

function renderMap() {
  const zf = $('filter-zone').value, tf = $('filter-type').value, sf = $('filter-status').value;
  const q = $('search-slot').value.trim().toUpperCase();
  const label = { AVAILABLE: 'Trống', RESERVED: 'Đã đặt', OCCUPIED: 'Có xe', MAINTENANCE: 'Bảo trì' };
  let html = '';
  for (const z of state.zones) {
    if (zf !== 'ALL' && z.id !== Number(zf)) continue;
    const slots = state.slots.filter((s) => s.zone_id === z.id && (tf === 'ALL' || s.vehicle_type === tf) && (sf === 'ALL' || s.status === sf) && (!q || s.slot_code.toUpperCase().includes(q)));
    if (!slots.length) continue;
    const free = slots.filter((s) => s.status === 'AVAILABLE').length;
    html += `<section class="zone-section"><div class="zone-header"><div class="zone-title"><span class="zone-badge">${esc(zoneLabel(z).toUpperCase())}</span><div><h3>${esc(z.zone_name)}</h3><small style="color:var(--text-muted)">${typeLabel(z.vehicle_type)} • <strong>${fmtVND(z.hourly_rate)}/giờ</strong> • Qua đêm ${fmtVND(z.overnight_rate)}</small></div></div><span class="badge" style="background:var(--avail-bg);color:var(--avail-text);border:1px solid var(--avail-border)">Trống ${free}/${slots.length} ô</span></div><div class="slots-grid">`;
    for (const s of slots) {
      const bk = state.bookings.find((b) => b.slot_id === s.id && b.status === 'RESERVED');
      const info = s.status === 'OCCUPIED' ? `🚘 ${esc(s.current_plate || '')}` : s.status === 'RESERVED' ? `📅 ${esc(bk?.license_plate || '')}` : s.status === 'MAINTENANCE' ? '🛠️ Đang bảo trì' : '✨ Sẵn sàng';
      html += `<button type="button" class="slot-tile status-${s.status}" data-slot="${s.id}"><div class="slot-top"><span class="slot-code">${esc(s.slot_code)}</span><span class="slot-status-pill">${label[s.status]}</span></div><div class="slot-plate">${info}</div><div class="slot-meta"><span>${typeLabel(s.vehicle_type)}</span><span>${fmtVND(z.hourly_rate)}/giờ</span></div></button>`;
    }
    html += '</div></section>';
  }
  $('zones-map-container').innerHTML = html || '<div class="card"><p>Không có ô đỗ nào khớp bộ lọc.</p></div>';
  $('zones-map-container').querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => openSlotModal(Number(b.dataset.slot))));
}

/* ---------------- Modal ---------------- */
function openModal(title, bodyHtml, footerHtml) {
  $('qr-modal-title').textContent = title;
  $('qr-modal-body').innerHTML = bodyHtml;
  $('qr-modal-footer').innerHTML = footerHtml + '<form method="dialog"><button type="submit" class="btn btn-outline">Đóng</button></form>';
  $('qr-modal').showModal();
}

function qrTicket(code, lines) {
  return `<div class="qr-ticket-box"><div class="qr-svg-wrap">${qrSvg(code, 180)}</div><code style="font-weight:700">${esc(code)}</code>${lines}</div>`;
}

function openSlotModal(id) {
  const s = slotById(id);
  if (!s) return;
  const z = zoneOf(s);
  if (s.status === 'OCCUPIED') {
    const ses = state.sessions.find((x) => x.slot_id === s.id && x.status === 'ACTIVE');
    if (ses) return openCheckout(ses.id);
  }
  if (s.status === 'RESERVED') {
    const bk = state.bookings.find((b) => b.slot_id === s.id && b.status === 'RESERVED');
    if (bk) {
      openModal(`Ô ${s.slot_code} - đã đặt trước`, qrTicket(bk.booking_code, `<p>${esc(bk.customer_name)} • <strong>${esc(bk.license_plate)}</strong></p><div class="invoice-grid"><div><small>Từ</small><br><strong>${fmtDT(bk.start_time)}</strong></div><div><small>Đến</small><br><strong>${fmtDT(bk.end_time)}</strong></div></div>`),
        '<button type="button" class="btn btn-success" id="m-checkin">📷 Cho xe vào (Check-in)</button>');
      $('m-checkin').onclick = () => { $('qr-modal').close(); checkinBooking(bk); };
      return;
    }
  }
  const body = `<div class="qr-ticket-box"><h4>Ô ${esc(s.slot_code)} — ${esc(z?.zone_name)}</h4><div class="invoice-grid"><div><small>Trạng thái</small><br><strong>${s.status}</strong></div><div><small>Loại xe</small><br><strong>${typeLabel(s.vehicle_type)}</strong></div><div><small>Đơn giá</small><br><strong>${fmtVND(z?.hourly_rate)}/giờ</strong></div><div><small>Qua đêm</small><br><strong>${fmtVND(z?.overnight_rate)}</strong></div></div></div>`;
  if (s.status === 'AVAILABLE') {
    openModal(`Chi tiết ô ${s.slot_code}`, body, '<button type="button" class="btn btn-primary" id="m-book">📅 Đặt trước ô này</button><button type="button" class="btn btn-outline" id="m-maint">🛠️ Chuyển bảo trì</button>');
    $('m-book').onclick = () => { $('qr-modal').close(); switchTab('booking-tab'); $('bk-slot').value = String(s.id); updateEstimate(); };
    $('m-maint').onclick = () => { $('qr-modal').close(); setSlotStatus(s.id, 'MAINTENANCE', 'AVAILABLE'); };
  } else {
    openModal(`Chi tiết ô ${s.slot_code}`, body, '<button type="button" class="btn btn-success" id="m-open">✅ Mở lại ô đỗ</button>');
    $('m-open').onclick = () => { $('qr-modal').close(); setSlotStatus(s.id, 'AVAILABLE', 'MAINTENANCE'); };
  }
}

/* ---------------- Đặt chỗ trước (US07-08) ---------------- */
async function updateEstimate() {
  const s = slotById($('bk-slot').value);
  const rate = zoneOf(s)?.hourly_rate || 20000;
  const a = $('bk-start-time').value, b = $('bk-end-time').value;
  let mins = 120;
  if (a && b) { const d = (new Date(b) - new Date(a)) / 60000; if (d > 0) mins = d; }
  const f = await calcFee(s?.vehicle_type || 'CAR', rate, mins, false);
  $('bk-estimated-fee').textContent = fmtVND(f.totalFee);
  $('bk-estimated-detail').textContent = `${f.billableHours} giờ × ${fmtVND(f.hourlyRate)}/giờ • ${f.engine}`;
}

function renderBookings() {
  const tb = $('bookings-tbody');
  tb.innerHTML = state.bookings.map((b) => `<tr><th>${esc(b.booking_code)}</th><td><strong>${esc(b.license_plate)}</strong> • Ô <span class="badge badge-cpp">${esc(b.slot_code)}</span><br><small>${esc(b.customer_name)}</small></td><td>${fmtDT(b.start_time)}<br><small>→ ${fmtDT(b.end_time)}</small></td><td><span class="badge" style="background:var(--reserved-bg);color:var(--reserved-text)">${BOOKING_STATUS[b.status] || b.status}</span></td><td><div style="display:flex;gap:.4rem;flex-wrap:wrap"><button type="button" class="btn btn-outline btn-sm" data-bk-qr="${b.id}">🎫 QR</button>${b.status === 'RESERVED' ? `<button type="button" class="btn btn-success btn-sm" data-bk-in="${b.id}">📷 Check-in</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="5">Chưa có đặt chỗ nào.</td></tr>';
  tb.querySelectorAll('[data-bk-qr]').forEach((x) => (x.onclick = () => {
    const b = state.bookings.find((k) => k.id === Number(x.dataset.bkQr));
    openModal('Vé đặt chỗ ' + b.license_plate, qrTicket(b.booking_code, `<p>Ô <strong>${esc(b.slot_code)}</strong> • ${esc(b.customer_name)}</p>`), '');
  }));
  tb.querySelectorAll('[data-bk-in]').forEach((x) => (x.onclick = () => checkinBooking(state.bookings.find((k) => k.id === Number(x.dataset.bkIn)))));
}

async function submitBooking(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) return form.reportValidity();
  const veh = state.vehicles.find((v) => v.id === Number($('bk-vehicle').value));
  const slot = slotById($('bk-slot').value);
  if (!veh || !slot) return toast('⚠️ Cần chọn phương tiện và ô đỗ trống');
  const start = new Date($('bk-start-time').value), end = new Date($('bk-end-time').value);
  if (!(end > start)) return toast('⚠️ Giờ kết thúc phải sau giờ bắt đầu');
  try {
    const held = await sb(`parking_slots?id=eq.${slot.id}&status=eq.AVAILABLE`, { method: 'PATCH', body: { status: 'RESERVED', current_plate: veh.license_plate, updated_at: new Date().toISOString() } });
    if (!held.length) { toast('⚠️ Ô này vừa có người khác đặt, hãy chọn ô khác'); return syncAll(); }
    const code = `QR-BK-${todayCode()}-${rand(4)}`;
    try {
      await sb('bookings', { method: 'POST', body: { booking_code: code, customer_name: $('bk-customer-name').value.trim(), customer_phone: veh.owner_phone, license_plate: veh.license_plate, vehicle_type: veh.vehicle_type, slot_id: slot.id, slot_code: slot.slot_code, start_time: start.toISOString(), end_time: end.toISOString(), status: 'RESERVED' } });
    } catch (err) {
      await sb(`parking_slots?id=eq.${slot.id}`, { method: 'PATCH', body: { status: 'AVAILABLE', current_plate: null } });
      throw err;
    }
    await syncAll();
    toast('🎫 Đặt chỗ thành công: ' + code);
    openModal('Vé đặt chỗ ' + veh.license_plate, qrTicket(code, `<p>Ô <strong>${esc(slot.slot_code)}</strong> • ${fmtDT(start)} → ${fmtDT(end)}</p>`), '');
  } catch (err) { toast('❌ Lỗi đặt chỗ: ' + err.message.slice(0, 120)); }
}

/* ---------------- QR Check-in / Check-out (US09-12) ---------------- */
function renderQrTab() {
  const pending = state.bookings.filter((b) => b.status === 'RESERVED');
  $('pending-booking-chips').innerHTML = pending.length ? pending.map((b) => `<button type="button" class="chip" data-fill="${esc(b.booking_code)}">🎫 ${esc(b.booking_code)} (${esc(b.license_plate)})</button>`).join('') : '<small style="color:var(--text-muted)">Không có phiếu đặt trước nào đang chờ.</small>';
  $('pending-booking-chips').querySelectorAll('[data-fill]').forEach((c) => (c.onclick = () => ($('qr-checkin-input').value = c.dataset.fill)));
  const active = state.sessions.filter((s) => s.status === 'ACTIVE');
  $('active-sessions-cards').innerHTML = active.length ? active.map((s) => `<div class="session-card"><div><strong>🚘 ${esc(s.license_plate)}</strong> • Ô <span class="badge badge-cpp">${esc(s.slot_code)}</span><div style="font-size:.78rem;color:var(--text-muted)">Vé: <code>${esc(s.qr_token)}</code> • Vào: ${fmtDT(s.check_in_time)}</div></div><button type="button" class="btn btn-warning btn-sm" data-out="${s.id}">🧮 Tính phí & cho xe ra</button></div>`).join('') : '<div class="session-card"><span>Không có xe nào đang đỗ.</span></div>';
  $('active-sessions-cards').querySelectorAll('[data-out]').forEach((b) => (b.onclick = () => openCheckout(Number(b.dataset.out))));
}

async function checkinBooking(bk) {
  if (!bk || bk.status !== 'RESERVED') return toast('⚠️ Phiếu đặt chỗ không hợp lệ hoặc đã dùng');
  try {
    const slot = slotById(bk.slot_id);
    const token = `QR-IN-${todayCode()}-${rand(4)}`;
    await sb(`parking_slots?id=eq.${bk.slot_id}`, { method: 'PATCH', body: { status: 'OCCUPIED', current_plate: bk.license_plate, updated_at: new Date().toISOString() } });
    await sb(`bookings?id=eq.${bk.id}`, { method: 'PATCH', body: { status: 'CHECKED_IN' } });
    await sb('parking_sessions', { method: 'POST', body: { qr_token: token, booking_id: bk.id, slot_id: bk.slot_id, slot_code: bk.slot_code, license_plate: bk.license_plate, vehicle_type: bk.vehicle_type, customer_name: bk.customer_name, status: 'ACTIVE', notes: 'Check-in từ ' + bk.booking_code } });
    await syncAll();
    toast(`✅ Xe ${bk.license_plate} đã vào ô ${slot?.slot_code}`);
    openModal('Vé xe vào bãi ' + bk.license_plate, qrTicket(token, `<p>Ô <strong>${esc(bk.slot_code)}</strong>. Xuất trình mã này khi lấy xe.</p>`), '');
  } catch (err) { toast('❌ Lỗi check-in: ' + err.message.slice(0, 120)); }
}

async function submitWalkin(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) return form.reportValidity();
  const plate = $('wi-plate').value.trim().toUpperCase();
  const slot = slotById($('wi-slot').value);
  if (!slot) return toast('⚠️ Hết chỗ trống cho loại xe này');
  if (state.sessions.some((s) => s.status === 'ACTIVE' && s.license_plate === plate)) return toast('⚠️ Biển số này đang đỗ trong bãi');
  try {
    const held = await sb(`parking_slots?id=eq.${slot.id}&status=eq.AVAILABLE`, { method: 'PATCH', body: { status: 'OCCUPIED', current_plate: plate, updated_at: new Date().toISOString() } });
    if (!held.length) { toast('⚠️ Ô vừa bị chiếm, hãy chọn ô khác'); return syncAll(); }
    const token = `QR-IN-${todayCode()}-${rand(4)}`;
    await sb('parking_sessions', { method: 'POST', body: { qr_token: token, slot_id: slot.id, slot_code: slot.slot_code, license_plate: plate, vehicle_type: $('wi-type').value, customer_name: 'Khách vãng lai', status: 'ACTIVE', notes: 'Xe vãng lai' } });
    form.reset();
    await syncAll();
    toast(`🚀 Xe ${plate} vào ô ${slot.slot_code}`);
    openModal('Vé xe vào bãi ' + plate, qrTicket(token, `<p>Ô <strong>${esc(slot.slot_code)}</strong>. Xuất trình mã này khi lấy xe.</p>`), '');
  } catch (err) {
    await sb(`parking_slots?id=eq.${slot.id}`, { method: 'PATCH', body: { status: 'AVAILABLE', current_plate: null } }).catch(() => {});
    toast('❌ Lỗi cấp vé: ' + err.message.slice(0, 120));
  }
}

async function openCheckout(sessionId) {
  const ses = state.sessions.find((s) => s.id === sessionId);
  if (!ses || ses.status !== 'ACTIVE') return;
  const slot = slotById(ses.slot_id), zone = zoneOf(slot);
  const now = new Date();
  const mins = Math.max(1, Math.round((now - new Date(ses.check_in_time)) / 60000));
  const bk = ses.booking_id ? state.bookings.find((b) => b.id === ses.booking_id) : null;
  const overtime = !!(bk && now > new Date(bk.end_time));
  const f = await calcFee(ses.vehicle_type, zone?.hourly_rate || 20000, mins, overtime);
  openModal(`Check-out ${ses.license_plate}`, `<div class="qr-ticket-box"><div class="invoice-grid"><div><small>Biển số</small><br><strong>${esc(ses.license_plate)}</strong></div><div><small>Ô đỗ</small><br><strong>${esc(ses.slot_code)} (${esc(zoneLabel(zone))})</strong></div><div><small>Giờ vào</small><br><strong>${fmtDT(ses.check_in_time)}</strong></div><div><small>Giờ ra</small><br><strong>${fmtDT(now)}</strong></div><div><small>Thực tế</small><br><strong>${mins} phút → tính ${f.billableHours} giờ</strong></div><div><small>Đơn giá</small><br><strong>${fmtVND(f.hourlyRate)}/giờ</strong></div><div><small>Phí cơ bản</small><br><strong>${fmtVND(f.baseFee)}</strong></div><div><small>Phụ phí quá giờ</small><br><strong>${fmtVND(f.overtimeSurcharge)}</strong></div></div><div style="font-size:1.3rem;font-weight:800;color:var(--brand-color)">Tổng thanh toán: ${fmtVND(f.totalFee)}</div><small>${esc(f.engine)}</small><div class="field" style="width:100%"><label for="pay-method">Hình thức thanh toán</label><select id="pay-method"><option value="CASH">Tiền mặt</option><option value="QR_TRANSFER">Chuyển khoản QR</option></select></div></div>`,
    '<button type="button" class="btn btn-success" id="m-pay">💳 Xác nhận thu phí & trả ô</button>');
  $('m-pay').onclick = async () => {
    const method = $('pay-method').value;
    try {
      $('qr-modal').close();
      await sb(`parking_sessions?id=eq.${ses.id}&status=eq.ACTIVE`, { method: 'PATCH', body: { check_out_time: now.toISOString(), duration_hours: Number((mins / 60).toFixed(2)), fee_amount: f.totalFee, payment_method: method, status: 'COMPLETED', notes: f.engine } });
      await sb(`parking_slots?id=eq.${ses.slot_id}`, { method: 'PATCH', body: { status: 'AVAILABLE', current_plate: null, updated_at: new Date().toISOString() } });
      if (bk) await sb(`bookings?id=eq.${bk.id}`, { method: 'PATCH', body: { status: 'COMPLETED' } });
      await syncAll();
      toast(`🎉 Thu ${fmtVND(f.totalFee)} • ô ${ses.slot_code} đã trống`);
    } catch (err) { toast('❌ Lỗi check-out: ' + err.message.slice(0, 120)); }
  };
}

/* ---------------- Phương tiện (US05-06) ---------------- */
function renderVehicles() {
  const tb = $('vehicles-tbody');
  tb.innerHTML = state.vehicles.map((v) => `<tr><th>${esc(v.license_plate)}</th><td>${typeLabel(v.vehicle_type)}</td><td>${esc(v.brand || '—')} (${esc(v.color || '—')})</td><td>${esc(v.owner_name)}</td><td><button type="button" class="btn btn-outline btn-sm" data-del="${v.id}">🗑️ Xóa</button></td></tr>`).join('') || '<tr><td colspan="5">Chưa có phương tiện.</td></tr>';
  tb.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
    const v = state.vehicles.find((x) => x.id === Number(b.dataset.del));
    if (!confirm(`Xóa phương tiện ${v.license_plate}?`)) return;
    try { await sb(`vehicles?id=eq.${v.id}`, { method: 'DELETE' }); await syncAll(); toast('🗑️ Đã xóa phương tiện'); } catch (err) { toast('❌ Không xóa được: ' + err.message.slice(0, 100)); }
  }));
}

async function submitVehicle(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) return form.reportValidity();
  const plate = $('vh-plate').value.trim().toUpperCase();
  try {
    await sb('vehicles', { method: 'POST', body: { license_plate: plate, vehicle_type: $('vh-type').value, brand: $('vh-brand').value.trim(), color: $('vh-color').value.trim() || null, owner_name: $('vh-owner').value.trim() } });
    form.reset();
    $('vh-owner').value = '';
    await syncAll();
    toast(`🚗 Đã đăng ký ${plate}`);
  } catch (err) { toast(err.code === '23505' ? '⚠️ Biển số này đã được đăng ký' : '❌ Lỗi đăng ký xe: ' + err.message.slice(0, 100)); }
}

/* ---------------- Quản lý ô đỗ (US14) ---------------- */
function renderSlotsTab() {
  $('zones-pricing-cards').innerHTML = state.zones.map((z) => `<div class="bar-item"><div class="bar-top"><span>${esc(zoneLabel(z))} — ${esc(z.zone_name)}</span><span style="color:var(--brand-color)">${fmtVND(z.hourly_rate)}/giờ</span></div><small style="color:var(--text-muted)">${typeLabel(z.vehicle_type)} • Qua đêm ${fmtVND(z.overnight_rate)} • ${esc(z.description || '')}</small></div>`).join('');
  const tb = $('slots-tbody');
  tb.innerHTML = state.slots.map((s) => {
    const z = zoneOf(s);
    const toggle = s.status === 'AVAILABLE' ? ['MAINTENANCE', '🛠️ Bảo trì'] : s.status === 'MAINTENANCE' ? ['AVAILABLE', '✅ Mở lại'] : null;
    return `<tr><th>${esc(s.slot_code)}</th><td>${esc(zoneLabel(z))}</td><td>${typeLabel(s.vehicle_type)} • ${fmtVND(z?.hourly_rate)}/giờ</td><td><span class="slot-status-pill" style="background:var(--bg-elevated)">${s.status}</span></td><td>${toggle ? `<button type="button" class="btn btn-outline btn-sm" data-tg="${s.id}" data-to="${toggle[0]}" data-from="${s.status}">${toggle[1]}</button>` : '<small style="color:var(--text-muted)">Đang bận</small>'}</td></tr>`;
  }).join('');
  tb.querySelectorAll('[data-tg]').forEach((b) => (b.onclick = () => setSlotStatus(Number(b.dataset.tg), b.dataset.to, b.dataset.from)));
}

async function setSlotStatus(id, to, from) {
  try {
    const r = await sb(`parking_slots?id=eq.${id}&status=eq.${from}`, { method: 'PATCH', body: { status: to, updated_at: new Date().toISOString() } });
    if (!r.length) toast('⚠️ Trạng thái ô đã thay đổi, đã tải lại');
    else toast(`🔄 Ô ${r[0].slot_code} → ${to}`);
    await syncAll();
  } catch (err) { toast('❌ Lỗi: ' + err.message.slice(0, 100)); }
}

async function submitSlot(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) return form.reportValidity();
  const code = $('sl-code').value.trim().toUpperCase();
  try {
    await sb('parking_slots', { method: 'POST', body: { zone_id: Number($('sl-zone').value), slot_code: code, vehicle_type: $('sl-type').value, status: $('sl-status').value } });
    form.reset();
    await syncAll();
    toast(`🅿️ Đã thêm ô ${code}`);
  } catch (err) { toast(err.code === '23505' ? '⚠️ Mã ô đã tồn tại' : '❌ Lỗi thêm ô: ' + err.message.slice(0, 100)); }
}

/* ---------------- Lịch sử (US13) & Dashboard (US15) ---------------- */
function renderHistory() {
  const q = $('history-search').value.trim().toUpperCase();
  const sf = $('history-status-filter').value;
  const list = state.sessions.filter((s) => (sf === 'ALL' || s.status === sf) && (!q || `${s.qr_token} ${s.license_plate} ${s.slot_code}`.toUpperCase().includes(q)));
  const tb = $('history-tbody');
  tb.innerHTML = list.map((s) => `<tr><th>${esc(s.qr_token)}</th><td><strong>${esc(s.license_plate)}</strong> • Ô ${esc(s.slot_code)}</td><td>Vào: ${fmtDT(s.check_in_time)}<br><small>Ra: ${fmtDT(s.check_out_time)}</small></td><td>${s.status === 'COMPLETED' ? Number(s.duration_hours) + ' giờ' : 'Đang gửi'}</td><td><strong>${s.status === 'COMPLETED' ? fmtVND(s.fee_amount) : '—'}</strong></td><td><span class="badge badge-cpp">${s.status === 'ACTIVE' ? 'Đang đỗ' : 'Đã thanh toán'}</span></td><td>${s.status === 'ACTIVE' ? `<button type="button" class="btn btn-warning btn-sm" data-ho="${s.id}">Check-out</button>` : `<button type="button" class="btn btn-outline btn-sm" data-hq="${s.id}">🎫 Biên lai</button>`}</td></tr>`).join('') || '<tr><td colspan="7">Không có dữ liệu.</td></tr>';
  tb.querySelectorAll('[data-ho]').forEach((b) => (b.onclick = () => openCheckout(Number(b.dataset.ho))));
  tb.querySelectorAll('[data-hq]').forEach((b) => (b.onclick = () => {
    const s = state.sessions.find((x) => x.id === Number(b.dataset.hq));
    openModal('Biên lai ' + s.license_plate, qrTicket(s.qr_token, `<div class="invoice-grid"><div><small>Ô</small><br><strong>${esc(s.slot_code)}</strong></div><div><small>Thời gian</small><br><strong>${Number(s.duration_hours)} giờ</strong></div><div><small>Thanh toán</small><br><strong>${s.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản QR'}</strong></div><div><small>Tổng thu</small><br><strong>${fmtVND(s.fee_amount)}</strong></div></div>`), '');
  }));
}

function renderDashboard() {
  const done = state.sessions.filter((s) => s.status === 'COMPLETED');
  $('zone-analytics-bars').innerHTML = state.zones.map((z) => {
    const zs = state.slots.filter((s) => s.zone_id === z.id);
    const busy = zs.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
    const pct = zs.length ? Math.round((busy / zs.length) * 100) : 0;
    const rev = done.filter((s) => slotById(s.slot_id)?.zone_id === z.id).reduce((a, s) => a + (s.fee_amount || 0), 0);
    return `<div class="bar-item"><div class="bar-top"><span>${esc(zoneLabel(z))} (${busy}/${zs.length} ô bận)</span><span>Doanh thu: <strong>${fmtVND(rev)}</strong> • Lấp đầy ${pct}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  const total = state.slots.length || 1;
  const items = [['Trống', 'AVAILABLE', '#10b981'], ['Đã đặt trước', 'RESERVED', '#f59e0b'], ['Đang có xe', 'OCCUPIED', '#6c3ce9'], ['Bảo trì', 'MAINTENANCE', '#64748b']];
  $('status-breakdown-box').innerHTML = items.map(([l, k, c]) => {
    const n = state.slots.filter((s) => s.status === k).length, p = Math.round((n / total) * 100);
    return `<div class="bar-item"><div class="bar-top"><span>${l}</span><span>${n} ô (${p}%)</span></div><div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${c}"></div></div></div>`;
  }).join('');
}

/* ---------------- Điều hướng & sự kiện ---------------- */
const TAB_TITLES = {
  'map-tab': ['Sơ đồ Bãi xe & Kiểm tra Chỗ trống Thời gian thực', 'Theo dõi vị trí đỗ xe trực tiếp, đặt chỗ trước và kiểm soát xe vào/ra bằng mã QR'],
  'booking-tab': ['Đặt chỗ Đỗ xe Trực tuyến & Cấp mã QR', 'Chọn vị trí đỗ xe đang trống theo khung giờ và nhận thẻ vé mã QR tức thì'],
  'qr-tab': ['Cổng Kiểm soát QR Check-in / Check-out & Tính phí', 'Quét mã QR xác nhận xe vào/ra bãi và tính cước phí tự động theo thời gian gửi'],
  'vehicles-tab': ['Đăng ký & Quản lý Hồ sơ Phương tiện', 'Lưu trữ thông tin biển số xe ô tô và xe máy để đặt chỗ nhanh chóng'],
  'slots-tab': ['Quản lý Vị trí Đỗ xe & Khu vực (Khu A / B / C)', 'Thêm vị trí đỗ mới, xem bảng giá niêm yết và điều chỉnh trạng thái bảo trì'],
  'history-tab': ['Lịch sử Xe Vào / Ra & Hóa đơn Thanh toán', 'Tra cứu biên lai thanh toán và lịch sử các lượt gửi xe tại bãi'],
  'dashboard-tab': ['Dashboard Thống kê Doanh thu & Hiệu suất Bãi xe', 'Phân tích công suất lấp đầy khu A/B/C và báo cáo doanh thu thời gian thực']
};

function switchTab(id, pushUrl = true) {
  document.querySelectorAll('.tab-panel').forEach((p) => { p.hidden = p.id !== id; p.classList.toggle('active', p.id === id); });
  document.querySelectorAll('.nav-btn').forEach((b) => {
    const active = b.dataset.tab === id;
    b.classList.toggle('active', active);
    if (active && pushUrl && b.dataset.route && window.location.protocol.startsWith('http')) {
      try { window.history.replaceState({}, '', b.dataset.route); } catch (_) { /* ignore */ }
    }
  });
  if (TAB_TITLES[id]) {
    $('page-heading').textContent = TAB_TITLES[id][0];
    $('page-subheading').textContent = TAB_TITLES[id][1];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initModernWebFallbacks();
  const initialTab = document.body.dataset.initialTab || 'map-tab';
  switchTab(initialTab, false);
  const localIso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const now = new Date();
  $('bk-start-time').value = localIso(now);
  $('bk-end-time').value = localIso(new Date(now.getTime() + 2 * 3600e3));
  $('bk-customer-name').value = '';
  $('vh-owner').value = '';

  document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  if ($('btn-sync-now')) $('btn-sync-now').onclick = () => syncAll(false);
  if ($('btn-quick-checkin')) $('btn-quick-checkin').onclick = () => switchTab('qr-tab');
  ['filter-zone', 'filter-type', 'filter-status', 'search-slot'].forEach((id) => $(id).addEventListener('input', renderMap));
  ['history-search', 'history-status-filter'].forEach((id) => $(id).addEventListener('input', renderHistory));
  $('bk-vehicle').addEventListener('change', fillBookingSlots);
  ['bk-slot', 'bk-start-time', 'bk-end-time'].forEach((id) => $(id).addEventListener('change', updateEstimate));
  $('wi-type').addEventListener('change', fillSelects);
  $('booking-form').addEventListener('submit', submitBooking);
  $('walkin-checkin-form').addEventListener('submit', submitWalkin);
  $('vehicle-form').addEventListener('submit', submitVehicle);
  $('slot-form').addEventListener('submit', submitSlot);

  $('btn-verify-booking-qr').onclick = () => {
    const code = $('qr-checkin-input').value.trim().toUpperCase();
    const bk = state.bookings.find((b) => b.booking_code.toUpperCase() === code && b.status === 'RESERVED');
    if (!bk) return toast('❌ Không tìm thấy phiếu đặt chỗ hợp lệ: ' + (code || '(trống)'));
    checkinBooking(bk);
  };
  $('btn-preview-checkout').onclick = () => {
    const code = $('qr-checkout-input').value.trim().toUpperCase();
    const ses = state.sessions.find((s) => s.status === 'ACTIVE' && (s.qr_token.toUpperCase() === code || s.license_plate.toUpperCase() === code));
    if (!ses) return toast('⚠️ Không có xe đang đỗ khớp mã/biển số này');
    openCheckout(ses.id);
  };

  const runSim = async () => {
    const r = await calcFee('CAR', Number($('sim-rate').value) || 20000, Number($('sim-minutes').value) || 60, $('sim-overtime').value === 'true');
    $('sim-result-box').innerHTML = `Tính <strong>${r.billableHours} giờ</strong> • Phí cơ bản <strong>${fmtVND(r.baseFee)}</strong> • Phụ phí <strong>${fmtVND(r.overtimeSurcharge)}</strong> → Tổng <strong style="color:var(--brand-color)">${fmtVND(r.totalFee)}</strong>`;
  };
  ['sim-rate', 'sim-minutes', 'sim-overtime'].forEach((id) => $(id).addEventListener('input', runSim));

  await probeCpp();
  await syncAll(true);
  runSim();

  // Tự động đồng bộ dữ liệu thời gian thực mỗi 5 giây và khi quay lại cửa sổ
  setInterval(() => syncAll(true), 5000);
  window.addEventListener('focus', () => syncAll(true));
});
