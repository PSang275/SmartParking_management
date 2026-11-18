/**
 * SmartPark — Admin Monitoring & 6-Role User Management Dashboard (/Admin)
 * Scope of PSang275: US01, US17, US31, US32
 * Zero emojis, 100% Lucide vector SVGs, semantic CSS tokens, tabular numerals
 */
(() => {
  'use strict';

  const initData = window.__SMARTPARK_INITIAL__ || {};
  const state = {
    activeTab: initData.activeTab || 'map',
    zones: initData.zones || [],
    slots: initData.slots || [],
    users: initData.users || [],
    sessions: initData.sessions || [],
    bookings: initData.bookings || [],
    monthlyPasses: initData.monthlyPasses || [],
    filterZone: 'ALL',
    userRoleFilter: 'ALL'
  };

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function toast(msg) {
    const box = $('toast-container');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  async function refreshState() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      state.zones = data.zones || state.zones;
      state.slots = data.slots || state.slots;
      state.users = data.users || state.users;
      state.sessions = data.sessions || state.sessions;
      state.bookings = data.bookings || state.bookings;
      state.monthlyPasses = data.monthlyPasses || state.monthlyPasses;
      renderKpisAndGauge();
      renderMapZones();
      renderUsersTable();
    } catch {}
  }

  function getZoneMeta(zoneId) {
    const map = {
      1: { code: 'ZONE EV', short: 'ZONE-EV', badgeClass: '', rateCar: '20.000 đ/giờ', rateBike: '5.000 đ/4h', sub: 'Ô tô điện 20.000 đ/giờ • Xe máy điện 5.000 đ/4h • Sạc 4.500 đ/kWh' },
      2: { code: 'ZONE NT', short: 'ZONE-NT', badgeClass: 'zone-badge-nt', rateCar: '15.000 đ/giờ', rateBike: '5.000 đ/4h', sub: 'Ô tô xăng 15.000 đ/giờ • Xe máy xăng 5.000 đ/4h • Qua đêm 100.000 đ' },
      3: { code: 'ZONE TH', short: 'ZONE-TH', badgeClass: 'zone-badge-th', rateCar: '20.000 đ/giờ', rateBike: '5.000 đ/4h', sub: 'Tầng hầm B1 (Chỉ nhận xe xăng PCCC) • Ô tô 20.000 đ/giờ • Qua đêm 130.000 đ' },
      4: { code: 'ZONE VIP', short: 'ZONE-VIP', badgeClass: 'zone-badge-vip', rateCar: '30.000 đ/giờ', rateBike: '30.000 đ/giờ', sub: 'Khu VIP Mái che sát cổng • Ô tô 30.000 đ/giờ • Qua đêm 180.000 đ' }
    };
    return map[zoneId] || map[1];
  }

  function renderKpisAndGauge() {
    const total = state.slots.length;
    const availSlots = state.slots.filter((s) => s.status === 'AVAILABLE');
    const avail = availSlots.length;
    const availCar = availSlots.filter((s) => s.vehicle_type === 'CAR').length;
    const availBike = availSlots.filter((s) => s.vehicle_type === 'MOTORBIKE').length;

    const occ = state.slots.filter((s) => s.status === 'OCCUPIED').length;
    const res = state.slots.filter((s) => s.status === 'RESERVED').length;
    const busy = occ + res;

    if ($('nav-avail-badge')) $('nav-avail-badge').textContent = avail;
    if ($('nav-users-badge')) $('nav-users-badge').textContent = state.users.length;
    if ($('kpi-total')) $('kpi-total').textContent = total;
    if ($('kpi-avail')) $('kpi-avail').textContent = avail;
    if ($('kpi-avail-sub')) $('kpi-avail-sub').textContent = `Ô tô: ${availCar} • Xe máy: ${availBike}`;
    if ($('kpi-busy')) $('kpi-busy').textContent = busy;
    if ($('kpi-busy-sub')) $('kpi-busy-sub').textContent = `Đang đỗ: ${occ} • Đặt trước: ${res}`;
    if ($('kpi-users-count')) $('kpi-users-count').textContent = state.users.length;
    if ($('kpi-users-sub')) $('kpi-users-sub').textContent = `6 vai trò phân quyền • ${state.monthlyPasses.length} vé tháng`;

    const pct = total > 0 ? Math.round((avail / total) * 100) : 0;
    if ($('gauge-pct')) $('gauge-pct').textContent = `${pct}%`;
    if ($('gauge-arc')) $('gauge-arc').setAttribute('stroke-dasharray', `${pct}, 100`);
    if ($('gauge-avail-num')) $('gauge-avail-num').textContent = avail;
    if ($('gauge-total-sub')) $('gauge-total-sub').textContent = `Trên tổng ${total} vị trí`;

    const barsContainer = $('live-zone-bars');
    if (barsContainer) {
      barsContainer.innerHTML = state.zones.map((z) => {
        const zSlots = state.slots.filter((s) => s.zone_id === z.id);
        const zAvail = zSlots.filter((s) => s.status === 'AVAILABLE').length;
        const availPct = zSlots.length ? Math.round((zAvail / zSlots.length) * 100) : 0;
        const busyPct = 100 - availPct;
        const meta = getZoneMeta(z.id);

        return `<div class="zone-bar-item">
          <div class="zone-bar-row">
            <span class="num">${esc(meta.short)}: ${zAvail}/${zSlots.length} chỗ trống</span>
          </div>
          <div class="zone-bar-track">
            <div class="zone-bar-fill-green" style="width:${availPct}%"></div>
            <div class="zone-bar-fill-blue" style="width:${busyPct}%"></div>
          </div>
        </div>`;
      }).join('');
    }
  }

  function renderMapZones() {
    const container = $('zones-slot-container');
    if (!container) return;

    const visibleZones = state.zones.filter((z) =>
      state.filterZone === 'ALL' || String(z.id) === String(state.filterZone)
    );

    const html = visibleZones.map((z) => {
      const meta = getZoneMeta(z.id);
      const allZSlots = state.slots.filter((s) => s.zone_id === z.id);
      const availCount = allZSlots.filter((s) => s.status === 'AVAILABLE').length;

      const cardsHtml = allZSlots.map((s) => {
        const isCar = s.vehicle_type === 'CAR';
        const vLabel = z.id === 1 ? (isCar ? 'Ô tô điện' : 'Xe máy điện') : (isCar ? 'Ô tô' : 'Xe máy');
        const rateText = isCar ? meta.rateCar : meta.rateBike;

        let cardClass = 'is-available';
        let tagClass = 'tag-available';
        let tagText = 'TRỐNG';
        let midText = 'Sẵn sàng đón xe';

        if (s.status === 'OCCUPIED') {
          cardClass = 'is-occupied';
          tagClass = 'tag-occupied';
          tagText = 'CÓ XE';
          midText = esc(s.current_plate || '51K-888.99');
        } else if (s.status === 'RESERVED') {
          cardClass = 'is-reserved';
          tagClass = 'tag-reserved';
          tagText = 'ĐÃ ĐẶT';
          midText = esc(s.current_plate || 'Đã giữ chỗ');
        }

        return `<div class="slot-card ${cardClass}" data-slot-info="${esc(s.slot_code)}">
          <div class="slot-card-top">
            <span class="slot-card-code num">${esc(s.slot_code)}</span>
            <span class="slot-status-tag ${tagClass}">${tagText}</span>
          </div>
          <div class="slot-card-mid num">${midText}</div>
          <div class="slot-card-foot">
            <span>${vLabel}</span>
            <span class="num">${rateText}</span>
          </div>
        </div>`;
      }).join('');

      return `<section class="zone-panel">
        <header class="zone-panel-head">
          <div class="zone-panel-left">
            <span class="zone-badge ${meta.badgeClass}">${esc(meta.code)}</span>
            <div>
              <div class="zone-panel-title">${esc(z.zone_name)}</div>
              <div class="zone-panel-sub">${esc(meta.sub)}</div>
            </div>
          </div>
          <span class="zone-avail-pill num">Trống ${availCount}/${allZSlots.length} ô</span>
        </header>
        <div class="slot-cards-grid">${cardsHtml}</div>
      </section>`;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('[data-slot-info]').forEach((card) => {
      card.addEventListener('click', () => {
        const code = card.getAttribute('data-slot-info');
        const slot = state.slots.find((s) => s.slot_code === code);
        if (slot) {
          toast(`Vị trí ${slot.slot_code}: Trạng thái ${slot.status}${slot.current_plate ? ' • Biển số ' + slot.current_plate : ''}`);
        }
      });
    });
  }

  // =========================================================================
  // US32 (PSang275): Quản lý danh sách tài khoản người dùng & phân quyền 6 vai trò
  // Quy tắc: Chỉ duy nhất 01 tài khoản ADMIN gốc, các tài khoản khác chỉ được gán 5 role còn lại
  // =========================================================================
  const ASSIGNABLE_ROLES = ['MANAGER', 'GATE_STAFF', 'ACCOUNTANT', 'TECHNICIAN', 'CUSTOMER'];

  function renderUsersTable() {
    const tbody = $('admin-users-tbody');
    if (!tbody) return;

    const filtered = state.users.filter((u) =>
      state.userRoleFilter === 'ALL' || u.role === state.userRoleFilter
    );

    tbody.innerHTML = filtered.map((u) => {
      const isRootAdmin = u.username.toLowerCase() === 'admin' || u.role === 'ADMIN';
      const isLocked = u.status === 'LOCKED';

      const roleCellHtml = isRootAdmin
        ? '<span class="us-badge">ADMIN (Duy nhất)</span>'
        : `<select class="select-control" style="height:36px; min-width:155px;" data-user-role-select="${u.id}">
            ${ASSIGNABLE_ROLES.map((r) => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>`;

      const statusBadge = isLocked
        ? '<span class="status-pill pill-cancelled">ĐÃ KHÓA</span>'
        : '<span class="status-pill pill-completed">HOẠT ĐỘNG</span>';

      return `<tr>
        <td class="num">${u.id}</td>
        <td class="num"><strong>${esc(u.username)}</strong></td>
        <td>${esc(u.full_name)}</td>
        <td class="num">${esc(u.phone || '—')}</td>
        <td>${roleCellHtml}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn btn-outline" style="height:34px; padding:0 10px; font-size:12px;" data-user-toggle-lock="${u.id}" data-current-status="${esc(u.status || 'ACTIVE')}" ${isRootAdmin ? 'disabled' : ''}>
              ${isLocked ? 'Mở khóa' : 'Khóa'}
            </button>
            <button type="button" class="btn btn-danger-soft" style="height:34px; padding:0 10px; font-size:12px;" data-user-delete="${u.id}" ${isRootAdmin ? 'disabled' : ''}>
              Xóa
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-user-role-select]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = Number(sel.getAttribute('data-user-role-select'));
        const newRole = sel.value;
        const res = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        toast(data.message || 'Đã cập nhật vai trò.');
        await refreshState();
      });
    });

    tbody.querySelectorAll('[data-user-toggle-lock]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-user-toggle-lock'));
        const cur = btn.getAttribute('data-current-status') || 'ACTIVE';
        const nextStatus = cur === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
        const res = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        const data = await res.json();
        toast(data.message || 'Đã cập nhật trạng thái tài khoản.');
        await refreshState();
      });
    });

    tbody.querySelectorAll('[data-user-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-user-delete'));
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        toast(data.message || 'Đã xóa tài khoản.');
        await refreshState();
      });
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('[data-tab-btn]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab-btn') === tabName);
    });
    document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-tab-panel') !== tabName;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const auth = JSON.parse(localStorage.getItem('smartpark_auth_user') || 'null');
      if (auth && auth.role === 'GATE_STAFF') {
        window.location.href = '/Gate';
        return;
      }
      if (auth && auth.role === 'MANAGER') {
        window.location.href = '/Workspace/manager';
        return;
      }
      if (auth && auth.role === 'ACCOUNTANT') {
        window.location.href = '/Workspace/accountant';
        return;
      }
      if (auth && auth.role === 'TECHNICIAN') {
        window.location.href = '/Workspace/technician';
        return;
      }
      if (auth && auth.fullName && auth.role === 'ADMIN' && $('header-user-label')) {
        $('header-user-label').textContent = auth.fullName;
      }
    } catch {}

    renderKpisAndGauge();
    renderMapZones();
    renderUsersTable();

    if (state.activeTab && state.activeTab !== 'map') {
      switchTab(state.activeTab);
    }

    document.querySelectorAll('[data-tab-btn]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab-btn')));
    });

    document.querySelectorAll('[data-quick-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const z = btn.getAttribute('data-quick-zone');
        state.filterZone = z;
        document.querySelectorAll('[data-quick-zone]').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderMapZones();
      });
    });

    $('user-role-filter')?.addEventListener('change', (e) => {
      state.userRoleFilter = e.target.value || 'ALL';
      renderUsersTable();
    });

    $('admin-create-user-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        username: $('au-username')?.value?.trim(),
        password: $('au-password')?.value?.trim(),
        fullName: $('au-fullname')?.value?.trim(),
        phone: $('au-phone')?.value?.trim(),
        email: $('au-email')?.value?.trim(),
        role: $('au-role')?.value
      };

      if (!payload.username || !payload.fullName) {
        toast('Vui lòng nhập đầy đủ Tên đăng nhập và Họ tên.');
        return;
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Không thể tạo tài khoản.');
        return;
      }

      toast(data.message || 'Tạo tài khoản mới thành công!');
      if ($('au-username')) $('au-username').value = '';
      if ($('au-fullname')) $('au-fullname').value = '';
      if ($('au-phone')) $('au-phone').value = '';
      if ($('au-email')) $('au-email').value = '';
      await refreshState();
    });
  });
})();
