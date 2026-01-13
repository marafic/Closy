// outfits.js — render saved outfits from OutfitStore on outfits.html
(function(){
  function createThumb(item){
    const el = document.createElement('div');
    el.className = 'saved-thumb';
    const img = document.createElement('img');
    img.alt = item.name || '';
    img.src = item.imageData || item.imageUrl || '';
    el.appendChild(img);
    const caption = document.createElement('div'); caption.className = 'thumb-name'; caption.textContent = item.name || '';
    el.appendChild(caption);
    return el;
  }

  function render(){
    const grid = document.getElementById('saved-outfits-grid');
    if(!grid) return;
    grid.innerHTML = '';
    if(!window.OutfitStore || typeof window.OutfitStore.loadAll !== 'function'){
      grid.innerHTML = '<div class="empty-text">No outfit store available.</div>';
      return;
    }
    const all = window.OutfitStore.loadAll();

    // show/hide the intro containers depending on whether we have saved outfits
    const hero = document.querySelector('.outfits-hero');
    const ideas = document.querySelector('.ideas-panel');
    const cta = document.querySelector('.cta-banner');
    const savedSection = document.getElementById('saved-outfits-section');
    if(all && all.length > 0){
      if(hero) hero.style.display = 'none';
      if(ideas) ideas.style.display = 'none';
      if(cta) cta.style.display = 'none';
      if(savedSection) savedSection.style.display = '';
    } else {
      if(hero) hero.style.display = '';
      if(ideas) ideas.style.display = '';
      if(cta) cta.style.display = '';
      if(savedSection) savedSection.style.display = 'none';
    }
    if(!all || all.length===0){
      grid.innerHTML = '<div class="empty-text">No saved outfits yet.</div>';
      return;
    }

    all.forEach(rec=>{
      const card = document.createElement('div'); card.className = 'saved-outfit-card';
      const header = document.createElement('div'); header.className = 'saved-header';
      const title = document.createElement('div'); title.className = 'saved-title'; title.textContent = rec.name || 'Untitled';
      const actions = document.createElement('div'); actions.className = 'saved-actions';
      const delBtn = document.createElement('button'); delBtn.className = 'action-delete'; delBtn.title = 'Delete'; delBtn.innerHTML = '✕'; delBtn.style.color = '#000';
      actions.appendChild(delBtn);
      header.appendChild(title); header.appendChild(actions);
      card.appendChild(header);

      const itemsRow = document.createElement('div'); itemsRow.className = 'saved-items';
      (rec.items||[]).slice(0,6).forEach(it=>{
        itemsRow.appendChild(createThumb(it));
      });
      card.appendChild(itemsRow);

      // actions
      delBtn.addEventListener('click', ()=>{
        // delete without confirm; show a short deleted message
        try{
          window.OutfitStore.deleteOutfit(rec.id);
          const note = document.createElement('div'); note.className='outfit-msg'; note.textContent = 'Outfit deleted'; card.appendChild(note);
          setTimeout(()=> note.classList.add('fade'), 800);
          setTimeout(()=> note.remove(), 1200);
        }catch(e){}
        render();
      });

      grid.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
  window.renderSavedOutfits = render;
})();
