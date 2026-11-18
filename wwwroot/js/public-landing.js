/* ==========================================================================
   SmartPark — Customer Portal (PSang275 Scope: US02, US07, US08, US16, US17, US28)
   - US02: 150-slot real-time map across 4 zones (EV, NT, TH, VIP)
   - US07: Online booking by time window with anti-conflict & Basement B1 PCCC EV lock
   - US08: Instant SVG QR Ticket generation upon booking confirmation
   - US28: Fixed-slot Monthly Pass registration & renewal (1-3-6-12 months, -5% to -15%, anti-duplicate slot lock)
   ========================================================================== */

(() => {
  'use strict';

  const ICON_PATHS = {
    'square-parking': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    'plug-zap': '<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="m2 22 3-3"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m18 3-4 4h6l-4 4"/>',
    'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    'car': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    'bike': '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'warehouse': '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    'ticket': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'user-circle': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
    'id-card': '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'
  };

  function iconSvg(name, size = 16) {
    const body = ICON_PATHS[name] || '';
    return `<svg class="lucide" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll('i[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      const size = Number(el.getAttribute('data-size')) || 16;
      el.outerHTML = iconSvg(name, size);
    });
  }

  const ZONES = {
    EV:  { code: 'EV',  dbZone: 'ZONE-EV', name: 'Zone EV — Khu Chuyên biệt Xe Điện', subtitle: '12 trụ sạc VinFast • Vách ngăn PCCC', total: 37, allowEV: true },
    NT:  { code: 'NT',  dbZone: 'ZONE-NT', name: 'Zone NT — Khu Ngoài Trời',           subtitle: 'Bãi mặt đất • Sát lối ra chính',     total: 65, allowEV: false },
    TH:  { code: 'TH',  dbZone: 'ZONE-TH', name: 'Zone TH — Tầng Hầm B1',              subtitle: 'Quy định PCCC: Chỉ nhận xe xăng',     total: 40, allowEV: false },
    VIP: { code: 'VIP', dbZone: 'ZONE-VIP', name: 'Zone VIP — Khu VIP Mái Che',         subtitle: 'Mái che riêng • Sát cổng chính',      total: 8,  allowEV: false }
  };

  const VEHICLE_META = {
    EV_CAR:   { label: 'Ô tô điện',   icon: 'car',  isEV: true,  isBike: false },
    EV_BIKE:  { label: 'Xe máy điện', icon: 'bike', isEV: true,  isBike: true  },
    GAS_CAR:  { label: 'Ô tô xăng',   icon: 'car',  isEV: false, isBike: false },
    GAS_BIKE: { label: 'Xe máy xăng', icon: 'bike', isEV: false, isBike: true  }
  };

  const STATUS_LABEL = {
    AVAILABLE: 'Còn trống',
    OCCUPIED:  'Đang đỗ',
    CHARGING:  'Đang sạc',
    RESERVED:  'Đã đặt trước'
  };

  function buildInitialSlots() {
    const slots = [];
    function distribute(total, counts) {
      const pool = [];
      for (const [status, n] of counts) {
        for (let i = 0; i < n; i++) pool.push(status);
      }
      const out = new Array(total);
      let idx = 0;
      for (let i = 0; i < total; i++) {
        while (out[idx] !== undefined) idx = (idx + 1) % total;
        out[idx] = pool[i];
        idx = (idx + 3) % total;
      }
      return out;
    }

    function addGroup(zone, prefix, count, vehicleType, rateText, hourlyRate, statusCounts) {
      const statuses = distribute(count, statusCounts);
      for (let i = 1; i <= count; i++) {
        const num = String(i).padStart(2, '0');
        slots.push({
          code: `${zone}-${prefix}${num}`,
          zone,
          vehicleType,
          rateText,
          hourlyRate,
          status: statuses[i - 1]
        });
      }
    }

    addGroup('EV', 'O', 12, 'EV_CAR',  '20.000đ/giờ + 4.500đ/kWh', 20000, [['AVAILABLE', 4], ['CHARGING', 5], ['OCCUPIED', 2], ['RESERVED', 1]]);
    addGroup('EV', 'X', 25, 'EV_BIKE', '5.000đ/4h + 4.500đ/kWh',   5000,  [['AVAILABLE', 9], ['CHARGING', 7], ['OCCUPIED', 8], ['RESERVED', 1]]);
    addGroup('NT', 'O', 20, 'GAS_CAR',  '15.000đ/giờ', 15000, [['AVAILABLE', 7],  ['OCCUPIED', 11], ['RESERVED', 2]]);
    addGroup('NT', 'X', 45, 'GAS_BIKE', '5.000đ/4h',   5000,  [['AVAILABLE', 16], ['OCCUPIED', 26], ['RESERVED', 3]]);
    addGroup('TH', 'O', 10, 'GAS_CAR',  '20.000đ/giờ', 20000, [['AVAILABLE', 3],  ['OCCUPIED', 6],  ['RESERVED', 1]]);
    addGroup('TH', 'X', 30, 'GAS_BIKE', '5.000đ/4h',   5000,  [['AVAILABLE', 10], ['OCCUPIED', 19], ['RESERVED', 1]]);
    addGroup('VIP', 'O', 8, 'GAS_CAR',  '30.000đ/giờ', 30000, [['AVAILABLE', 3], ['OCCUPIED', 3], ['RESERVED', 2]]);

    return slots;
  }

  const state = {
    slots: buildInitialSlots(),
    bookings: [],
    monthlyPasses: [],
    selectedMonths: 1
  };

  const $ = (id) => document.getElementById(id);
  const vnd = (n) => `${Math.round(n).toLocaleString('vi-VN')}đ`;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(message) {
    const stack = $('toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function makeQrSvg(text, cellSize = 4) {
    if (typeof window.qrcode === 'function') {
      const qr = window.qrcode(0, 'M');
      qr.addData(String(text || 'SMARTPARK'));
      qr.make();
      return qr.createSvgTag({ cellSize, margin: 2 });
    }
    return '';
  }

  function fmtDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  function fmtDateOnly(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  async function syncFromServer() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      state.bookings = data.bookings || [];
      state.monthlyPasses = data.monthlyPasses || [];

      if (Array.isArray(data.slots) && data.slots.length) {
        const serverMap = new Map(data.slots.map((s) => [s.slot_code, s]));
        state.slots.forEach((loc) => {
          const sv = serverMap.get(loc.code);
          if (sv) {
            if (sv.status === 'AVAILABLE') loc.status = 'AVAILABLE';
            else if (sv.status === 'RESERVED') loc.status = 'RESERVED';
            else if (sv.status === 'OCCUPIED' && loc.status !== 'CHARGING') loc.status = 'OCCUPIED';
            loc.currentPlate = sv.current_plate || null;
          }
        });
      }

      updateCounters();
      renderSlotMap();
      populateMonthlySlotDropdown();
      renderActiveMonthlyPasses();
    } catch {}
  }

  function updateCounters() {
    const availCount = state.slots.filter((s) => s.status === 'AVAILABLE').length;
    const heroEl = $('hero-available');
    if (heroEl) heroEl.textContent = availCount;

    for (const zKey of Object.keys(ZONES)) {
      const zSlots = state.slots.filter((s) => s.zone === zKey);
      const free = zSlots.filter((s) => s.status === 'AVAILABLE').length;
      const freeEl = document.querySelector(`[data-zone-free="${zKey}"]`);
      if (freeEl) freeEl.textContent = free;
      const meterEl = document.querySelector(`[data-zone-meter="${zKey}"]`);
      if (meterEl) {
        const occupiedPct = Math.round(((zSlots.length - free) / zSlots.length) * 100);
        meterEl.style.width = `${occupiedPct}%`;
      }
    }
  }

  // =========================================================================
  // US02: Render 150-slot real-time visual map across 4 zones
  // =========================================================================
  function renderSlotMap() {
    const container = $('slot-map');
    if (!container) return;

    const totalAvail = state.slots.filter((s) => s.status === 'AVAILABLE').length;
    const resultEl = $('map-result');
    if (resultEl) {
      resultEl.textContent = `Tổng 150 vị trí đỗ (${totalAvail} ô còn trống sẵn sàng đặt chỗ)`;
    }

    const html = [];
    for (const zKey of Object.keys(ZONES)) {
      const zSlots = state.slots.filter((s) => s.zone === zKey);
      const zFree = zSlots.filter((s) => s.status === 'AVAILABLE').length;
      const zInfo = ZONES[zKey];

      const cells = zSlots.map((s) => {
        const vMeta = VEHICLE_META[s.vehicleType];
        const sClass = `is-${s.status.toLowerCase()}`;
        const statusText = STATUS_LABEL[s.status];
        const title = `${s.code} • ${vMeta.label} • ${statusText} • ${s.rateText}`;

        return `<button type="button" class="slot ${sClass}" data-slot="${s.code}" title="${esc(title)}" aria-label="${esc(title)}">
          <span class="slot-top">
            <i class="dot dot-${s.status.toLowerCase()}"></i>
            <span class="slot-icon">${iconSvg(vMeta.icon, 13)}</span>
          </span>
          <span class="slot-code num">${s.code}</span>
          <span class="slot-state">${statusText}</span>
        </button>`;
      }).join('');

      html.push(`<section class="zone-group" aria-label="${esc(zInfo.name)}">
        <header class="zone-group-head">
          <div class="zone-group-title">
            <span class="zone-tag zone-tag-${zKey.toLowerCase()}">ZONE ${zKey}</span>
            <h3>${esc(zInfo.name)}</h3>
            <span class="zone-group-sub">${esc(zInfo.subtitle)}</span>
          </div>
          <span class="zone-group-count num">${zFree}/${zInfo.total} trống</span>
        </header>
        <div class="slot-grid">${cells}</div>
      </section>`);
    }

    container.innerHTML = html.join('');
    container.querySelectorAll('.slot').forEach((btn) => {
      btn.addEventListener('click', () => onSlotClick(btn.getAttribute('data-slot')));
    });
  }

  function openInfoDialog(kicker, title, bodyHtml) {
    const dlg = $('info-dialog');
    if (!dlg) return;
    $('info-dialog-kicker').textContent = kicker;
    $('info-dialog-title').textContent = title;
    $('info-dialog-body').innerHTML = bodyHtml;
    if (!dlg.open) dlg.showModal();
  }

  // =========================================================================
  // US08 (PSang275): Sinh mã vé QR đặt chỗ sau khi xác nhận
  // =========================================================================
  function showBookingQrTicketModal(bk) {
    const svg = makeQrSvg(bk.booking_code, 4);
    openInfoDialog(
      'VÉ ĐIỆN TỬ ĐẶT CHỖ TRỰC TUYẾN',
      `Mã vé QR Đặt chỗ — Ô ${bk.slot_code}`,
      `<div class="qr-ticket-card">
        <div class="qr-canvas-box">${svg}</div>
        <span class="qr-code-pill num">${esc(bk.booking_code)}</span>
        <p class="sp-hint">Xuất trình mã vé QR này trước Camera tại Trạm kiểm soát cổng khi xe vào hoặc ra bãi.</p>
        <div class="qr-ticket-meta">
          <dl class="ticket-rows">
            <dt>Vị trí ô đỗ đã giữ</dt><dd class="num">${esc(bk.slot_code)}</dd>
            <dt>Biển số đăng ký</dt><dd class="num">${esc(bk.license_plate)}</dd>
            <dt>Chủ phương tiện</dt><dd>${esc(bk.customer_name)} (${esc(bk.customer_phone || '—')})</dd>
            <dt>Khung giờ đặt</dt><dd class="num">${fmtDateTime(bk.start_time)} → ${fmtDateTime(bk.end_time)}</dd>
            <dt>Trạng thái ô đỗ</dt><dd>Đã khóa giữ chỗ (RESERVED)</dd>
          </dl>
        </div>
      </div>`
    );
  }

  // =========================================================================
  // US07 (PSang275): Đặt chỗ đỗ xe trực tuyến theo khung giờ dự kiến &
  // kiểm tra chống trùng lịch + khóa PCCC tầng hầm B1
  // =========================================================================
  function openCustomerBookingModal(slot) {
    let auth = null;
    try { auth = JSON.parse(localStorage.getItem('smartpark_auth_user') || 'null'); } catch {}

    const defaultName = auth?.fullName ? auth.fullName.replace(/\s*\(.*?\)\s*/g, '').trim() : 'Phạm Minh Khách';
    const defaultPhone = auth?.phone || '0906789012';
    const zMeta = ZONES[slot.zone];

    const now = new Date();
    const start = new Date(now.getTime() + 15 * 60000);
    const end = new Date(start.getTime() + 2 * 3600000);
    const toLocalInput = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    openInfoDialog(
      `ĐẶT CHỖ TRỰC TUYẾN • ZONE ${slot.zone}`,
      `Đặt giữ chỗ vị trí ${slot.code}`,
      `<form id="cust-booking-form" class="sp-form" novalidate>
        <div class="sp-slot-summary">
          <div>
            <div class="sp-slot-code num">Vị trí ô ${esc(slot.code)}</div>
            <div class="sp-slot-zone">${esc(zMeta.name)}</div>
          </div>
          <span class="sp-slot-rate num">${esc(slot.rateText)}</span>
        </div>

        <div class="sp-field-grid">
          <div class="sp-field">
            <label class="sp-label" for="cbk-vehicle-type">Loại phương tiện *</label>
            <select id="cbk-vehicle-type" class="sp-select">
              <option value="GAS_CAR" ${slot.vehicleType === 'GAS_CAR' ? 'selected' : ''}>Ô tô xăng</option>
              <option value="GAS_BIKE" ${slot.vehicleType === 'GAS_BIKE' ? 'selected' : ''}>Xe máy xăng</option>
              <option value="EV_CAR" ${slot.vehicleType === 'EV_CAR' ? 'selected' : ''}>Ô tô điện (VinFast EV)</option>
              <option value="EV_BIKE" ${slot.vehicleType === 'EV_BIKE' ? 'selected' : ''}>Xe máy điện</option>
            </select>
          </div>
          <div class="sp-field">
            <label class="sp-label" for="cbk-plate">Biển số xe *</label>
            <input type="text" id="cbk-plate" class="sp-input num" required placeholder="VD: 51K-888.99" value="51K-901.23" autocomplete="off">
          </div>
        </div>

        <div class="sp-pccc-alert" id="cbk-pccc-alert" role="alert" hidden>
          ${iconSvg('flame', 18)}
          <span><strong>Khóa an toàn PCCC:</strong> Tầng hầm B1 (Zone TH) chỉ nhận xe xăng, không nhận đặt chỗ cho xe điện. Vui lòng chọn ô tại Zone EV.</span>
        </div>

        <div class="sp-field-grid">
          <div class="sp-field">
            <label class="sp-label" for="cbk-name">Họ và tên khách hàng *</label>
            <input type="text" id="cbk-name" class="sp-input" required value="${esc(defaultName)}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="cbk-phone">Số điện thoại *</label>
            <input type="tel" id="cbk-phone" class="sp-input num" required value="${esc(defaultPhone)}">
          </div>
        </div>

        <div class="sp-field-grid">
          <div class="sp-field">
            <label class="sp-label" for="cbk-start">Giờ vào dự kiến *</label>
            <input type="datetime-local" id="cbk-start" class="sp-input num" required value="${toLocalInput(start)}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="cbk-end">Giờ ra dự kiến *</label>
            <input type="datetime-local" id="cbk-end" class="sp-input num" required value="${toLocalInput(end)}">
          </div>
        </div>

        <button type="submit" class="btn btn-emerald btn-block" id="cbk-submit-btn">
          ${iconSvg('qr-code', 16)}
          <span>Xác nhận Đặt chỗ &amp; Sinh Mã Vé QR</span>
        </button>
      </form>`
    );

    const vTypeSelect = $('cbk-vehicle-type');
    const pcccAlert = $('cbk-pccc-alert');
    const submitBtn = $('cbk-submit-btn');

    function checkPcccConstraint() {
      const selectedType = vTypeSelect?.value || 'GAS_CAR';
      const isEv = selectedType === 'EV_CAR' || selectedType === 'EV_BIKE';
      const blockedByPccc = slot.zone === 'TH' && isEv;
      if (pcccAlert) pcccAlert.hidden = !blockedByPccc;
      if (submitBtn) submitBtn.disabled = blockedByPccc;
      return !blockedByPccc;
    }

    vTypeSelect?.addEventListener('change', checkPcccConstraint);
    checkPcccConstraint();

    $('cust-booking-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!checkPcccConstraint()) {
        toast('Tầng hầm B1 không nhận xe điện theo quy định PCCC.');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      const payload = {
        slotCode: slot.code,
        licensePlate: $('cbk-plate')?.value,
        vehicleType: vTypeSelect?.value || slot.vehicleType,
        customerName: $('cbk-name')?.value,
        customerPhone: $('cbk-phone')?.value,
        startTime: $('cbk-start')?.value ? new Date($('cbk-start').value).toISOString() : null,
        endTime: $('cbk-end')?.value ? new Date($('cbk-end').value).toISOString() : null
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (submitBtn) submitBtn.disabled = false;

      if (!res.ok) {
        toast(data.message || 'Không thể đặt chỗ do trùng lịch.');
        return;
      }

      toast(data.message || 'Đặt chỗ thành công!');
      await syncFromServer();
      if (data.booking) {
        showBookingQrTicketModal(data.booking);
      }
    });
  }

  function getLoggedInCustomer() {
    try {
      const auth = JSON.parse(localStorage.getItem('smartpark_auth_user') || 'null');
      if (!auth || !auth.username) return null;
      const cleanName = (auth.fullName || auth.username || '').replace(/\s*\(.*?\)\s*/g, '').trim();
      return {
        username: auth.username,
        cleanName,
        phone: (auth.phone || '').trim()
      };
    } catch {
      return null;
    }
  }

  function isOwnedByCurrentUser(recordCustomerName, recordPhone, user) {
    if (!user) return false;
    const rName = (recordCustomerName || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
    const uName = (user.cleanName || '').toLowerCase();
    if (uName && rName && rName === uName) return true;
    if (user.phone && recordPhone && recordPhone.trim() === user.phone) return true;
    return false;
  }

  function openCustomerBookingsListModal() {
    const user = getLoggedInCustomer();
    const myBookings = user
      ? state.bookings.filter((b) => isOwnedByCurrentUser(b.customer_name, b.customer_phone, user))
      : [];

    const listHtml = myBookings.map((b) => `
      <div class="booking-list-item">
        <div>
          <strong class="num">${esc(b.booking_code)}</strong>
          <span class="num"> • Ô ${esc(b.slot_code)} (${esc(b.license_plate)})</span>
          <div class="sp-hint num">${fmtDateTime(b.start_time)} → ${fmtDateTime(b.end_time)}</div>
        </div>
        <button type="button" class="btn btn-emerald" data-cust-view-qr="${esc(b.booking_code)}">
          Xem Vé QR
        </button>
      </div>
    `).join('');

    openInfoDialog(
      'DANH SÁCH VÉ ĐẶT CHỖ CÁ NHÂN',
      `Lịch đặt chỗ & Vé QR của tôi (${myBookings.length} vé)`,
      `<div class="booking-list">
        ${listHtml || '<p class="sp-hint">Tài khoản của bạn chưa có vé đặt chỗ nào. Hãy bấm vào một ô màu xanh lá trên sơ đồ 150 chỗ để đặt lịch.</p>'}
      </div>`
    );

    document.querySelectorAll('[data-cust-view-qr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-cust-view-qr');
        const found = myBookings.find((x) => x.booking_code === code);
        if (found) showBookingQrTicketModal(found);
      });
    });
  }

  function onSlotClick(code) {
    const slot = state.slots.find((s) => s.code === code);
    if (!slot) return;

    if (slot.status === 'AVAILABLE') {
      openCustomerBookingModal(slot);
      return;
    }

    const user = getLoggedInCustomer();
    if (slot.status === 'RESERVED' && user) {
      const myPass = state.monthlyPasses.find(
        (m) => m.slot_code === slot.code && m.status === 'ACTIVE' && isOwnedByCurrentUser(m.customer_name, m.customer_phone, user)
      );
      if (myPass) {
        showMonthlyPassQrModal(myPass);
        return;
      }
      const myBk = state.bookings.find(
        (b) => b.slot_code === slot.code && isOwnedByCurrentUser(b.customer_name, b.customer_phone, user)
      );
      if (myBk) {
        showBookingQrTicketModal(myBk);
        return;
      }
    }

    toast(`Ô ${slot.code} hiện đang ở trạng thái "${STATUS_LABEL[slot.status]}". Vui lòng bấm vào một ô màu xanh lá (Còn trống) để đặt chỗ.`);
  }

  // =========================================================================
  // US28 (PSang275): Đăng ký & gia hạn gói vé tháng cố định chỗ
  // (ưu đãi 1-3-6-12 tháng: 0%, -5%, -10%, -15% & khóa trùng ô)
  // =========================================================================
  function computeMonthlyPriceClient(zoneKey, vehicleType, months) {
    const isBike = vehicleType === 'GAS_BIKE' || vehicleType === 'EV_BIKE';
    const isEv = vehicleType === 'EV_CAR' || vehicleType === 'EV_BIKE' || zoneKey === 'EV';

    let baseMonthly = 1200000;
    if (isBike) {
      baseMonthly = isEv ? 300000 : 250000;
    } else if (zoneKey === 'VIP') {
      baseMonthly = 2200000;
    } else if (zoneKey === 'EV') {
      baseMonthly = 1600000;
    } else if (zoneKey === 'TH') {
      baseMonthly = 1500000;
    }

    const discount = months === 12 ? 15 : months === 6 ? 10 : months === 3 ? 5 : 0;
    const total = Math.round(baseMonthly * months * ((100 - discount) / 100));
    return { baseMonthly, discount, total };
  }

  function populateMonthlySlotDropdown() {
    const zoneKey = $('mp-zone')?.value || 'NT';
    const vType = $('mp-vehicle-type')?.value || 'GAS_CAR';
    const slotSelect = $('mp-slot-select');
    const pcccWarn = $('mp-pccc-warning');
    const submitBtn = $('mp-submit-btn');

    const isEv = vType === 'EV_CAR' || vType === 'EV_BIKE';
    const isBike = vType === 'GAS_BIKE' || vType === 'EV_BIKE';
    const pcccBlocked = zoneKey === 'TH' && isEv;

    if (pcccWarn) pcccWarn.hidden = !pcccBlocked;

    const { baseMonthly, discount, total } = computeMonthlyPriceClient(zoneKey, vType, state.selectedMonths);
    if ($('mp-price-formula')) {
      $('mp-price-formula').textContent = `Đơn giá: ${vnd(baseMonthly)}/tháng × ${state.selectedMonths} tháng`;
    }
    if ($('mp-price-total')) {
      $('mp-price-total').textContent = vnd(total);
    }
    if ($('mp-discount-badge')) {
      $('mp-discount-badge').textContent = discount > 0 ? `Ưu đãi -${discount}%` : 'Không chiết khấu';
    }

    if (!slotSelect) return;
    if (pcccBlocked) {
      slotSelect.innerHTML = '<option value="">Khóa PCCC: Tầng hầm B1 không nhận xe điện</option>';
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    // Lọc các ô đang AVAILABLE trong phân khu (chống trùng ô với ô đang đỗ hoặc đã khóa vé tháng)
    const lockedByPasses = new Set(state.monthlyPasses.filter((m) => m.status === 'ACTIVE').map((m) => m.slot_code));
    const availableSlots = state.slots.filter((s) => {
      if (s.zone !== zoneKey) return false;
      if (s.status !== 'AVAILABLE' || lockedByPasses.has(s.code)) return false;
      const slotIsBike = s.code.includes('-X');
      return isBike ? slotIsBike : !slotIsBike;
    });

    if (!availableSlots.length) {
      slotSelect.innerHTML = '<option value="">Không còn ô trống phù hợp trong phân khu này</option>';
      if (submitBtn) submitBtn.disabled = true;
    } else {
      slotSelect.innerHTML = availableSlots.map((s) =>
        `<option value="${esc(s.code)}">Ô cố định ${esc(s.code)} — Còn trống (${esc(s.rateText)})</option>`
      ).join('');
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function showMonthlyPassQrModal(pass) {
    const svg = makeQrSvg(pass.pass_code, 4);
    openInfoDialog(
      'THẺ VÉ THÁNG CỐ ĐỊNH CHỖ',
      `Vé tháng ${pass.pass_code} — Ô ${pass.slot_code}`,
      `<div class="qr-ticket-card">
        <div class="qr-canvas-box">${svg}</div>
        <span class="qr-code-pill num">${esc(pass.pass_code)}</span>
        <p class="sp-hint">Vị trí ô <strong>${esc(pass.slot_code)}</strong> đã được khóa cố định riêng cho biển số <strong>${esc(pass.license_plate)}</strong>.</p>
        <div class="qr-ticket-meta">
          <dl class="ticket-rows">
            <dt>Ô đỗ khóa cố định</dt><dd class="num">${esc(pass.slot_code)} (${esc(pass.zone_code)})</dd>
            <dt>Biển số xe</dt><dd class="num">${esc(pass.license_plate)}</dd>
            <dt>Chủ vé tháng</dt><dd>${esc(pass.customer_name)} (${esc(pass.customer_phone)})</dd>
            <dt>Tổng kỳ hạn</dt><dd class="num">${pass.months} tháng (Ưu đãi -${pass.discount_percent}%)</dd>
            <dt>Hiệu lực đến</dt><dd class="num">${fmtDateOnly(pass.end_date)}</dd>
            <dt>Tổng phí đã tính</dt><dd class="num">${vnd(pass.total_amount)}</dd>
          </dl>
        </div>
      </div>`
    );
  }

  function renderActiveMonthlyPasses() {
    const listEl = $('mp-active-list');
    if (!listEl) return;

    const user = getLoggedInCustomer();
    if (!user) {
      listEl.innerHTML = `
        <div class="mp-pass-item">
          <div class="mp-pass-details">
            <strong>Bạn chưa đăng nhập tài khoản Khách hàng</strong>
            <p class="sp-hint">Để bảo mật thông tin phương tiện và vé QR cá nhân, vui lòng đăng nhập để xem hoặc gia hạn gói vé tháng cố định chỗ của riêng bạn.</p>
          </div>
          <a href="/Account/Login" class="btn btn-outline">Đăng nhập để xem vé tháng của tôi</a>
        </div>`;
      return;
    }

    const myPasses = state.monthlyPasses.filter((m) =>
      isOwnedByCurrentUser(m.customer_name, m.customer_phone, user)
    );

    if (!myPasses.length) {
      listEl.innerHTML = `<p class="sp-hint">Tài khoản <strong>${esc(user.cleanName)}</strong> hiện chưa có gói vé tháng cố định chỗ nào. Hãy chọn kỳ hạn và vị trí ô trống ở biểu mẫu bên trái để đăng ký.</p>`;
      return;
    }

    listEl.innerHTML = myPasses.map((m) => `
      <article class="mp-pass-item">
        <div class="mp-pass-top">
          <span class="mp-pass-code num">${esc(m.pass_code)} • Ô cố định ${esc(m.slot_code)}</span>
          <span class="mp-badge-active">Đang hiệu lực (-${m.discount_percent}%)</span>
        </div>
        <div class="mp-pass-details">
          <div>Biển số: <strong class="num">${esc(m.license_plate)}</strong> • Chủ xe: <strong>${esc(m.customer_name)}</strong></div>
          <div class="num">Kỳ hạn tích lũy: <strong>${m.months} tháng</strong> • Hiệu lực đến: <strong>${fmtDateOnly(m.end_date)}</strong></div>
          <div class="num">Tổng cước: <strong>${vnd(m.total_amount)}</strong></div>
        </div>
        <div class="mp-renew-bar">
          <select class="mp-renew-select num" data-renew-select="${m.id}" aria-label="Chọn số tháng gia hạn">
            <option value="1">Gia hạn +1 tháng (0%)</option>
            <option value="3" selected>Gia hạn +3 tháng (-5%)</option>
            <option value="6">Gia hạn +6 tháng (-10%)</option>
            <option value="12">Gia hạn +12 tháng (-15%)</option>
          </select>
          <button type="button" class="btn btn-emerald" data-renew-btn="${m.id}">Gia hạn</button>
          <button type="button" class="btn btn-outline" data-view-mp-qr="${m.id}">Vé QR</button>
        </div>
      </article>
    `).join('');

    listEl.querySelectorAll('[data-renew-btn]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-renew-btn'));
        const sel = listEl.querySelector(`[data-renew-select="${id}"]`);
        const addMonths = Number(sel?.value || 3);

        btn.disabled = true;
        const res = await fetch(`/api/monthly-passes/${id}/renew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addMonths })
        });
        const data = await res.json();
        btn.disabled = false;

        if (!res.ok) {
          toast(data.message || 'Không thể gia hạn gói vé tháng.');
          return;
        }
        toast(data.message || 'Đã gia hạn gói vé tháng thành công!');
        await syncFromServer();
      });
    });

    listEl.querySelectorAll('[data-view-mp-qr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-view-mp-qr'));
        const found = myPasses.find((x) => x.id === id);
        if (found) showMonthlyPassQrModal(found);
      });
    });
  }

  // =========================================================================
  // US17 (PSang275): Account Dropdown Menu & Header
  // =========================================================================
  function formatUserDisplayName(auth) {
    const rawName = (auth.fullName || auth.username || '').trim();
    const roleLabel = (auth.roleLabel || 'Khách Hàng').trim();
    if (rawName.includes('(') && rawName.includes(')')) return rawName;
    return `${rawName} (${roleLabel})`;
  }

  function openAccountMenuSection(action, auth) {
    if (action === 'my-bookings') {
      openCustomerBookingsListModal();
      return;
    }
    if (action === 'my-monthly-passes') {
      $('goi-ve-thang')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const cleanName = (auth.fullName || auth.username || '').replace(/\s*\(.*?\)\s*/g, '').trim();
    const roleLabel = auth.roleLabel || 'Khách hàng';

    openInfoDialog(
      'THÔNG TIN TÀI KHOẢN',
      'Hồ sơ cá nhân',
      `<dl class="ticket-rows">
        <dt>Họ và tên</dt><dd>${esc(cleanName)}</dd>
        <dt>Tên đăng nhập</dt><dd class="num">${esc(auth.username)}</dd>
        <dt>Vai trò hệ thống</dt><dd>${esc(roleLabel)}</dd>
        <dt>Số điện thoại</dt><dd class="num">${esc(auth.phone || '0906789012')}</dd>
      </dl>`
    );
  }

  function hydrateLoggedInUser() {
    try {
      const auth = JSON.parse(localStorage.getItem('smartpark_auth_user') || 'null');
      const guestBtn = $('nav-guest-login');
      const userWrap = $('nav-user-wrap');
      const welcomeBanner = $('welcome-banner');
      const welcomeText = $('welcome-banner-text');

      if (!auth || !auth.username) {
        if (guestBtn) {
          guestBtn.hidden = false;
          guestBtn.style.display = '';
        }
        if (userWrap) userWrap.hidden = true;
        if (welcomeBanner) welcomeBanner.hidden = true;
        return;
      }

      const displayName = formatUserDisplayName(auth);
      const roleSubtitle = auth.roleLabel || 'Khách hàng';

      if (guestBtn) {
        guestBtn.hidden = true;
        guestBtn.style.display = 'none';
      }
      if (userWrap) {
        userWrap.hidden = false;
        userWrap.style.display = '';
      }

      if ($('account-trigger-label')) $('account-trigger-label').textContent = displayName;
      if ($('dropdown-user-name')) $('dropdown-user-name').textContent = displayName;
      if ($('dropdown-user-role')) $('dropdown-user-role').textContent = roleSubtitle;

      const cleanName = (auth.fullName || '').replace(/\s*\(.*?\)\s*/g, '').trim();
      if (cleanName && $('mp-customer-name')) $('mp-customer-name').value = cleanName;
      if (auth.phone && $('mp-customer-phone')) $('mp-customer-phone').value = auth.phone;

      if (welcomeBanner && welcomeText) {
        welcomeText.textContent = `Đăng nhập thành công! Chào mừng ${displayName}.`;
        welcomeBanner.hidden = false;
      }

      const triggerBtn = $('account-trigger-btn');
      const dropdown = $('account-dropdown');

      if (triggerBtn && dropdown) {
        triggerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const willOpen = dropdown.hidden;
          dropdown.hidden = !willOpen;
          triggerBtn.setAttribute('aria-expanded', String(willOpen));
        });

        document.addEventListener('click', (e) => {
          if (!dropdown.hidden && !userWrap.contains(e.target)) {
            dropdown.hidden = true;
            triggerBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      document.querySelectorAll('[data-menu-action]').forEach((itemBtn) => {
        itemBtn.addEventListener('click', () => {
          const action = itemBtn.getAttribute('data-menu-action');
          if (dropdown) dropdown.hidden = true;
          if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
          openAccountMenuSection(action, auth);
        });
      });

      $('account-logout-btn')?.addEventListener('click', () => {
        try { localStorage.removeItem('smartpark_auth_user'); } catch {}
        window.location.href = '/';
      });
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    hydrateIcons();
    hydrateLoggedInUser();
    updateCounters();
    renderSlotMap();
    populateMonthlySlotDropdown();
    renderActiveMonthlyPasses();
    syncFromServer();

    $('nav-quick-book-btn')?.addEventListener('click', () => {
      const firstAvail = state.slots.find((s) => s.status === 'AVAILABLE');
      if (firstAvail) {
        openCustomerBookingModal(firstAvail);
      } else {
        $('so-do-bai-xe')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.querySelectorAll('#mp-term-tabs .seg').forEach((segBtn) => {
      segBtn.addEventListener('click', () => {
        state.selectedMonths = Number(segBtn.getAttribute('data-months')) || 1;
        document.querySelectorAll('#mp-term-tabs .seg').forEach((b) => {
          const active = b === segBtn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        populateMonthlySlotDropdown();
      });
    });

    $('mp-zone')?.addEventListener('change', populateMonthlySlotDropdown);
    $('mp-vehicle-type')?.addEventListener('change', populateMonthlySlotDropdown);

    $('mp-register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const slotCode = $('mp-slot-select')?.value;
      const licensePlate = $('mp-plate')?.value?.trim();
      if (!slotCode) {
        toast('Vui lòng chọn một vị trí ô cố định còn trống.');
        return;
      }
      if (!licensePlate) {
        toast('Vui lòng nhập biển số xe đăng ký vé tháng.');
        return;
      }

      const submitBtn = $('mp-submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        customerName: $('mp-customer-name')?.value,
        customerPhone: $('mp-customer-phone')?.value,
        licensePlate,
        vehicleType: $('mp-vehicle-type')?.value,
        slotCode,
        months: state.selectedMonths
      };

      const res = await fetch('/api/monthly-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (submitBtn) submitBtn.disabled = false;

      if (!res.ok) {
        toast(data.message || 'Không thể đăng ký vé tháng.');
        return;
      }

      toast(data.message || 'Đăng ký vé tháng thành công!');
      if ($('mp-plate')) $('mp-plate').value = '';
      await syncFromServer();
      if (data.pass) {
        showMonthlyPassQrModal(data.pass);
      }
    });

    const dlg = $('info-dialog');
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => dlg?.close());
    });
    dlg?.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
  });
})();
