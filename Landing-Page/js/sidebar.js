(function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarBtn = document.getElementById('sidebar-size-btn');
    const allMenuLinks = document.querySelectorAll('.sidebar-links');
    const menuLinks = document.querySelectorAll('.sidebar-link');
    const allSubmenuContainer = document.querySelectorAll('.sidebar-submenu');
    const allSubmenuLinks = document.querySelectorAll('.submenu-link');

    window.addEventListener('resize', e => {
        sidebar.classList.contains('minimize') ? sidebar.classList.add('minimize') : sidebar.classList.remove('minimize');
        if(window.innerWidth > 600) {
            sidebar.style.transform = 'translateX(0%)';
        }
        if(window.innerWidth < 600) {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.classList.add('minimize');

            allSubmenuContainer.forEach(container => {
                container.style.height = '0';
                container.classList.remove('toggle');
                container.parentElement.classList.remove('active');
            });
        }
    });

    window.addEventListener('load', e => {
        if(window.innerWidth <= 600) {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.classList.add('minimize');
        } else {
            // sidebar.classList.remove('minimize');
        }
    });

    // Para cerrar el sidebar si se clica fuera de él.
    document.addEventListener('click', e => {
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
    })

    sidebarBtn.addEventListener('click', e => {
        sidebar.classList.toggle('minimize');

        if (window.innerWidth <= 600) {
            if (sidebar.style.transform === 'translateX(0%)') {
                sidebar.style.transform = 'translateX(-100%)';
                allSubmenuContainer.forEach(container => {
                    container.style.height = '0';
                    container.classList.remove('toggle');
                    container.parentElement.classList.remove('active');
                });
            } else {
                sidebar.style.transform = 'translateX(0%)';
            }
        }
    });

    if(menuLinks.length === 0 || allSubmenuContainer.length === 0) return;

    menuLinks.forEach(link => {
        if(window.location.href.includes('index.html') && link.querySelector('span').innerText === "Home"){
            link.classList.add('current');
        }
        if(window.location.href.includes('lessons.html') && link.querySelector('span').innerText === "Lessons"){
            link.classList.add('current');
        }
        if(window.location.href.includes('exercises.html') && link.querySelector('span').innerText === "Interactive Exercises"){
            link.classList.add('current');
        }
    });

    allMenuLinks.forEach(link => {
        link.addEventListener('click', (e) =>  {
            const submenuContainer = link.querySelector('ul');
            
            if (!submenuContainer || submenuContainer.tagName !== 'UL') return;
            if(submenuContainer.tagName === 'UL') e.preventDefault();

            allSubmenuContainer.forEach(container => {
                if (container !== submenuContainer) {
                    console.log(container.style.height)
                    container.style.height = '0';
                    container.classList.remove('toggle');
                    container.parentElement.classList.remove('active');
                }
            });

            link.classList.toggle('active');
            submenuContainer.classList.toggle('toggle');
            
            if (link.classList.contains('active')) {
                submenuContainer.style.height = `${submenuContainer.scrollHeight}px`;
            } else {
                submenuContainer.style.height = '0';
            }
        });       
    });

    allSubmenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation(); // Esto impide que el <a> no direccione correctamente.
            console.log("Clic en submenú:", link.href);
        });
    });
})();

/* https://www.youtube.com/watch?v=8nRW5WzV7Zg&t=1910s
   min 42 ver como cierra los submenus */