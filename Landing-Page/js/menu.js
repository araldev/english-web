(function() {
    const nav = document.querySelector('.nav');
    const navMenus = document.querySelectorAll('.nav-links-menu');
    const navMenu1 = navMenus[0];
    const navMenu2 = navMenus[1];
    const openButtons = document.querySelectorAll('.nav-menu');
    const openButton1 = openButtons[0];
    const closeButtons = document.querySelectorAll('.nav-close');
    const closeButton1 = closeButtons[0];

    openButton1.addEventListener('click', (e) => {
        navMenu1.classList.add('nav-links-show');
        navMenu1.classList.remove('nav-links-no-transition');
        nav.style.zIndex = 200;
    });

    closeButton1.onclick = (e) => {
        navMenu1.classList.remove('nav-links-show');
        nav.style.zIndex = 0;
    };

    // Detecta cuando la ventana cambia de tamaño y resetea el menú en escritorio.
    window.addEventListener('resize', () => {
        if (window.innerWidth > 600) {
            navMenu1.classList.add('nav-links-no-transition'); // Evita la animación al redimensionar
            navMenu1.classList.remove('nav-links-show'); // Asegurar que el menú se oculta en escritorio
            navMenu2.classList.add('nav-links-no-transition'); 
        }
    });
})();