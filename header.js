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

  try {
    // Ensure basic PWA/meta tags exist in <head>
    var head = document.head;
    if (head) {
      // theme-color
      if (!head.querySelector('meta[name="theme-color"]')) {
        var theme = document.createElement('meta');
        theme.setAttribute('name', 'theme-color');
        theme.setAttribute('content', '#ffffff');
        head.appendChild(theme);
      }

      // app icons
      if (!head.querySelector('link[rel="icon"]')) {
        var icon = document.createElement('link');
        icon.setAttribute('rel', 'icon');
        icon.setAttribute('href', 'Bilder/ClosyLogo.png');
        head.appendChild(icon);
      }
      if (!head.querySelector('link[rel="apple-touch-icon"]')) {
        var apple = document.createElement('link');
        apple.setAttribute('rel', 'apple-touch-icon');
        apple.setAttribute('href', 'Bilder/ClosyLogo.png');
        head.appendChild(apple);
      }

      // manifest
      if (!head.querySelector('link[rel="manifest"]')) {
        var manifest = document.createElement('link');
        manifest.setAttribute('rel', 'manifest');
        manifest.setAttribute('href', 'manifest.webmanifest');
        head.appendChild(manifest);
      }
    }

    // Register service worker (if supported)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(function(){});
    }
  } catch (e) {}
});
