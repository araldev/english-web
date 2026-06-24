import { getUserSession, setUserSession, subscribeUserSession } from '../store/store.js'
import { decodeSessionFromCookie } from '../services/checkUserSession.js'

(function() {
  const sessionFromCookie = decodeSessionFromCookie()
  if (sessionFromCookie) setUserSession(sessionFromCookie)

  const sidebar = document.getElementById('sidebar')
  const sidebarBtn = document.getElementById('sidebar-size-btn')
  const allMenuLinks = document.querySelectorAll('.sidebar-links')
  const menuLinks = document.querySelectorAll('.sidebar-link')
  const allSubmenuContainer = document.querySelectorAll('.sidebar-submenu')
  const allSubmenuLinks = document.querySelectorAll('.submenu-link')
  const buttonUserSettings = document.querySelector('#sidebar_user_settings')
  const userData = document.querySelector('.sidebar-user .user-data')
  const userTitle = userData?.querySelector('.user-tittle')
  const userImg = userData?.querySelector('.user-img')

  const signInModal = document.getElementById('auth-login')
  const signUpModal = document.getElementById('auth-register')

  function renderSidebarUser() {
    const userSession = getUserSession()

    if (userSession) {
      if (userTitle) userTitle.textContent = userSession.username || 'User'
      if (userImg) {
        userImg.src = userSession.picture || './public/images/user_profile.svg'
        if (userSession.picture) userImg.referrerPolicy = 'no-referrer'
      }
    } else {
      if (userTitle) userTitle.textContent = 'Sign In/Up'
      if (userImg) userImg.src = './public/images/user_profile.svg'
    }
  }

  subscribeUserSession(renderSidebarUser, true)

  userData?.addEventListener('click', e => {
    e.preventDefault()

    const userSession = getUserSession()

    if (userSession) {
      window.location.href = './user_profile.html'
    } else {
      signInModal.showModal()
    }
  })

  buttonUserSettings.addEventListener('click', e => {
    e.preventDefault()

    const userSession = getUserSession()

    if (userSession)  {
      window.location.href = buttonUserSettings.href
    } else {
      signInModal.showModal()
    }
  })

  window.addEventListener('resize', e => {
    requestAnimationFrame(() => {
      if(!sidebar.classList.contains('minimize')) {
        sidebar.classList.add('minimize')
      };

      if(window.innerWidth > 600) {
        sidebar.style.transform = 'translateX(0%)'
      };
      if(window.innerWidth < 600) {
        sidebar.style.transform = 'translateX(-100%)'
        sidebar.classList.add('minimize')

        allSubmenuContainer.forEach(container => {
          container.style.height = '0'
          container.parentElement.classList.remove('active')
        })
      };
    })
  })

  window.addEventListener('load', e => {
    if(window.innerWidth <= 600) {
      sidebar.style.transform = 'translateX(-100%)'
      sidebar.classList.add('minimize')
    } else {
      // sidebar.classList.remove('minimize');
    };
  })

  // Para cerrar el sidebar si se clica fuera de él.
  document.addEventListener('click', e => {
    if(sidebar.contains(e.target)) return

    if(window.innerWidth > 600) {
      sidebar.classList.add('minimize')
      allSubmenuContainer.forEach(container => {
        container.style.height = '0'
        container.parentElement.classList.remove('active')
      })
    };
    if(window.innerWidth < 600) {
      sidebar.style.transform = 'translateX(-100%)'
      sidebar.classList.add('minimize')

      allSubmenuContainer.forEach(container => {
        container.style.height = '0'
        container.parentElement.classList.remove('active')
      })
    };
  })

  sidebarBtn.addEventListener('click', e => {
    sidebar.classList.toggle('minimize')

    if (window.innerWidth > 600) return

    if (sidebar.style.transform === 'translateX(0%)') {
      sidebar.style.transform = 'translateX(-100%)'
      allSubmenuContainer.forEach(container => {
        container.style.height = '0'
        container.parentElement.classList.remove('active')
      })
    } else {
      sidebar.style.transform = 'translateX(0%)'
    };
  })

  if(menuLinks.length === 0 || allSubmenuContainer.length === 0) return

  menuLinks.forEach(link => {
    const path = window.location.pathname
    const linkText = link.querySelector('span')?.innerText.trim()
    
    if ((path.endsWith('/') || path.includes('index.html')) && linkText === 'Home') {
      link.classList.add('current')
    }
    if (path.includes('lessons.html') && linkText === 'Lessons') {
      link.classList.add('current')
    }
    if (path.includes('exercises.html') && linkText === 'Interactive Exercises') {
      link.classList.add('current')
    }
    if (path.includes('user_profile.html') && linkText === 'Settings') {
      link.classList.add('current')
    }
  })

  allMenuLinks.forEach(link => {
    link.addEventListener('click', (e) =>  {
      const submenuContainer = link.querySelector('ul')
            
      if (!submenuContainer || submenuContainer.tagName !== 'UL') return
            
      e.preventDefault()

      requestAnimationFrame(() => {
        allSubmenuContainer.forEach(container => {
          if (container !== submenuContainer) {
            container.style.height = '0'
            container.parentElement.classList.remove('active')
          }
        })
      })

      requestAnimationFrame(() => {
        link.classList.toggle('active')
        
        if (link.classList.contains('active')) {
          submenuContainer.style.height = `${submenuContainer.scrollHeight}px`
        } else {
          submenuContainer.style.height = '0'
        }
      })
    })
  })

  allSubmenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation() // Esto impide que el <a> no direccione correctamente.
    })
  })
})()

/* https://www.youtube.com/watch?v=8nRW5WzV7Zg&t=1910s
   min 42 ver como cierra los submenus */