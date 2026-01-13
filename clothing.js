// LocalStorage management for clothing items
// Key used to store and retrieve items from browser's localStorage
var CLOSET_KEY = 'closy-items-v1';

// Saves items array to localStorage as JSON string
function saveItems(items) {
  try {
    localStorage.setItem(CLOSET_KEY, JSON.stringify(items || []));
  } catch (e) {} // Fail silently if storage quota exceeded or blocked
}

// Loads items array from localStorage, returns empty array if none found
function loadItems() {
  try {
    var raw = localStorage.getItem(CLOSET_KEY);
    if (!raw) return []; // No items stored yet
    return JSON.parse(raw); // Parse JSON string back to array
  } catch (e) { return []; } // Return empty array if parsing fails
}

// Renders a single clothing item card and appends it to the grid
function renderItem(obj) {
  var clothing = document.getElementById('clothing');
  if (!clothing) return null; // Exit if container doesn't exist
  
  // Create main item container
  var item = document.createElement('div');
  item.className = 'item';
  item.dataset.id = obj.id; // Store ID for deletion/updates

  // Create thumbnail section (image or color placeholder)
  var thumb = document.createElement('div');
  thumb.className = 'item-thumb';
  
  // Priority: uploaded image > URL image > color > default gradient
  if (obj.imageData) {
    // Use uploaded image data (base64)
    var img = document.createElement('img');
    img.src = obj.imageData;
    img.alt = obj.name || 'Clothing item';
    thumb.appendChild(img);
  } else if (obj.imageUrl) {
    // Use image from URL
    var img2 = document.createElement('img');
    img2.src = obj.imageUrl;
    img2.alt = obj.name || 'Clothing item';
    thumb.appendChild(img2);
  } else if (obj.color) {
    // Use solid color or gradient
    thumb.style.background = obj.color;
  } else {
    // Default pink gradient if no image or color
    thumb.style.background = 'linear-gradient(180deg,#ffd6f6,#ffd0ef)';
  }

  // Create item body section with name, badges, and delete button
  var body = document.createElement('div');
  body.className = 'item-body';

  // Top row: item name + delete button
  var row = document.createElement('div');
  row.className = 'item-row';
  
  var title = document.createElement('div');
  title.className = 'item-name';
  title.textContent = obj.name || '';
  
  // Delete button with click handler
  var del = document.createElement('button');
  del.className = 'item-delete';
  del.type = 'button';
  del.title = 'Remove item';
  del.textContent = '×';
  del.addEventListener('click', function () { removeItemById(obj.id); });
  
  row.appendChild(title);
  row.appendChild(del);

  // Badges section: category and color
  var badges = document.createElement('div');
  badges.className = 'item-badges';
  
  // Add category badge if present
  if (obj.category) {
    var c = document.createElement('span'); 
    c.className = 'badge'; 
    c.textContent = obj.category; 
    badges.appendChild(c);
  }
  
  // Add color badge if present
  if (obj.color) {
    var cc = document.createElement('span'); 
    cc.className = 'badge badge--muted'; 
    cc.textContent = obj.color; 
    badges.appendChild(cc);
  }

  // Seasons line: displays applicable seasons separated by bullets
  var seasonsLine = document.createElement('div');
  seasonsLine.className = 'item-seasons';
  if (obj.seasons && obj.seasons.length) {
    seasonsLine.textContent = obj.seasons.join(' • ');
  }

  // Assemble body components
  body.appendChild(row);
  body.appendChild(badges);
  body.appendChild(seasonsLine);

  // Assemble item card
  item.appendChild(thumb);
  item.appendChild(body);

  // Add to grid and return reference
  clothing.appendChild(item);
  return item;
}

