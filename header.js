// Shared header component injection for all pages
// Dynamically injects logo and brand name into pages with <div id="site-header"></div>

document.addEventListener('DOMContentLoaded', function () {
  // Find target container for header
  var target = document.getElementById('site-header');
  if (!target) return; // Exit if no header container exists
  
  // Inject header HTML: logo image + brand text
  target.innerHTML = '<div class="logo-wrap">'
    + '<div class="logo-mark" aria-hidden="true">' // Decorative element, hidden from screen readers
    + '<img src="Bilder/ClosyLogo.png" alt="Closy Logo" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover;">'
    + '</div>'
    + '<div class="brand">'
    + '<div class="brand-name">Closy</div>' // Main brand name
    + '<div class="brand-tag">Mix, Match &amp; Share</div>' // Brand tagline
    + '</div>'
    + '</div>';
});
