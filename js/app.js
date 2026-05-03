/* ============================================================
   LMLinga - Shared JavaScript Utilities
   Barangay Health Center System
   ============================================================ */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Toggle password input visibility
 * @param {string} inputId - ID of the password input
 * @param {HTMLElement} btn - The toggle button element
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

/**
 * Expand/collapse Health Records submenu in staff sidebar
 */
function toggleSubmenu() {
  const submenu = document.getElementById('health-submenu');
  const arrow = document.getElementById('health-arrow');
  if (submenu) submenu.classList.toggle('open');
  if (arrow) arrow.classList.toggle('rotated');
}

/**
 * Confirm and perform logout
 */
function confirmLogout() {
  if (confirm('Are you sure you want to log out?')) {
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
}

/**
 * Get current user role from sessionStorage
 * @returns {string|null} User role or null if not logged in
 */
function getUserRole() {
  return sessionStorage.getItem('userRole');
}

/**
 * Get current user type from sessionStorage
 * @returns {string|null} 'staff' | 'resident' | null
 */
function getUserType() {
  return sessionStorage.getItem('userType');
}

/**
 * Get current user name from sessionStorage
 * @returns {string|null} User name or null
 */
function getUserName() {
  return sessionStorage.getItem('userName');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  return sessionStorage.getItem('loggedIn') === 'true';
}

/**
 * Check if current user is a Resident
 * @returns {boolean}
 */
function isResident() {
  return getUserType() === 'resident';
}

/**
 * Check if current user is Staff (BHW, BNS, or BSPO)
 * @returns {boolean}
 */
function isStaff() {
  return getUserType() === 'staff';
}

/**
 * Render sidebar based on user role
 * Call this on pages that need role-based sidebars
 */
function renderRoleBasedSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const path = (window.location.pathname.split('/').pop() || '').toLowerCase();

  if (isResident()) {
    const recordsActive =
      path === 'resident-records.html' || path === 'household-members.html' ? 'active' : '';
    const smsActive = path === 'request-head-sms.html' ? 'active' : '';
    sidebarNav.innerHTML = `
      <a href="resident-records.html" class="nav-item ${recordsActive}"><span class="nav-icon">🏡</span>Household records</a>
      <a href="request-head-sms.html" class="nav-item ${smsActive}"><span class="nav-icon">📱</span>Request head (SMS)</a>
    `;
  } else {
    const d = path === 'dashboard.html' ? 'active' : '';
    const m = path === 'spot-mapping.html' ? 'active' : '';
    const p = path === 'profiling.html' ? 'active' : '';
    const h = path === 'health-records.html' ? 'active' : '';
    sidebarNav.innerHTML = `
      <a href="dashboard.html" class="nav-item ${d}"><span class="nav-icon">🏠</span>Dashboard</a>
      <a href="spot-mapping.html" class="nav-item ${m}"><span class="nav-icon">🗺️</span>Spot Mapping</a>
      <a href="profiling.html" class="nav-item ${p}"><span class="nav-icon">🏡</span>Household Profiling</a>
      <a href="health-records.html?tab=immunization" class="nav-item ${h}"><span class="nav-icon">🩺</span>Health Records</a>
    `;
  }
}

/**
 * Update header user info display
 */
function updateHeaderUserInfo() {
  const name = getUserName();
  const role = getUserRole();

  const userNameEl = document.getElementById('header-user-name');
  const userRoleEl = document.getElementById('header-user-role');
  const displayName = document.getElementById('user-display-name');
  const displayRole = document.getElementById('user-display-role');
  const initialEl = document.getElementById('user-initial');

  if (userNameEl) userNameEl.textContent = name || 'Guest';
  if (userRoleEl) userRoleEl.textContent = role || '';

  if (displayName) {
    displayName.textContent = name || (isResident() ? 'Resident' : displayName.textContent);
  }
  if (displayRole) {
    displayRole.textContent = role || (isResident() ? 'Household' : displayRole.textContent);
  }

  if (initialEl) {
    const n = name || (isResident() ? 'R' : 'B');
    initialEl.textContent = String(n).trim().charAt(0).toUpperCase();
  }
}

/**
 * Protect staff-only pages - redirect residents away
 * Call this at the top of staff-only pages (dashboard, spot-mapping, profiling, health-records)
 */
function protectStaffPage() {
  if (!isLoggedIn()) {
    window.location.href = 'staff-login.html';
    return;
  }
  if (isResident()) {
    showToast('Access denied. Residents cannot access this page.', 'error');
    setTimeout(() => {
      window.location.href = 'chatbot.html';
    }, 1500);
  }
}

/**
 * Protect resident-only pages - must be logged in as resident
 */
function protectResidentPage() {
  if (!isLoggedIn()) {
    window.location.href = 'resident-login.html';
    return;
  }
}

/**
 * Resident-only routes (e.g. chatbot). Staff are sent to the staff dashboard.
 */
function protectResidentOnlyPage() {
  if (!isLoggedIn()) {
    window.location.href = 'resident-login.html';
    return;
  }
  if (isStaff()) {
    window.location.replace('dashboard.html');
  }
}

/**
 * General page access check
 * Redirects to appropriate login if not logged in
 */
function checkPageAccess() {
  if (!isLoggedIn()) {
    // Determine which login to show based on current page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'chatbot.html') {
      window.location.href = 'resident-login.html';
    } else {
      window.location.href = 'staff-login.html';
    }
  }
}

/**
 * Initialize common page features
 */
function initPage() {
  updateHeaderUserInfo();
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', initPage);
