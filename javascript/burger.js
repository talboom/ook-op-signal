function closeAllMenus() {
    const $navbarBurgers = document.querySelectorAll('.navbar-burger');
    $navbarBurgers.forEach(el => {
        el.classList.remove('is-active');
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        if ($target) {
            $target.classList.remove('is-active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    const $navbarMenus = document.querySelectorAll('.navbar-menu');
  
    // Add a click event on each burger
    $navbarBurgers.forEach(el => {
        el.addEventListener('click', (e) => {
            // Stop propagation to prevent the document click from immediately closing the menu
            e.stopPropagation();
            
            // Get the target from the "data-target" attribute
            const target = el.dataset.target;
            const $target = document.getElementById(target);
  
            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        // Check if the click is outside any navbar menu and burger
        const isClickInsideMenu = Array.from($navbarMenus).some(menu => 
            menu.contains(e.target) || e.target.closest('.navbar-burger')
        );
        
        if (!isClickInsideMenu) {
            closeAllMenus();
        }
    });
});