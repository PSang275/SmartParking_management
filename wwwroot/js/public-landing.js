/**
 * SmartPark — Giao diện Trang chủ, Sơ đồ 150 Ô đỗ & Tài khoản (Sprint 1 - PSang275)
 * Phong cách Minimalist SaaS phối Xanh Rừng Đậm (Forest Emerald) - Trắng - Đen
 * Sử dụng Lucide Icons nét mảnh 1.5px (không dùng emoji).
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
   * 1. LUCIDE ICONS (1.5px stroke, monochrome technical icons — no emojis)
   * ------------------------------------------------------------------------ */
  const LUCIDE_PATHS = {
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'square-parking': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    'plug-zap': '<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="m2 22 3-3"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m18 3-4 4h6l-4 4"/>',
    'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    'car': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    'bike': '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'warehouse': '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'ticket': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'user-circle': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'id-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h4"/><path d="M14 9h4"/><path d="M6 13h2"/><path d="M14 13h4"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'
  };

  function iconSvg(name, size = 16) {
    const body = LUCIDE_PATHS[name] || LUCIDE_PATHS.info;
    return `<svg class="lucide" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll('i[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      const size = Number(el.getAttribute('data-size') || 16);
      el.outerHTML = iconSvg(name, size);
    });
  }

  /* ------------------------------------------------------------------------
   * 2. ZONE & 150-SLOT SPECIFICATION (Exact counts: 52 / 75 / 12 / 11 = 150)
   * ------------------------------------------------------------------------ */
  const ZONES = {
    EV: {
      code: 'EV',
      tagClass: 'zone-tag-ev',
      name: 'Khu Chuyên biệt Xe Điện',
      subtitle: 'Trụ sạc VinFast • Vách ngăn PCCC',
      total: 37
    },
    NT: {
      code: 'NT',
      tagClass: 'zone-tag-nt',
      name: 'Khu Ngoài Trời',
      subtitle: 'Bãi mặt đất thoáng rộng • Ô tô & Xe máy xăng',
      total: 65
    },
    TH: {
      code: 'TH',
      tagClass: 'zone-tag-th',
      name: 'Tầng Hầm B1',
      subtitle: 'Chỉ nhận xe xăng (Quy định an toàn PCCC)',
      total: 40
    },
    VIP: {
      code: 'VIP',
      tagClass: 'zone-tag-vip',
      name: 'Khu VIP Mái Che',
      subtitle: 'Sát cổng chính • Bắt buộc đặt trước',
      total: 8
    }
  };

  const VEHICLE_META = {
    EV_CAR:   { label: 'Ô tô điện',   icon: 'car',  isEv: true,  pricingMode: 'HOURLY', rate: 20000, rateText: '20.000đ/giờ + 4.500đ/kWh' },
    EV_BIKE:  { label: 'Xe máy điện', icon: 'bike', isEv: true,  pricingMode: 'BLOCK4', rate: 5000,  rateText: '5.000đ/4h + 4.500đ/kWh' },
    GAS_CAR:  { label: 'Ô tô xăng',   icon: 'car',  isEv: false, pricingMode: 'HOURLY', rate: 15000, rateText: '15.000đ/giờ' },
    GAS_BIKE: { label: 'Xe máy xăng', icon: 'bike', isEv: false, pricingMode: 'BLOCK4', rate: 5000,  rateText: '5.000đ/4h' }
  };

  const STATUS_LABEL = {
    AVAILABLE: 'Còn trống',
    OCCUPIED: 'Đang đỗ',
    CHARGING: 'Đang sạc',
    RESERVED: 'Đã đặt trước'
  };

  function pad(num, len = 2) {
    return String(num).padStart(len, '0');
  }

  function buildInitialSlots() {
    const list = [];

    function pushGroup(zone, prefix, count, vType, rate, rateText, statusCounts) {
      const pool = [];
      Object.entries(statusCounts).forEach(([st, n]) => {
        for (let i = 0; i < n; i++) pool.push(st);
      });
      const arranged = new Array(count);
      let step = 3;
      let idx = 0;
      for (let i = 0; i < count; i++) {
        while (arranged[idx] !== undefined) {
          idx = (idx + 1) % count;
        }
        arranged[idx] = pool[i];
        idx = (idx + step) % count;
      }

      for (let i = 1; i <= count; i++) {
        const code = `${zone}-${prefix}${pad(i, 2)}`;
        list.push({
          code,
          zone,
          vehicleType: vType,
          groupKey: `${zone}-${prefix}`,
          rate,
          rateText,
          pricingMode: VEHICLE_META[vType].pricingMode,
          status: arranged[i - 1]
        });
      }
    }

    // 1. ZONE EV (37)
    pushGroup('EV', 'O', 12, 'EV_CAR', 20000, '20.000đ/giờ + 4.500đ/kWh', {
      AVAILABLE: 4, CHARGING: 5, OCCUPIED: 2, RESERVED: 1
    });
    pushGroup('EV', 'X', 25, 'EV_BIKE', 5000, '5.000đ/4h + 4.500đ/kWh', {
      AVAILABLE: 9, CHARGING: 7, OCCUPIED: 8, RESERVED: 1
    });

    // 2. ZONE NT (65)
    pushGroup('NT', 'O', 20, 'GAS_CAR', 15000, '15.000đ/giờ', {
      AVAILABLE: 7, OCCUPIED: 11, RESERVED: 2
    });
    pushGroup('NT', 'X', 45, 'GAS_BIKE', 5000, '5.000đ/4h', {
      AVAILABLE: 16, OCCUPIED: 26, RESERVED: 3
    });

    // 3. ZONE TH (40 — Basement B1, Gas vehicles only)
    pushGroup('TH', 'O', 10, 'GAS_CAR', 20000, '20.000đ/giờ', {
      AVAILABLE: 3, OCCUPIED: 6, RESERVED: 1
    });
    pushGroup('TH', 'X', 30, 'GAS_BIKE', 5000, '5.000đ/4h', {
      AVAILABLE: 10, OCCUPIED: 19, RESERVED: 1
    });

    // 4. ZONE VIP (8 — Covered VIP Car bays)
    pushGroup('VIP', 'O', 8, 'GAS_CAR', 30000, '30.000đ/giờ', {
      AVAILABLE: 3, OCCUPIED: 3, RESERVED: 2
    });

    return list;
  }

  /* ------------------------------------------------------------------------
   * 3. STATE & HELPERS
   * ------------------------------------------------------------------------ */
  const state = {
    slots: buildInitialSlots(),
    statusFilter: 'ALL',
    zoneFilter: 'ALL',
    vehicleFilter: 'ALL',
    onlyAvailable: false,
    searchQuery: ''
  };

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const fmtMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

  function toast(message) {
    const stack = $('toast-stack');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    stack.appendChild(item);
    setTimeout(() => item.remove(), 3800);
  }

  /* ------------------------------------------------------------------------
   * 4. RENDER COUNTS, ZONE METERS & 150-SLOT GRID
   * ------------------------------------------------------------------------ */
  function updateCounters() {
    const total = state.slots.length;
    const avail = state.slots.filter((s) => s.status === 'AVAILABLE').length;
    const occ = state.slots.filter((s) => s.status === 'OCCUPIED').length;
    const chg = state.slots.filter((s) => s.status === 'CHARGING').length;
    const res = state.slots.filter((s) => s.status === 'RESERVED').length;

    if ($('hero-available')) $('hero-available').textContent = avail;

    const mapCounts = { ALL: total, AVAILABLE: avail, OCCUPIED: occ, CHARGING: chg, RESERVED: res };
    Object.entries(mapCounts).forEach(([key, val]) => {
      const el = document.querySelector(`[data-count="${key}"]`);
      if (el) el.textContent = val;
    });

    Object.keys(ZONES).forEach((zKey) => {
      const zSlots = state.slots.filter((s) => s.zone === zKey);
      const zFree = zSlots.filter((s) => s.status === 'AVAILABLE').length;
      const freeEl = document.querySelector(`[data-zone-free="${zKey}"]`);
      if (freeEl) freeEl.textContent = zFree;
      const meterEl = document.querySelector(`[data-zone-meter="${zKey}"]`);
      if (meterEl && zSlots.length) {
        const pct = Math.round((zFree / zSlots.length) * 100);
        meterEl.style.width = `${pct}%`;
      }
      const cardEl = document.querySelector(`[data-zone-card="${zKey}"]`);
      if (cardEl) {
        cardEl.classList.toggle('is-selected', state.zoneFilter === zKey);
      }
    });
  }

  function renderSlotMap() {
    const container = $('slot-map');
    if (!container) return;

    const isEvSelected = state.vehicleFilter === 'EV_CAR' || state.vehicleFilter === 'EV_BIKE';
    const pcccNotice = $('pccc-notice');
    if (pcccNotice) {
      pcccNotice.hidden = !isEvSelected;
    }

    const q = state.searchQuery.trim().toUpperCase();
    const zoneOrder = ['EV', 'NT', 'TH', 'VIP'];
    const visibleZones = zoneOrder.filter((z) => state.zoneFilter === 'ALL' || state.zoneFilter === z);

    let shownCount = 0;
    let availShownCount = 0;

    const html = visibleZones.map((zKey) => {
      const zMeta = ZONES[zKey];
      const isBasementLockedByPccc = zKey === 'TH' && isEvSelected;

      const zSlots = state.slots.filter((s) => {
        if (s.zone !== zKey) return false;
        if (q && !s.code.includes(q)) return false;

        if (state.vehicleFilter !== 'ALL' && !isBasementLockedByPccc) {
          if (s.vehicleType !== state.vehicleFilter) return false;
        }
        if (state.onlyAvailable && s.status !== 'AVAILABLE') return false;
        if (state.statusFilter !== 'ALL' && s.status !== state.statusFilter) return false;
        return true;
      });

      if (!zSlots.length) return '';

      shownCount += zSlots.length;
      availShownCount += zSlots.filter((s) => s.status === 'AVAILABLE' && !isBasementLockedByPccc).length;

      const groups = [];
      const carSlots = zSlots.filter((s) => s.groupKey.endsWith('-O'));
      const bikeSlots = zSlots.filter((s) => s.groupKey.endsWith('-X'));

      if (carSlots.length) {
        const sample = carSlots[0];
        groups.push({
          title: `${VEHICLE_META[sample.vehicleType].label} (${carSlots.length} ô) • ${sample.rateText}`,
          icon: 'car',
          slots: carSlots
        });
      }
      if (bikeSlots.length) {
        const sample = bikeSlots[0];
        groups.push({
          title: `${VEHICLE_META[sample.vehicleType].label} (${bikeSlots.length} ô) • ${sample.rateText}`,
          icon: 'bike',
          slots: bikeSlots
        });
      }

      const groupsHtml = groups.map((g) => {
        const cells = g.slots.map((slot) => {
          const vMeta = VEHICLE_META[slot.vehicleType];
          if (isBasementLockedByPccc) {
            return `<button type="button" class="slot is-locked" data-slot="${slot.code}" title="Khóa theo quy định PCCC: Tầng hầm B1 không nhận xe điện">
              <div class="slot-code">${esc(slot.code)}</div>
              <div class="slot-meta">
                <span class="slot-state">Khóa PCCC</span>
                ${iconSvg('lock', 13)}
              </div>
            </button>`;
          }

          const stateClass =
            slot.status === 'AVAILABLE' ? 'is-available' :
            slot.status === 'CHARGING'  ? 'is-charging' :
            slot.status === 'RESERVED'  ? 'is-reserved' : 'is-occupied';

          const stateIcon = slot.status === 'CHARGING' ? 'plug-zap' : vMeta.icon;
          const shortState = slot.status === 'AVAILABLE' ? 'Trống' : slot.status === 'RESERVED' ? 'Đã đặt' : STATUS_LABEL[slot.status];

          return `<button type="button" class="slot ${stateClass}" data-slot="${slot.code}" aria-label="Ô ${esc(slot.code)} — ${esc(vMeta.label)} — ${STATUS_LABEL[slot.status]}">
            <div class="slot-code">${esc(slot.code)}</div>
            <div class="slot-meta">
              <span class="slot-state">${shortState}</span>
              ${iconSvg(stateIcon, 13)}
            </div>
          </button>`;
        }).join('');

        return `<div class="map-group">
          <div class="map-group-title">${iconSvg(g.icon, 14)}<span>${esc(g.title)}</span></div>
          <div class="slot-grid">${cells}</div>
        </div>`;
      }).join('');

      const zAll = state.slots.filter((s) => s.zone === zKey);
      const zFree = zAll.filter((s) => s.status === 'AVAILABLE').length;

      return `<section class="map-zone" aria-label="${esc(zMeta.name)}">
        <header class="map-zone-head">
          <span class="zone-tag ${zMeta.tagClass}">ZONE ${zMeta.code}</span>
          <strong>${esc(zMeta.name)}</strong>
          <span style="font-size:13px; color:var(--text-2);">${esc(zMeta.subtitle)}</span>
          <span class="muted">${isBasementLockedByPccc ? 'Khóa PCCC với xe điện' : `Trống ${zFree}/${zAll.length} chỗ`}</span>
        </header>
        ${groupsHtml}
      </section>`;
    }).join('');

    container.innerHTML = html || `<div class="empty-state">Không tìm thấy ô đỗ nào khớp bộ lọc hiện tại.</div>`;

    const resultEl = $('map-result');
    if (resultEl) {
      resultEl.textContent = `Hiển thị ${shownCount}/150 ô (${availShownCount} ô còn trống)`;
    }

    container.querySelectorAll('[data-slot]').forEach((btn) => {
      btn.addEventListener('click', () => onSlotClick(btn.getAttribute('data-slot')));
    });
  }

  /* ------------------------------------------------------------------------
   * 5. MONTHLY PRICING TABLE (1 / 3 / 6 / 12 months with 0% / 5% / 10% / 15% off)
   * ------------------------------------------------------------------------ */
  const MONTHLY_PACKAGES = [
    { name: 'Ô tô điện — Zone EV',       sub: 'Cố định ô có trụ sạc VinFast', base: 1400000 },
    { name: 'Ô tô xăng — Zone NT',       sub: 'Khu ngoài trời mặt đất',       base: 1000000 },
    { name: 'Ô tô xăng — Tầng hầm B1',   sub: 'Có mái che tầng hầm',          base: 1300000 },
    { name: 'Ô tô xăng — Zone VIP',      sub: 'Mái che sát cổng chính',       base: 1800000 },
    { name: 'Xe máy (Xăng / Điện)',      sub: 'Gửi cố định theo khu đăng ký', base: 180000 }
  ];

  const MONTH_DISCOUNT = { 1: 0, 3: 0.05, 6: 0.10, 12: 0.15 };

  function renderMonthlyTable(months = 1) {
    const disc = MONTH_DISCOUNT[months] || 0;
    const headEl = $('monthly-total-head');
    if (headEl) {
      headEl.textContent = months === 1 ? 'Tổng 1 tháng' : `Tổng ${months} tháng (−${Math.round(disc * 100)}%)`;
    }

    const tbody = $('monthly-body');
    if (!tbody) return;

    tbody.innerHTML = MONTHLY_PACKAGES.map((pkg) => {
      const perMonth = Math.round((pkg.base * (1 - disc)) / 1000) * 1000;
      const total = perMonth * months;
      const oldHtml = disc > 0 ? `<span class="price-old">${fmtMoney(pkg.base)}</span>` : '';
      return `<tr>
        <td>
          <strong>${esc(pkg.name)}</strong>
          <span class="sub">${esc(pkg.sub)}</span>
        </td>
        <td class="t-right num">${oldHtml}${fmtMoney(perMonth)}</td>
        <td class="t-right num">${fmtMoney(total)}</td>
      </tr>`;
    }).join('');
  }

  /* ------------------------------------------------------------------------
   * 6. SLOT DETAIL MODAL (US04) & ACCOUNT MENU DIALOG
   * ------------------------------------------------------------------------ */
  function openInfoDialog(kicker, title, bodyHtml) {
    const dlg = $('info-dialog');
    if (!dlg) return;
    $('info-dialog-kicker').textContent = kicker;
    $('info-dialog-title').textContent = title;
    $('info-dialog-body').innerHTML = bodyHtml;
    dlg.showModal();
  }

  function onSlotClick(code) {
    const slot = state.slots.find((s) => s.code === code);
    if (!slot) return;

    const isEvSelected = state.vehicleFilter === 'EV_CAR' || state.vehicleFilter === 'EV_BIKE';
    if (slot.zone === 'TH' && isEvSelected) {
      toast('Tầng hầm B1 không nhận xe điện theo quy định PCCC. Vui lòng chọn ô tại Zone EV.');
      return;
    }

    const vMeta = VEHICLE_META[slot.vehicleType];
    const zMeta = ZONES[slot.zone];

    openInfoDialog(
      `CHI TIẾT VỊ TRÍ ĐỖ • ZONE ${slot.zone}`,
      `Ô đỗ ${slot.code} — ${zMeta.name}`,
      `<dl class="ticket-rows" style="margin-bottom:14px;">
        <dt>Mã vị trí đỗ</dt><dd class="num">${esc(slot.code)}</dd>
        <dt>Phân khu</dt><dd>${esc(zMeta.name)} (${esc(zMeta.subtitle)})</dd>
        <dt>Loại phương tiện</dt><dd>${esc(vMeta.label)}</dd>
        <dt>Đơn giá niêm yết</dt><dd class="num">${esc(slot.rateText)}</dd>
        <dt>Trạng thái hiện tại</dt><dd>${esc(STATUS_LABEL[slot.status])}</dd>
      </dl>
      <div class="fee-box">
        <div class="fee-row"><span>Thời gian giữ chỗ tối đa</span><strong>15 phút sau giờ hẹn</strong></div>
        <div class="fee-row"><span>Quy định quá giờ ra</span><strong>Phụ phí 1.5x đơn giá</strong></div>
      </div>`
    );
  }

  /* ------------------------------------------------------------------------
   * 7. AUTHENTICATED USER HEADER, WELCOME BANNER & ACCOUNT DROPDOWN MENU
   * ------------------------------------------------------------------------ */
  function formatUserDisplayName(auth) {
    const rawName = (auth.fullName || auth.username || '').trim();
    const roleLabel = (auth.roleLabel || 'Khách Hàng').trim();
    // Avoid duplicating role or username in parentheses if fullName already has parentheses
    if (rawName.includes('(') && rawName.includes(')')) {
      return rawName;
    }
    return `${rawName} (${roleLabel})`;
  }

  function openAccountMenuSection(action, auth) {
    const displayName = formatUserDisplayName(auth);
    const cleanName = (auth.fullName || auth.username || '').replace(/\s*\(.*?\)\s*/g, '').trim();
    const roleLabel = auth.roleLabel || 'Khách hàng';

    const sections = {
      'my-bookings': {
        kicker: 'TÀI KHOẢN KHÁCH HÀNG',
        title: 'Lịch đặt chỗ & Vé QR của tôi',
        html: `<p style="font-size:14px; color:var(--text-2); margin-bottom:12px;">
          Tài khoản <strong>${esc(cleanName)}</strong> hiện chưa có lịch đặt chỗ đang hoạt động.
        </p>
        <div class="fee-box">
          <div class="fee-row"><span>Trạng thái vé đặt trước</span><strong>0 vé đang chờ Check-in</strong></div>
          <div class="fee-row"><span>Hỗ trợ đặt chỗ nhanh</span><strong>Chọn ô màu xanh trên sơ đồ 150 chỗ</strong></div>
        </div>`
      },
      'my-vehicles': {
        kicker: 'QUẢN LÝ PHƯƠNG TIỆN',
        title: 'Phương tiện & Biển số đã lưu',
        html: `<p style="font-size:14px; color:var(--text-2); margin-bottom:12px;">
          Danh sách biển số xe gắn với tài khoản <strong>${esc(cleanName)}</strong> để tự động điền nhanh khi đặt lịch đỗ xe.
        </p>
        <div class="fee-box">
          <div class="fee-row"><span>Phương tiện mặc định</span><strong>51K-888.99 (Ô tô điện VinFast)</strong></div>
          <div class="fee-row"><span>Phương tiện phụ</span><strong>59X3-686.86 (Xe máy xăng)</strong></div>
        </div>`
      },
      'notifications': {
        kicker: 'THÔNG BÁO HỆ THỐNG',
        title: 'Thông báo & Nhắc giờ đỗ xe',
        html: `<ul class="rule-list rule-list-compact">
          <li>${iconSvg('bell', 15)}<span><strong>Nhắc giờ vào bãi:</strong> Hệ thống gửi thông báo trước giờ hẹn 15 phút.</span></li>
          <li>${iconSvg('clock', 15)}<span><strong>Cảnh báo sắp hết giờ đỗ:</strong> Nhắc trước 15 phút khi gần hết khung giờ đã đặt để gia hạn hoặc lấy xe đúng giờ.</span></li>
          <li>${iconSvg('plug-zap', 15)}<span><strong>Thông báo sạc đầy EV:</strong> Báo ngay khi pin đạt 100% để tránh phí chiếm trụ sạc (1.000đ/phút sau 10 phút).</span></li>
        </ul>`
      },
      'profile': {
        kicker: 'THÔNG TIN TÀI KHOẢN',
        title: 'Hồ sơ cá nhân',
        html: `<dl class="ticket-rows">
          <dt>Họ và tên</dt><dd>${esc(cleanName)}</dd>
          <dt>Tên đăng nhập</dt><dd class="num">${esc(auth.username)}</dd>
          <dt>Vai trò hệ thống</dt><dd>${esc(roleLabel)}</dd>
          <dt>Giới tính</dt><dd>${esc(auth.gender || 'Nam')}</dd>
          <dt>Số điện thoại</dt><dd class="num">${esc(auth.phone || '0901234567')}</dd>
        </dl>`
      }
    };

    const picked = sections[action] || sections.profile;
    openInfoDialog(picked.kicker, picked.title, picked.html);
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

      // 1. Format clean display name WITHOUT duplicate (customer)
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

      const monthlyBtn = $('monthly-cta-btn');
      if (monthlyBtn) {
        monthlyBtn.textContent = 'Liên hệ đăng ký vé tháng (1900 6868)';
        monthlyBtn.setAttribute('href', '#ho-tro-247');
      }

      if ($('account-trigger-label')) $('account-trigger-label').textContent = displayName;
      if ($('dropdown-user-name')) $('dropdown-user-name').textContent = displayName;
      if ($('dropdown-user-role')) $('dropdown-user-role').textContent = roleSubtitle;

      // 2. Show green welcome banner below Navbar
      if (welcomeBanner && welcomeText) {
        welcomeText.textContent = `Đăng nhập thành công! Chào mừng ${displayName}.`;
        welcomeBanner.hidden = false;
      }

      // 3. Dropdown toggle & outside click
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

      // 4. Dropdown menu actions
      document.querySelectorAll('[data-menu-action]').forEach((itemBtn) => {
        itemBtn.addEventListener('click', () => {
          const action = itemBtn.getAttribute('data-menu-action');
          if (dropdown) dropdown.hidden = true;
          if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
          openAccountMenuSection(action, auth);
        });
      });

      // 5. Logout button
      $('account-logout-btn')?.addEventListener('click', () => {
        try {
          localStorage.removeItem('smartpark_auth_user');
        } catch {}
        window.location.href = '/';
      });
    } catch {}
  }

  /* ------------------------------------------------------------------------
   * 8. INITIALIZATION & EVENT BINDINGS
   * ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    hydrateIcons();
    hydrateLoggedInUser();
    updateCounters();
    renderSlotMap();
    renderMonthlyTable(1);

    // Quick "Tìm chỗ trống ngay" / "Đặt chỗ ngay" buttons
    document.querySelectorAll('[data-action="find-available"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.statusFilter = 'AVAILABLE';
        document.querySelectorAll('.status-tabs .tab').forEach((t) => {
          const active = t.getAttribute('data-status') === 'AVAILABLE';
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-pressed', String(active));
        });
        updateCounters();
        renderSlotMap();
      });
    });

    // Status tabs (Tất cả 150 / Còn trống 52 / Đang đỗ 75 / Đang sạc 12 / Đã đặt trước 11)
    document.querySelectorAll('.status-tabs .tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const st = tab.getAttribute('data-status') || 'ALL';
        state.statusFilter = st;
        document.querySelectorAll('.status-tabs .tab').forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-pressed', String(active));
        });
        renderSlotMap();
      });
    });

    // Zone card buttons ("Xem ô trống khu này")
    document.querySelectorAll('[data-zone-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const z = btn.getAttribute('data-zone-pick');
        state.zoneFilter = z;
        if ($('filter-zone')) $('filter-zone').value = z;
        updateCounters();
        renderSlotMap();
        $('slot-map')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // Toolbar filters
    $('filter-code')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value || '';
      renderSlotMap();
    });

    $('filter-zone')?.addEventListener('change', (e) => {
      state.zoneFilter = e.target.value || 'ALL';
      updateCounters();
      renderSlotMap();
    });

    $('filter-vehicle')?.addEventListener('change', (e) => {
      state.vehicleFilter = e.target.value || 'ALL';
      renderSlotMap();
    });

    $('filter-available')?.addEventListener('change', (e) => {
      state.onlyAvailable = Boolean(e.target.checked);
      renderSlotMap();
    });

    // Monthly package segmented buttons (1 / 3 / 6 / 12 months)
    document.querySelectorAll('.segmented .seg').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = Number(btn.getAttribute('data-months') || 1);
        document.querySelectorAll('.segmented .seg').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderMonthlyTable(m);
      });
    });

    // Dialog close buttons & backdrop click
    document.querySelectorAll('dialog').forEach((dlg) => {
      dlg.querySelectorAll('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => dlg.close());
      });
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg) dlg.close();
      });
    });
  });
})();
