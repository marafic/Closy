// planner.js — render closet items and let user add them to the current outfit
(function(){
  const STORAGE_KEY = 'closy-items-v1';
  const OUTFIT_KEY = 'closy-outfit-v1';
  let items = [];
  let outfit = [];
  const MAX_OUTFIT = 6; // Maximal 6 Items pro Outfit
  console.log('Closy Planner: MAX_OUTFIT =', MAX_OUTFIT);

  function $(sel, root=document){ return root.querySelector(sel); }
  function $id(id){ return document.getElementById(id); }

  function loadItems(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      items = raw ? JSON.parse(raw) : [];
    }catch(e){ items = []; }
  }
  function loadOutfit(){
    try{ const raw = localStorage.getItem(OUTFIT_KEY); outfit = raw?JSON.parse(raw):[]; }catch(e){ outfit=[] }
    // normalize to strings and remove falsy values
    outfit = Array.isArray(outfit) ? outfit.map(function(x){ return x==null? '': String(x); }).filter(function(x){ return x; }) : [];
  }
  function saveOutfit(){
    try{ localStorage.setItem(OUTFIT_KEY, JSON.stringify(outfit)); }catch(e){}
  }

  function escapeHtml(s){ 
    if(!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderPlannerItems(){
    const grid = $id('planner-clothing');
    if(!grid) return;
    grid.innerHTML = '';

    // Hide welcome panel if items exist
    const welcomePanel = document.querySelector('.welcome-panel');
    if(welcomePanel){
      welcomePanel.style.display = items.length === 0 ? 'block' : 'none';
    }
    
    // Hide/show Current Outfit panel based on items existence
    const currentOutfitPanel = document.querySelector('.current-outfit');
    if(currentOutfitPanel){
      currentOutfitPanel.style.display = items.length === 0 ? 'none' : 'block';
    }
    
    if(items.length===0){ grid.innerHTML = '<div class="empty-text">Your closet is empty – add items in My Closet first.</div>'; return; }

    // Get filter values from custom dropdowns
    const categoryFilterEl = $id('filter-category');
    const seasonFilterEl = $id('filter-season');
    const categoryFilter = categoryFilterEl ? (categoryFilterEl.closest('.custom-dropdown')?.querySelector('.custom-dropdown-option.selected')?.getAttribute('data-value') || 'All') : 'All';
    const seasonFilter = seasonFilterEl ? (seasonFilterEl.closest('.custom-dropdown')?.querySelector('.custom-dropdown-option.selected')?.getAttribute('data-value') || 'All') : 'All';

    // Filter items
    const filteredItems = items.filter(function(it) {
      const categoryMatch = categoryFilter === 'All' || it.category === categoryFilter;
      const seasonMatch = seasonFilter === 'All' || (it.season && it.season.includes(seasonFilter));
      return categoryMatch && seasonMatch;
    });

    if(filteredItems.length === 0){
      grid.innerHTML = '<div class="empty-text">No items match your filters.</div>';
      return;
    }

    filteredItems.forEach(it=>{
      const el = document.createElement('div');
      el.className = 'item';
      el.setAttribute('role','listitem');
      const img = it.imageData || it.imageUrl || '';
      const idStr = String(it.id);
      const isInOutfit = outfit.indexOf(idStr) !== -1;
      // Zähle nur eindeutige Items im Outfit
      const uniqueOutfitCount = Array.from(new Set(outfit)).length;
      const outfitFull = uniqueOutfitCount >= MAX_OUTFIT;
      const btnLabel = isInOutfit ? 'Added' : '+ Add';
      const disabledAttr = (!isInOutfit && outfitFull) ? 'disabled' : '';
      const ariaPressed = isInOutfit ? 'true' : 'false';
      el.innerHTML = `
        <div class="item-thumb"><img src="${escapeHtml(img)}" alt="${escapeHtml(it.name)}"></div>
        <div class="item-body">
          <div class="item-row">
            <div class="item-name">${escapeHtml(it.name||'Untitled')}</div>
            <button class="item-add btn add-btn" aria-pressed="${ariaPressed}" ${disabledAttr}>${btnLabel}</button>
          </div>
        </div>`;
      grid.appendChild(el);
      const btn = el.querySelector('.item-add');
      btn.addEventListener('click', ()=> toggleItem(it.id));
    });
  }

  function renderOutfit(){
    const bar = document.querySelector('.current-outfit .outfit-bar');
    const empty = document.querySelector('.current-outfit .current-empty');
    const saveRow = document.querySelector('.current-outfit .save-row');
    if(!bar) return;
    bar.innerHTML = '';
    if(outfit.length===0){
      empty.style.display = 'flex';
      if(saveRow) saveRow.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    if(saveRow) saveRow.style.display = 'flex';
    // Zeige alle Items im Outfit, nicht nur die ersten 3
    outfit.forEach(id=>{
      const idStr = String(id);
      const it = items.find(x=>String(x.id)===idStr);
      if(!it) return;
      const img = it.imageData || it.imageUrl || '';
      const card = document.createElement('div');
      card.className = 'item';
      card.setAttribute('role','listitem');
      card.innerHTML = `
        <div class="item-thumb"><img src="${escapeHtml(img)}" alt="${escapeHtml(it.name)}"></div>
        <div class="item-body">
          <div class="item-row">
            <div class="item-name">${escapeHtml(it.name||'Untitled')}</div>
            <button class="item-delete" title="Remove">×</button>
          </div>
        </div>`;
      const removeBtn = card.querySelector('.item-delete');
      removeBtn.addEventListener('click', ()=> toggleItem(idStr));
      bar.appendChild(card);
    });
  }

  function toggleItem(id){
    const idStr = String(id);
    const idx = outfit.indexOf(idStr);
    if(idx === -1){
      // add
      const uniqueOutfitCount = Array.from(new Set(outfit)).length;
      if(uniqueOutfitCount >= MAX_OUTFIT){
        showLimitMessage();
        return;
      }
      outfit.push(idStr);
    } else {
      // remove
      outfit.splice(idx,1);
    }
    saveOutfit();
    renderOutfit();
    renderPlannerItems();
  }

  function showLimitMessage(){
    const container = document.querySelector('.current-outfit');
    if(!container) return;
    // avoid duplicate
    if(container.querySelector('.outfit-msg')) return;
    const msg = document.createElement('div');
    msg.className = 'outfit-msg';
    msg.textContent = `Max ${MAX_OUTFIT} items per outfit`;
    container.appendChild(msg);
    setTimeout(()=>{
      msg.classList.add('fade');
      setTimeout(()=> msg.remove(), 300);
    }, 1600);
  }

  function showSavedMessage(text){
    const container = document.querySelector('.current-outfit');
    if(!container) return;
    const msg = document.createElement('div');
    msg.className = 'outfit-msg';
    msg.textContent = text || 'Outfit saved';
    container.appendChild(msg);
    setTimeout(()=>{
      msg.classList.add('fade');
      setTimeout(()=> msg.remove(), 300);
    }, 1200);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    loadItems();
    loadOutfit();
    renderPlannerItems();
    renderOutfit();

    // wire save outfit button (if outfit.js loaded)
    const saveBtn = document.getElementById('save-outfit-btn');
    const nameInput = document.getElementById('outfit-name-input');
    if(saveBtn){
      saveBtn.addEventListener('click', ()=>{
        const snapshot = outfit.map(id => {
          const it = items.find(x => String(x.id) === String(id));
          if(!it) return null;
          return {
            id: String(it.id),
            name: it.name || '',
            category: it.category || '',
            color: it.color || '',
            imageData: it.imageData || null,
            imageUrl: it.imageUrl || null,
            seasons: Array.isArray(it.seasons) ? it.seasons.slice(0) : []
          };
        }).filter(Boolean);
        if(snapshot.length === 0){ showSavedMessage('No items to save'); return; }
        const defaultName = 'Outfit ' + new Date().toLocaleString();
        const name = (nameInput && nameInput.value && nameInput.value.trim()) ? nameInput.value.trim() : defaultName;
        if(window.OutfitStore && typeof window.OutfitStore.saveOutfit === 'function'){
          try{
            window.OutfitStore.saveOutfit(name, snapshot);
            showSavedMessage('Outfit saved');
          }catch(e){
            showSavedMessage('Save failed');
          }
        } else {
          showSavedMessage('Save failed (no OutfitStore)');
        }
      });
    }

    // listen for storage events to update if closet changed in another tab/page
    window.addEventListener('storage', (e)=>{
      if(e.key === STORAGE_KEY){ loadItems(); renderPlannerItems(); renderOutfit(); }
      if(e.key === OUTFIT_KEY){ loadOutfit(); renderOutfit(); }
    });
    
    // Add filter event listeners
    const categoryFilter = $id('filter-category');
    const seasonFilter = $id('filter-season');
    if(categoryFilter){
      categoryFilter.addEventListener('change', renderPlannerItems);
    }
    if(seasonFilter){
      seasonFilter.addEventListener('change', renderPlannerItems);
    }
    
    // Initialize custom dropdowns
    initCustomDropdowns();
  });
  
  // Custom Dropdown functionality for planner
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
        
        // Update hidden input if exists
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

})();
