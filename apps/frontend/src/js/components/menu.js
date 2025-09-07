import { getUserSession, subscribeUserSession } from '../store/store.js'
import { API_URL } from '../config/globalConfig.js'
import { checkUserSession } from '../services/checkUserSession.js'


const nav = document.querySelector('.nav')
const navMenus = document.querySelectorAll('.nav-links-menu')
const navMenu1 = navMenus[0]
const navMenu2 = navMenus[1]
const openButtons = document.querySelectorAll('.nav-menu')
const openButton1 = openButtons[0]
const closeButtonMenu = document.querySelector('#close-menu')
const signUpButton = document.getElementById('sign-up')
const signUpModal = document.getElementById('auth-register')
const innerSignUp = document.getElementById('inner-sign-up')
const signInButton = document.getElementById('sign-in')
const signInModal = document.getElementById('auth-login')
const innerSignIn = document.getElementById('inner-sign-in')
const closeButtonsModals = document.querySelectorAll('.close-modal')
const authForms = document.querySelectorAll('.auth-form')
const logoutButton = document.querySelector('#logout')
const navLogin = document.querySelector('.nav-login')
const navLogout = document.querySelector('.nav-logout')


function renderNavMenu(fn) {
  return () => {
    const userSession = fn()
    console.log('menu session', userSession)
    if (userSession) {
      navLogin.style.display = 'none'
      navLogout.style.display = 'flex'
    } else {
      navLogin.style.display = 'flex'
      navLogout.style.display = 'none'
    }
  }
}

async function startNavMenu() {  
  try {
    await checkUserSession()
    const unsubscribeUserSession = subscribeUserSession(renderNavMenu(getUserSession), true)
  } catch (error) {
    console.error(error)
  }




  logoutButton.addEventListener('click', async (e) => {
    try {
      const res = await fetch(API_URL + '/auth/logout', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include'
      })
  
      if(!res.ok) console.error('No se pudo cerrar sesión')
  
      const isLogout = await res.json()
      console.log('isLogout', isLogout)
      
      await checkUserSession()
    } catch(error) {
      console.error(error)
    }
  })
  
  authForms.forEach(eachForm => eachForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    try {
      const data = Object.fromEntries(new FormData(e.target))
    
      const res = await fetch(e.target.action, {
        method: e.target.method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // 👈 muy importante
      })
        
      const result = await res.json()
      
      await checkUserSession()
    } catch (error) {
      console.error(error)
    }
  })
  )


  closeButtonsModals.forEach(eachButton => {
    eachButton.addEventListener('click', e => {
      if (signUpModal.open) signUpModal.close()
      if (signInModal.open) signInModal.close()
    })
  })

  signUpButton.addEventListener('click', e => {
    const button = e.currentTarget

    if (!button) return 

    signInModal.close()
    signUpModal.showModal()
  })

  innerSignUp.addEventListener('click', e => {
    const button = e.currentTarget

    if (!button) return 

    signInModal.close()
    signUpModal.showModal()
  })

  signInButton.addEventListener('click', e => {
    const button = e.currentTarget

    if (!button) return 

    signUpModal.close()
    signInModal.showModal()
  })

  innerSignIn.addEventListener('click', e => {
    const button = e.currentTarget

    if (!button) return 

    signUpModal.close()
    signInModal.showModal()
  })

  openButton1.addEventListener('click', (e) => {
    navMenu1.classList.add('nav-links-show')
    navMenu1.classList.remove('nav-links-no-transition')
    nav.style.zIndex = 200
  })

  closeButtonMenu.onclick = (e) => {
    navMenu1.classList.remove('nav-links-show')
    nav.style.zIndex = 0
  }

  // Detecta cuando la ventana cambia de tamaño y resetea el menú en escritorio.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) {
      navMenu1.classList.add('nav-links-no-transition') // Evita la animación al redimensionar
      navMenu1.classList.remove('nav-links-show') // Asegurar que el menú se oculta en escritorio
      navMenu2.classList.add('nav-links-no-transition') 
    }
  })
}

startNavMenu()