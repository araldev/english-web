(function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarBtn = document.getElementById('sidebar-size-btn');
    const allMenuLinks = document.querySelectorAll('.sidebar-links');
    const menuLinks = document.querySelectorAll('.sidebar-link');
    const allSubmenuContainer = document.querySelectorAll('.sidebar-submenu');
    const allSubmenuLinks = document.querySelectorAll('.submenu-link');

    window.addEventListener('resize', e => {
        requestAnimationFrame(() => {
            if(!sidebar.classList.contains("minimize")) {
                sidebar.classList.add("minimize");
            }
            
            if(window.innerWidth > 600) {
                sidebar.style.transform = 'translateX(0%)';
            }
            if(window.innerWidth < 600) {
                sidebar.style.transform = 'translateX(-100%)';
                sidebar.classList.add('minimize');
    
                allSubmenuContainer.forEach(container => {
                    container.style.height = '0';
                    container.parentElement.classList.remove('active');
                });
            }
        });
    });

    window.addEventListener('load', e => {
        requestAnimationFrame(() => {
            if(window.innerWidth <= 600) {
                sidebar.style.transform = 'translateX(-100%)';
                sidebar.classList.add('minimize');
            } else {
                // sidebar.classList.remove('minimize');
            }
        });
    });

    // Para cerrar el sidebar si se clica fuera de él.
    document.addEventListener('click', e => {
        requestAnimationFrame(() => {
            if(!sidebar.contains(e.target)) {
                if(window.innerWidth > 600) {
                    sidebar.classList.add('minimize');
                    allSubmenuContainer.forEach(container => {
                        container.style.height = '0';
                        container.parentElement.classList.remove('active');
                    });
                }
                if(window.innerWidth < 600) {
                    sidebar.style.transform = 'translateX(-100%)';
                    sidebar.classList.add('minimize');
        
                    allSubmenuContainer.forEach(container => {
                        container.style.height = '0';
                        container.parentElement.classList.remove('active');
                    });
                }
            }
        });
    })

    sidebarBtn.addEventListener('click', e => {
        requestAnimationFrame(() => {
            sidebar.classList.toggle('minimize');
    
            if (window.innerWidth <= 600) {
                if (sidebar.style.transform === 'translateX(0%)') {
                    sidebar.style.transform = 'translateX(-100%)';
                    allSubmenuContainer.forEach(container => {
                        container.style.height = '0';
                        container.parentElement.classList.remove('active');
                    });
                } else {
                    sidebar.style.transform = 'translateX(0%)';
                }
            }
        });
    });

    if(menuLinks.length === 0 || allSubmenuContainer.length === 0) return;

     menuLinks.forEach(link => {
        const path = window.location.pathname;
        const linkText = link.querySelector('span')?.innerText.trim();
    
        if ((path.endsWith('/') || path.includes('index.html')) && linkText === "Home") {
            link.classList.add('current');
        }
        if (path.includes('lessons.html') && linkText === "Lessons") {
            link.classList.add('current');
        }
        if (path.includes('exercises.html') && linkText === "Interactive Exercises") {
            link.classList.add('current');
        }
    });

    allMenuLinks.forEach(link => {
        link.addEventListener('click', (e) =>  {
            const submenuContainer = link.querySelector('ul');
            
            if (!submenuContainer || submenuContainer.tagName !== 'UL') return;
            
            e.preventDefault();

            requestAnimationFrame(() => {
                allSubmenuContainer.forEach(container => {
                    if (container !== submenuContainer) {
                            container.style.height = '0';
                            container.parentElement.classList.remove('active');
                    }
                });
            });

            requestAnimationFrame(() => {
                link.classList.toggle('active');
            
                if (link.classList.contains('active')) {
                    submenuContainer.style.height = `${submenuContainer.scrollHeight}px`;
                } else {
                    submenuContainer.style.height = '0';
                }
            });
        });       
    });

    allSubmenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation(); // Esto impide que el <a> no direccione correctamente.
        });
    });
})();

/* https://www.youtube.com/watch?v=8nRW5WzV7Zg&t=1910s
   min 42 ver como cierra los submenus */