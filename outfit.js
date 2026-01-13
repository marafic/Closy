// outfit.js — small outfit persistence library
(function(){
  const KEY = 'closy-saved-outfits-v1';

  function uid(){ return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9); }

  function loadAll(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveAll(arr){
    try{ localStorage.setItem(KEY, JSON.stringify(arr || [])); }catch(e){}
  }

  function saveOutfit(name, itemsSnapshot){
    if(!Array.isArray(itemsSnapshot)) itemsSnapshot = [];
    const all = loadAll();
    const now = new Date().toISOString();
    const record = {
      id: uid(),
      name: name || ('Outfit ' + (all.length + 1)),
      items: itemsSnapshot.slice(0),
      createdAt: now
    };
    all.unshift(record);
    saveAll(all);
    return record;
  }

  function getOutfit(id){
    const all = loadAll();
    return all.find(o=>o.id === id) || null;
  }

  function deleteOutfit(id){
    let all = loadAll();
    all = all.filter(o=>o.id !== id);
    saveAll(all);
  }

  function clearAll(){
    saveAll([]);
  }

  // expose API
  window.OutfitStore = {
    loadAll,
    saveOutfit,
    getOutfit,
    deleteOutfit,
    clearAll,
    _KEY: KEY
  };
})();
