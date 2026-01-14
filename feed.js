// Feed functionality: user following, post rendering, likes, and borrow requests
// Wrapped in IIFE to avoid global scope pollution
(function(){
  // LocalStorage keys for persisting data
  const FOLLOWING_KEY = 'closy-following-v1'; // Stores users you follow
  const POSTS_KEY = 'closy-posts-v1'; // Stores user-created posts
  const LIKES_KEY = 'closy-likes-v1'; // Stores liked post IDs
  const BORROWS_KEY = 'closy-borrows-v1'; // Stores borrow requests per post

  // SVG icon constants (reusable across UI)
  const SVG_HEART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="#111" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#111" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_BAG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4H6z" stroke="#111" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6h18" stroke="#111" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#111" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Sample posts data - simulates backend data for demo purposes
  // Each post includes author info, outfit image, description, and individual clothing items
  const allPosts = [
    {
      id: 'post1',
      author: 'Yarah',
      authorId: 'user1',
      avatar: 'https://i.pravatar.cc/120?img=5',
      username: 'yarah_mw',
      title: 'Autumn Layers',
      description: 'Perfect fall vibes! 🍂 Loving this cozy layered look for the cooler weather',
      image: 'Bilder/fit1.jpg',
      likes: 24,
        items: [
          { name: 'Denim Jacket', category: 'Outerwear', color: 'Blue', image: 'Bilder/beigetrenchcoat.jpg' },
          { name: 'White T-Shirt', category: 'Tops', color: 'White', image: 'Bilder/weisstshirt.jpg' },
          { name: 'Black Jeans', category: 'Bottoms', color: 'Black', image: 'Bilder/dunkelblaujeans.jpg' },
          { name: 'Brown Boots', category: 'Shoes', color: 'Brown', image: 'Bilder/braunlederschuhe.jpg' },
          { name: 'Leather Bag', category: 'Accessories', color: 'Brown', image: 'Bilder/braunledertasche.jpg' }
        ]
    },
    {
      id: 'post2',
      author: 'Sila',
      authorId: 'user2',
      avatar: 'https://i.pravatar.cc/120?img=9',
      username: 'sila.s58_',
      title: 'Casual Sunday',
      description: 'Keeping it simple and comfy for a relaxed weekend look ☀️',
      image: 'Bilder/fit2.jpg',
      likes: 39,
        items: [
          { name: 'Striped Sweater', category: 'Tops', color: 'Beige', image: 'Bilder/graupulli.jpg' },
          { name: 'High Waist Jeans', category: 'Bottoms', color: 'Blue', image: 'Bilder/hellblaushorts.jpg' },
          { name: 'White Sneakers', category: 'Shoes', color: 'White', image: 'Bilder/beigesandalen.jpg' }
        ]
    },
    {
      id: 'post3',
      author: 'Emilia',
      authorId: 'user3',
      avatar: 'https://i.pravatar.cc/120?img=47',
      username: 'emilia_kopp',
      title: 'Office Ready',
      description: 'Professional but stylish - perfect for those important meetings 💼',
      image: 'Bilder/fit3.jpg',
      likes: 27,
        items: [
          { name: 'Blazer', category: 'Outerwear', color: 'Black', image: 'Bilder/schwarzlederjacke.jpg' },
          { name: 'Silk Blouse', category: 'Tops', color: 'Cream', image: 'Bilder/weisserpulli.jpg' },
          { name: 'Trousers', category: 'Bottoms', color: 'Black', image: 'Bilder/schwarzrock.jpg' },
          { name: 'Heels', category: 'Shoes', color: 'Nude', image: 'Bilder/blauheels.jpg' }
        ]
    },
    {
      id: 'post4',
      author: 'Yarah',
      authorId: 'user1',
      avatar: 'https://i.pravatar.cc/120?img=5',
      username: 'yarah_mw',
      title: 'Weekend Vibes',
      description: 'Brunch ready! ☕ Love mixing casual pieces with statement accessories',
      image: 'Bilder/fit4.jpg',
      likes: 31,
        items: [
          { name: 'Oversized Sweater', category: 'Tops', color: 'Beige', image: 'Bilder/beigeponcho.jpg' },
          { name: 'Mom Jeans', category: 'Bottoms', color: 'Light Blue', image: 'Bilder/braunsneaker.jpg' },
          { name: 'Gold Necklace', category: 'Accessories', color: 'Gold', image: 'Bilder/goldsonnenbrille.jpg' }
        ]
    }
  ];

  // ========== FOLLOWING SYSTEM ==========
  // Manages which users you follow (stored as object with userId keys)

  // Loads following data from localStorage
  function loadFollowing(){
    try{
      const raw = localStorage.getItem(FOLLOWING_KEY);
      return raw ? JSON.parse(raw) : {}; // Return empty object if no data
    }catch(e){ return {}; } // Fail gracefully on parse errors
  }

  // Saves following data to localStorage
  function saveFollowing(following){
    try{
      localStorage.setItem(FOLLOWING_KEY, JSON.stringify(following));
    }catch(e){} // Fail silently if storage quota exceeded
  }

  // Toggles follow status for a user (follow if not following, unfollow if following)
  function toggleFollow(userId, userName){
    let following = loadFollowing();
    if(following[userId]){
      delete following[userId]; // Unfollow
    } else {
      following[userId] = { name: userName, followedAt: Date.now() }; // Follow with timestamp
    }
    saveFollowing(following);
    return !!following[userId]; // Returns true if now following, false if unfollowed
  }

  // Checks if you're currently following a specific user
  function isFollowing(userId){
    const following = loadFollowing();
    return !!following[userId];
  }

  // ========== LIKE SYSTEM ==========
  // Manages which posts you've liked (stored as object with postId keys)
  // Now also stores the like count for each post

  // Loads liked posts from localStorage
  function loadLikes(){
    try{
      const raw = localStorage.getItem(LIKES_KEY);
      return raw ? JSON.parse(raw) : {}; // Return empty object if no data
    }catch(e){ return {}; } // Fail gracefully on parse errors
  }

  // Saves liked posts to localStorage
  function saveLikes(likes){
    try{
      localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    }catch(e){} // Fail silently if storage quota exceeded
  }

  // Toggles like status for a post (like if not liked, unlike if liked)
  // Returns the new count
  function toggleLike(postId, currentCount){
    let likes = loadLikes();
    
    // Find the original post to get base count
    const post = allPosts.find(p => p.id === postId);
    const baseCount = post ? post.likes : (currentCount || 0);
    
    if(likes[postId] && likes[postId].liked){
      // Unlike: decrement count
      const newCount = Math.max(0, (likes[postId].count || baseCount) - 1);
      likes[postId] = { count: newCount, liked: false, likedAt: Date.now() };
    } else {
      // Like: increment count
      const prevCount = likes[postId] ? likes[postId].count : baseCount;
      const newCount = prevCount + 1;
      likes[postId] = { count: newCount, liked: true, likedAt: Date.now() };
    }
    
    saveLikes(likes);
    return likes[postId]; // Returns the like data object
  }

  // Checks if you've liked a specific post
  function isLiked(postId){
    const likes = loadLikes();
    return !!(likes[postId] && likes[postId].liked);
  }

  // Gets the current like count for a post
  function getLikeCount(postId){
    const likes = loadLikes();
    if(likes[postId]){
      return likes[postId].count;
    }
    // Return base count from allPosts
    const post = allPosts.find(p => p.id === postId);
    return post ? post.likes : 0;
  }

  // Updates the visual state of a like button based on like status
  function updateLikeButton(btn, postId){
    const likes = loadLikes();
    const likeData = likes[postId];
    const countSpan = btn.querySelector('.count');
    
    if(likeData && likeData.liked){
      btn.classList.add('liked'); // Purple heart icon
      if(countSpan) countSpan.textContent = likeData.count;
    } else {
      btn.classList.remove('liked'); // Default heart icon
      if(countSpan){
        const count = likeData ? likeData.count : getLikeCount(postId);
        countSpan.textContent = count;
      }
    }
  }

  // ========== BORROW REQUEST SYSTEM ==========
  // Manages borrow requests for post items (stored as object with postId keys)
  // Each borrow request stores which specific items were requested

  // Loads borrow requests from localStorage
  function loadBorrows(){
    try{
      const raw = localStorage.getItem(BORROWS_KEY);
      return raw ? JSON.parse(raw) : {}; // Return empty object if no data
    }catch(e){ return {}; } // Fail gracefully on parse errors
  }

  // Saves borrow requests to localStorage
  function saveBorrows(borrows){
    try{
      localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));
    }catch(e){} // Fail silently if storage quota exceeded
  }

  // Toggles borrow request for a post (request if not requested, cancel if requested)
  function toggleBorrow(postId, items){
    let borrows = loadBorrows();
    if(borrows[postId]){
      delete borrows[postId]; // Cancel request
    } else {
      borrows[postId] = { items: items, requestedAt: Date.now() }; // Request with item list and timestamp
    }
    saveBorrows(borrows);
    return !!borrows[postId]; // Returns true if now requested, false if cancelled
  }

  // Checks if you've requested to borrow items from a specific post
  function isBorrowed(postId){
    const borrows = loadBorrows();
    return !!borrows[postId];
  }

  // Gets the list of item names you've requested from a specific post
  function getBorrowedItems(postId){
    const borrows = loadBorrows();
    return borrows[postId]?.items || []; // Return empty array if no items borrowed
  }

  // Updates the visual state of a borrow button based on request status
  function updateBorrowButton(btn, postId){
    if(isBorrowed(postId)){
      btn.classList.add('requested');
      btn.innerHTML = `${SVG_CHECK}<span>Requested</span>`; // Checkmark icon
    } else {
      btn.classList.remove('requested');
      btn.innerHTML = `${SVG_BAG}<span>Borrow</span>`; // Bag icon
    }
  }

  // Updates visual state of item cards to show which items are borrowed (grayed out)
  function updatePostItemCards(postCard, postId){
    const borrowedItems = getBorrowedItems(postId); // Get list of borrowed item names
    const itemCards = postCard.querySelectorAll('.post-item-card');
    
    itemCards.forEach(card => {
      const itemName = card.querySelector('.post-item-name')?.textContent;
      if(borrowedItems.includes(itemName)){
        // Gray out borrowed items (visual feedback)
        card.classList.add('borrowed-item');
        card.style.opacity = '0.5';
        card.style.filter = 'grayscale(1)';
        card.style.pointerEvents = 'none';
        card.classList.remove('selected-item');
        card.style.border = '';
        card.style.backgroundColor = '';
      } else {
        // Reset unborrowed items to normal appearance
        card.classList.remove('borrowed-item');
        card.style.opacity = '';
        card.style.filter = '';
        card.style.pointerEvents = '';
      }
    });
  }

  // ========== FEED RENDERING ==========
  
  // Renders posts from users you follow (used by feed-following.html)
  // Made globally accessible so it can be called from inline scripts
  window.renderFollowingFeed = function renderFollowingFeed(){
    const container = document.querySelector('.container');
    if(!container) return;

    // Filter posts to only show those from followed users
    const following = loadFollowing();
    const followingUserIds = Object.keys(following);
    
    const followingPosts = allPosts.filter(function(post){ 
      return followingUserIds.indexOf(post.authorId) !== -1;
    });
    
    const emptySection = container.querySelector('.empty-closet');
    const feedTabs = container.querySelector('.feed-tabs');
    
    // Show empty state if not following anyone or no posts from followed users
    if(followingPosts.length === 0){
      if(emptySection) emptySection.style.display = 'block';
      return;
    }
    
    // Hide empty state and render posts
    if(emptySection) emptySection.style.display = 'none';
    
    followingPosts.forEach(post => {
      const article = createPostCard(post);
      // Insert after tabs if they exist, otherwise append to container
      if(feedTabs){
        feedTabs.insertAdjacentElement('afterend', article);
      } else {
        container.appendChild(article);
      }
    });
  }; // end of window.renderFollowingFeed

  // Creates a complete post card DOM element with header, image, items, and actions
  function createPostCard(post){
    const article = document.createElement('article');
    article.className = 'post-card';
    
    // Build HTML for clothing item cards (displayed next to post image)
    let itemsHtml = '';
    if(post.items && post.items.length > 0){
      post.items.forEach(item => {
        itemsHtml += `
          <div class="post-item-card">
            <div class="post-item-thumb">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="post-item-body">
              <div class="post-item-name">${item.name}</div>
              <div class="post-item-badges">
                <span class="badge">${item.category}</span>
                <span class="badge badge--muted">${item.color}</span>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Assemble post card HTML with template literals
    article.innerHTML = `
      <header class="post-header">
        <div class="post-author">
          <div class="avatar" aria-hidden="true">
            <img src="${post.avatar}" alt="${post.author}'s profile avatar" />
          </div>
          <div class="author-meta">
            <div class="author-name">${post.author}</div>
            <div class="post-date">${post.username}</div>
          </div>
        </div>
        <button class="btn follow-btn ${isFollowing(post.authorId) ? 'following-btn' : ''}" data-user-id="${post.authorId}" data-user-name="${post.author}">${isFollowing(post.authorId) ? 'Following' : 'Follow'}</button>
      </header>

      <div class="post-main">
        <div class="post-thumb"><img src="${post.image}" alt="main item"></div>

        <div class="post-items-section">
          <div class="post-items-header">Items in this outfit</div>
          <div class="post-items-grid">
            ${itemsHtml}
          </div>
        </div>
      </div>

      <div class="post-text">
        <h4 class="post-title">${post.title}</h4>
        <p class="post-desc">${post.description}</p>

        <hr class="post-sep" />

        <div class="post-actions">
          <!-- Like button: toggles liked state and shows like count -->
          <button class="action like ${isLiked(post.id) ? 'liked' : ''}" data-post-id="${post.id}" aria-label="Like">
            ${SVG_HEART}
            <span class="count">${getLikeCount(post.id)}</span>
          </button>

          <!-- Borrow button: toggles request state and updates icon/text -->
          <button class="action borrow ${isBorrowed(post.id) ? 'requested' : ''}" data-post-id="${post.id}" aria-label="Borrow">
            ${isBorrowed(post.id) 
              ? `${SVG_CHECK}<span>Requested</span>`
              : `${SVG_BAG}<span>Borrow</span>`
            }
          </button>
        </div>
      </div>
    `;
    return article;
  }

  // Updates follow button appearance based on follow status
  function updateFollowButton(btn, userId){
    if(isFollowing(userId)){
      btn.textContent = 'Following';
      btn.className = 'btn follow-btn following-btn'; // Gray button style
      btn.removeAttribute('style');
    } else {
      btn.textContent = 'Follow';
      btn.className = 'btn follow-btn'; // Purple gradient button
      btn.removeAttribute('style');
    }
  }

  // ========== EVENT LISTENERS ==========
  // Uses event delegation on document for dynamically created elements
  
  document.addEventListener('DOMContentLoaded', ()=>{
    // Event: Follow/Unfollow button clicks
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('.follow-btn');
      if(!btn) return; // Not a follow button
      
      // Extract user info from button data attributes or DOM
      const userId = btn.getAttribute('data-user-id');
      const userName = btn.getAttribute('data-user-name') || btn.closest('.post-header')?.querySelector('.author-name')?.textContent || 'User';
      
      if(!userId) return; // No user ID found
      
      // Toggle follow state and update button appearance
      toggleFollow(userId, userName);
      updateFollowButton(btn, userId);
      
      // Update following count in localStorage for overview page stats
      try{
        const followingCount = Object.keys(loadFollowing()).length;
        localStorage.setItem('closy-following-count', String(followingCount));
      }catch(e){}
    });

    // Event: Like button clicks
    // Only handle likes if there's no inline like handler (e.g., on feed-following.html)
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('.action.like');
      if(!btn) return; // Not a like button
      
      // Check if we're on a page with inline like handling (feed.html has its own handler)
      const hasInlineLikeHandler = document.getElementById('user-posts-container');
      if(hasInlineLikeHandler) return; // Skip - inline handler will manage this
      
      const postId = btn.getAttribute('data-post-id');
      if(!postId) return; // No post ID found
      
      const countSpan = btn.querySelector('.count');
      const currentCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
      
      // Toggle like state and get new count
      toggleLike(postId, currentCount);
      
      // Sync: Update all like buttons for this post across all feed tabs
      document.querySelectorAll(`.action.like[data-post-id="${postId}"]`).forEach(likeBtn => {
        updateLikeButton(likeBtn, postId);
      });
    });

    // Event: Borrow button clicks (two-step process: select items, then request)
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('.action.borrow');
      if(!btn) return; // Not a borrow button
      
      const postId = btn.getAttribute('data-post-id');
      if(!postId) return; // No post ID found
      
      const postCard = btn.closest('.post-card');
      
      if(isBorrowed(postId)){
        // Already borrowed: cancel the request
        toggleBorrow(postId, []);
        
        // Sync: Update all borrow buttons and item cards across all feed tabs
        document.querySelectorAll(`.action.borrow[data-post-id="${postId}"]`).forEach(borrowBtn => {
          updateBorrowButton(borrowBtn, postId);
          const card = borrowBtn.closest('.post-card');
          if(card) updatePostItemCards(card, postId);
        });
      } else {
        // Not borrowed yet: submit borrow request with selected items
        const selectedItems = [];
        postCard.querySelectorAll('.post-item-card.selected-item').forEach(card => {
          const itemName = card.querySelector('.post-item-name')?.textContent;
          if(itemName) selectedItems.push(itemName);
        });
        
        // Validate: at least one item must be selected
        if(selectedItems.length === 0){
          alert('Please select at least one item to borrow');
          return;
        }
        
        // Save borrow request with selected item names
        toggleBorrow(postId, selectedItems);
        
        // Sync: Update all borrow buttons and gray out borrowed items across all tabs
        document.querySelectorAll(`.action.borrow[data-post-id="${postId}"]`).forEach(borrowBtn => {
          updateBorrowButton(borrowBtn, postId);
          const card = borrowBtn.closest('.post-card');
          if(card) updatePostItemCards(card, postId);
        });
      }
    });

    // Event: Item card clicks for selecting items to borrow
    document.addEventListener('click', (e)=>{
      const card = e.target.closest('.post-item-card');
      if(!card) return; // Not an item card
      
      const postCard = card.closest('.post-card');
      const postId = postCard?.querySelector('.action.borrow')?.getAttribute('data-post-id');
      
      // Prevent selection if item is already borrowed or post has active borrow request
      if(card.classList.contains('borrowed-item') || (postId && isBorrowed(postId))) return;
      
      e.stopPropagation(); // Prevent event bubbling
      
      if(card.classList.contains('selected-item')){
        // Deselect: remove visual highlight
        card.classList.remove('selected-item');
        card.style.border = '';
        card.style.backgroundColor = '';
      } else {
        // Select: add purple border and light background
        card.classList.add('selected-item');
        card.style.border = '2px solid #8b4cff';
        card.style.backgroundColor = '#f9f5ff';
      }
    });

    // Initialize: If on following feed page, following posts will be rendered by inline script in feed-following.html
    // (Prevents duplicate rendering when both feed.js and feed-following.html try to render)
    
    // Initialize: Update follow buttons to reflect current follow state on page load
    document.querySelectorAll('.follow-btn').forEach(btn => {
      const userId = btn.getAttribute('data-user-id');
      if(userId){
        updateFollowButton(btn, userId);
      }
    });

    // Initialize: Update like buttons to reflect current like state on page load
    document.querySelectorAll('.action.like').forEach(btn => {
      const postId = btn.getAttribute('data-post-id');
      if(postId){
        updateLikeButton(btn, postId);
      }
    });

    // Initialize: Update borrow buttons and gray out borrowed items on page load
    document.querySelectorAll('.action.borrow').forEach(btn => {
      const postId = btn.getAttribute('data-post-id');
      if(postId){
        updateBorrowButton(btn, postId);
        const postCard = btn.closest('.post-card');
        if(postCard) updatePostItemCards(postCard, postId); // Gray out borrowed items
      }
    });

    // UX: Make item cards visually clickable by adding pointer cursor
    document.querySelectorAll('.post-item-card').forEach(card => {
      card.style.cursor = 'pointer';
    });

    // Cross-tab sync: Listen for localStorage changes from other browser tabs
    // Updates UI in real-time when following/likes/borrows change in another tab
    const isFollowingPage = window.location.pathname.includes('feed-following.html') || 
                           window.location.href.includes('feed-following.html');
    
    window.addEventListener('storage', (e)=>{
      if(e.key === FOLLOWING_KEY && isFollowingPage){
        // Following changed: clear and re-render following feed
        const existingPosts = document.querySelectorAll('.post-card');
        existingPosts.forEach(post => post.remove());
        window.renderFollowingFeed();
      }
      if(e.key === LIKES_KEY){
        // Likes changed: update all like button states
        document.querySelectorAll('.action.like').forEach(btn => {
          const postId = btn.getAttribute('data-post-id');
          if(postId){
            updateLikeButton(btn, postId);
          }
        });
      }
      if(e.key === BORROWS_KEY){
        // Borrows changed: update borrow buttons and gray out borrowed items
        document.querySelectorAll('.action.borrow').forEach(btn => {
          const postId = btn.getAttribute('data-post-id');
          if(postId){
            updateBorrowButton(btn, postId);
            const postCard = btn.closest('.post-card');
            if(postCard) updatePostItemCards(postCard, postId);
          }
        });
      }
    });
  }); // end DOMContentLoaded

})(); // end IIFE
