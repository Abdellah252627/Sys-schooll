// DOM Ready
// document.addEventListener('DOMContentLoaded', function() {
//   initTooltips();
//   initModals();
//   initFormValidation();
//   initSidebarToggle();
// });

// Initialize Bootstrap tooltips
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Initialize modals
function initModals() {
  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
  });
}

// Form validation
function initFormValidation() {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
}

// Sidebar toggle for mobile
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-toggled');
      sidebar.classList.toggle('toggled');
    });
  }
}

// Toast notifications
function showToast(type, message) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.role = 'alert';
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 5000
  });
  
  bsToast.show();
  
  // Remove toast from DOM after it's hidden
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

// Handle flash messages
function initFlashMessages() {
  const flashMessages = document.querySelectorAll('.alert');
  
  flashMessages.forEach(alert => {
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
    
    // Add close button functionality
    const closeButton = alert.querySelector('.btn-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      });
    }
  });
}

// Initialize all components
function initAll() {
  initTooltips();
  initModals();
  initFormValidation();
  initSidebarToggle();
  initFlashMessages();
}

// Export for use in other files
// export {
//   showToast,
//   initAll
// };

// Initialize when DOM is loaded
if (document.readyState !== 'loading') {
  initAll();
} else {
  document.addEventListener('DOMContentLoaded', initAll);
}