// Renders all items from storage, applying active filters
function renderAll() {
  var clothing = document.getElementById('clothing');
  if (!clothing) return;
  
  // Clear existing items
  clothing.innerHTML = '';
  var items = loadItems();

  // Get current filter values from custom dropdowns
  var catEl = document.getElementById('filter-category');
  var seasonEl = document.getElementById('filter-season');
  var catFilter = catEl ? (catEl.closest('.custom-dropdown')?.querySelector('.custom-dropdown-option.selected')?.getAttribute('data-value') || 'All') : 'All';
  var seasonFilter = seasonEl ? (seasonEl.closest('.custom-dropdown')?.querySelector('.custom-dropdown-option.selected')?.getAttribute('data-value') || 'All') : 'All';

  // Apply filters to items array
  var filtered = items.filter(function (it) {
    // Category filter: match exact category or show all
    var catMatch = (catFilter === 'All') || (it.category && it.category.toLowerCase() === catFilter.toLowerCase());

    // Season filter: items without seasons are considered all-season
    var seasonMatch = true;
    if (seasonFilter && seasonFilter !== 'All') {
      if (!it.seasons || it.seasons.length === 0) {
        seasonMatch = true; // No seasons = available year-round
      } else {
        // Check if item has the selected season
        seasonMatch = it.seasons.some(function(s){ 
          return s && s.toLowerCase() === seasonFilter.toLowerCase(); 
        });
      }
    }

    // Item must match both filters
    return catMatch && seasonMatch;
  });

  // Show empty state if no items match filters, otherwise render items
  if (!filtered || filtered.length === 0) {
    var empty = document.getElementById('empty-closet');
    if (empty) empty.style.display = ''; // Show empty message
  } else {
    // Render each filtered item
    filtered.forEach(function (it) { renderItem(it); });
    var empty = document.getElementById('empty-closet');
    if (empty) empty.style.display = 'none'; // Hide empty message
  }
}

// Adds a new item to the closet and refreshes display
function addItem(obj) {
  // Use provided object or create default empty item
  var item = obj || { id: Date.now().toString(), name: '', category: '', color: '', imageUrl: '', imageData: '', seasons: [] };
  
  // Ensure item has required fields
  if (!item.id) item.id = Date.now().toString(); // Generate ID if missing
  if (!item.seasons) item.seasons = []; // Default to empty seasons array
  
  // Add to storage and re-render
  var items = loadItems();
  items.push(item);
  saveItems(items);
  renderAll();
}

// Removes an item by ID and refreshes display
function removeItemById(id) {
  var items = loadItems();
  // Filter out the item with matching ID
  var filtered = items.filter(function (i) { return i.id !== id; });
  saveItems(filtered);
  renderAll(); // Re-render to reflect deletion
}

// Initialize closet when page loads
document.addEventListener('DOMContentLoaded', function () {
  // Render all items on initial load
  renderAll();
  
  // Set up filter change listeners to re-render when filters change
  var catEl = document.getElementById('filter-category');
  var seasonEl = document.getElementById('filter-season');
  if (catEl) catEl.addEventListener('change', renderAll);
  if (seasonEl) seasonEl.addEventListener('change', renderAll);
  
  // Initialize custom dropdown functionality
  initCustomDropdowns();
});

// Custom Dropdown functionality
function initCustomDropdowns() {
  document.addEventListener('click', function(e) {
    var toggle = e.target.closest('.custom-dropdown-toggle');
    var option = e.target.closest('.custom-dropdown-option');
    
    // Handle toggle button click
    if (toggle) {
      e.preventDefault();
      var dropdown = toggle.closest('.custom-dropdown');
      var isOpen = dropdown.classList.contains('open');
      
      // Close all other dropdowns
      document.querySelectorAll('.custom-dropdown.open').forEach(function(d) {
        if (d !== dropdown) d.classList.remove('open');
      });
      
      // Toggle current dropdown
      dropdown.classList.toggle('open', !isOpen);
      return;
    }
    
    // Handle option click
    if (option) {
      var dropdown = option.closest('.custom-dropdown');
      var value = option.getAttribute('data-value');
      var text = option.textContent;
      
      // Update display value
      var valueEl = dropdown.querySelector('.custom-dropdown-value');
      if (valueEl) valueEl.textContent = text;
      
      // Update hidden input
      var hiddenInput = dropdown.querySelector('input[type="hidden"]');
      if (hiddenInput) hiddenInput.value = value;
      
      // For filter dropdowns, trigger change event on the button element
      var toggleBtn = dropdown.querySelector('.custom-dropdown-toggle');
      if (toggleBtn && toggleBtn.id) {
        var changeEvent = new Event('change', { bubbles: true });
        toggleBtn.dispatchEvent(changeEvent);
      }
      
      // Update selected state
      dropdown.querySelectorAll('.custom-dropdown-option').forEach(function(opt) {
        opt.classList.remove('selected');
      });
      option.classList.add('selected');
      
      // Close dropdown
      dropdown.classList.remove('open');
      return;
    }
    
    // Close all dropdowns when clicking outside
    if (!e.target.closest('.custom-dropdown')) {
      document.querySelectorAll('.custom-dropdown.open').forEach(function(d) {
        d.classList.remove('open');
      });
    }
  });
}
