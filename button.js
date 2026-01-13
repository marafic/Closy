// Modal management and accessibility features for Add Item dialog
document.addEventListener('DOMContentLoaded', function () {
  // DOM element references
  var addBtn = document.getElementById('add-item-btn');
  var modal = document.getElementById('add-item-modal');
  var closeButtons = modal ? modal.querySelectorAll('[data-close], .modal-close') : [];
  var firstInput = modal ? modal.querySelector('input, select, textarea, button') : null;
  var previouslyFocused = null; // Stores element that had focus before modal opened

  // Opens the modal and sets up accessibility features
  function openModal() {
    if (!modal) return;
    
    // Store currently focused element to restore later
    previouslyFocused = document.activeElement;
    
    // Show modal and prevent body scroll
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first interactive element for keyboard users
    if (firstInput) {
      firstInput.focus();
    }
    
    // Enable keyboard focus trap
    trapFocus(modal);
  }

  // Closes the modal and restores previous state
  function closeModal() {
    if (!modal) return;
    
    // Hide modal and restore body scroll
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to element that opened the modal
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    
    // Release keyboard focus trap
    releaseFocus();
    
    // Clear image preview
    if (imagePreview) {
      imagePreview.innerHTML = '';
      imagePreview.style.display = 'none';
    }
  }

  // Event: Open modal when Add Item button is clicked
  if (addBtn) addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    openModal();
  });

  // Event: Close modal when any close button is clicked
  closeButtons.forEach(function (btn) { 
    btn.addEventListener('click', function (e) { 
      e.preventDefault(); 
      closeModal(); 
    }); 
  });

  // Event: Close modal when clicking on backdrop (outside modal content)
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-backdrop')) closeModal();
    });
  }

  // Event: Close modal when Escape key is pressed
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // Focus trap: keeps keyboard navigation inside modal
  var focusable = []; // Array of focusable elements within modal
  var lastFocusedIndex = 0;
  
  // Activates focus trap by finding all focusable elements and adding Tab listener
  function trapFocus(root) {
    // Find all interactive elements that can receive focus
    focusable = Array.prototype.slice.call(root.querySelectorAll('a[href], button:not([disabled]), textarea, input, select'));
    
    // Focus first element if available
    if (focusable.length) {
      focusable[0].focus();
      lastFocusedIndex = 0;
    }
    
    // Listen for Tab key presses
    root.addEventListener('keydown', handleTrap);
  }
  
  // Deactivates focus trap by removing listener and clearing focusable list
  function releaseFocus() {
    if (!modal) return;
    modal.removeEventListener('keydown', handleTrap);
    focusable = [];
  }
  
  // Handles Tab key navigation to cycle focus within modal
  function handleTrap(e) {
    if (e.key !== 'Tab') return;
    if (focusable.length === 0) return;
    
    var idx = focusable.indexOf(document.activeElement);
    
    if (e.shiftKey) {
      // Shift+Tab: move backward, wrap to last element if at start
      if (idx <= 0) { 
        focusable[focusable.length - 1].focus(); 
        e.preventDefault(); 
      }
    } else {
      // Tab: move forward, wrap to first element if at end
      if (idx === focusable.length - 1) { 
        focusable[0].focus(); 
        e.preventDefault(); 
      }
    }
  }

  // File upload functionality
  var fileBtn = document.querySelector('.file-btn');
  var fileInput = document.getElementById('file-input');
  var imagePreview = document.getElementById('image-preview');
  
  if (fileBtn && fileInput) {
    // Event: Trigger hidden file input when custom button is clicked
    fileBtn.addEventListener('click', function () { 
      fileInput.click(); 
    });
    
    // Event: Display image preview when file is selected
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        
        // Read file and display as image preview
        reader.onload = function(ev) {
          if (imagePreview) {
            imagePreview.innerHTML = '<img src="' + ev.target.result + '" alt="Preview">';
            imagePreview.style.display = 'block';
          }
        };
        
        // Convert image file to data URL
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // Form submission handler
  var form = document.getElementById('add-item-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Collect form data
      var formData = new FormData(form);
      
      // Extract selected seasons from checkboxes
      var seasons = ['spring','summer','fall','winter'].filter(function(s){ 
        return formData.get(s) !== null; 
      });
      
      // Build item object with form values
      var obj = {
        id: Date.now().toString(), // Generate unique ID based on timestamp
        name: formData.get('name') || '',
        category: formData.get('category') || '',
        color: formData.get('color') || '',
        imageUrl: formData.get('imageUrl') || '',
        imageData: '', // Will be populated if file is uploaded
        seasons: seasons
      };

      // Check if user uploaded an image file
      var file = document.getElementById('file-input');
      if (file && file.files && file.files[0]) {
        // Read uploaded file as data URL
        var reader = new FileReader();
        reader.onload = function (ev) {
          obj.imageData = ev.target.result;
          
          // Call addItem function (defined in clothing.js)
          try { if (typeof addItem === 'function') addItem(obj); } catch (err) {}
          
          closeModal();
          form.reset();
        };
        reader.readAsDataURL(file.files[0]);
      } else {
        // No file uploaded, save item with URL or color only
        try { if (typeof addItem === 'function') addItem(obj); } catch (err) {}
        closeModal();
        form.reset();
      }
    });
  }
});
