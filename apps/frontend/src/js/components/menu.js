import { getUserSession, subscribeUserSession } from '../store/store.js'
import { API_URL } from '../config/globalConfig.js'
import { checkUserSession } from '../services/checkUserSession.js'
import { CodeError } from '../store/customErrors.js'


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
const buttonGoogle = document.querySelector('#auth_google')

buttonGoogle.addEventListener('click', e => {
  window.location.href = API_URL + '/auth/google'
})

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

  function resetFormInputs(element) {
    const successEntry = element.querySelector('#success-entry')
    if (successEntry) successEntry.remove()
    if (element.close) {
      const allInputs = element.querySelectorAll('input')
      allInputs.forEach(eachInput => {
        eachInput.value = ''
        eachInput.style.border = '1px solid silver'
      })
    }
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
      let inputEmail
      if(eachForm.id === 'form-register') {
        inputEmail = eachForm.querySelector('[name="email"]')
        inputEmail.style.border = '1px solid silver'
      }
      const inputName = eachForm.querySelector('[name="username"]')
      inputName.style.border = '1px solid silver'
      const inputPass = eachForm.querySelector('[name="password"]')
      inputPass.style.border = '1px solid silver'
      const inputConfirmPass = eachForm.querySelector('[name="confirm_password"]')
      if (inputConfirmPass) inputConfirmPass.style.border = '1px solid silver'
      const errorElement = eachForm.querySelector('#error-element')
      if(errorElement) errorElement.remove()
      const successEntry = document.createElement('small')
      eachForm.querySelectorAll('small').forEach(e => {
        if (e.id !== 'auth_redirect') e.remove()
      })

      const data = Object.fromEntries(new FormData(e.target))

      const { confirm_password, password } = data

      if (eachForm.id === 'form-register' && password !== confirm_password) {
        throw Error('The passwords must be the same')
      }
    
      const res = await fetch(e.target.action, {
        method: e.target.method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // 👈 muy importante
      })

      // ⬅ Aquí verificamos el estado HTTP
      if (!res.ok) {
        const errorData = await res.json()  // parseamos el error
        throw errorData
      }
        
      const result = await res.json()
      
      successEntry.textContent = result.message
      successEntry.style.color = 'green'
      eachForm.append(successEntry)
      
      await checkUserSession()
    } catch (error) {
      let inputEmail
      if(eachForm.id === 'form-register') {
        inputEmail = eachForm.querySelector('[name="email"]')
        inputEmail.style.border = '1px solid silver'
      }
      const inputName = eachForm.querySelector('[name="username"]')
      inputName.style.border = '1px solid silver'
      const inputPass = eachForm.querySelector('[name="password"]')
      inputPass.style.border = '1px solid silver'
      const inputConfirmPass = eachForm.querySelector('[name="confirm_password"]')
      if (inputConfirmPass) inputConfirmPass.style.border = '1px solid silver'

      if(error.message === 'The passwords must be the same') {
        const errorElement = document.createElement('small')
        errorElement.textContent = error.message
        errorElement.style.color = 'red'

        inputPass.style.border = '2px solid red'
        if (inputConfirmPass) {
          inputConfirmPass.style.border = '2px solid red'
          inputConfirmPass.insertAdjacentElement('afterend', errorElement)
        }
      }

      if(error.type === 'ZodError') {
        const errorElement = document.createElement('small')
        errorElement.textContent = error.message
        errorElement.style.color = 'red'

        switch(error.code) {
        case 'username':
          inputName.style.borderColor = '2px solid red'
          inputName.insertAdjacentElement('afterend', errorElement)
          break
        case 'password':
          inputPass.style.border = '2px solid red'
          inputPass.insertAdjacentElement('afterend', errorElement)
          break
        case 'email':
          inputEmail.style.border = '2px solid red'
          inputEmail.insertAdjacentElement('afterend', errorElement)
          break  
        }
      }

      if(error.type === 'CustomError') {
        const errorElement = document.createElement('small')
        errorElement.textContent = error.message
        errorElement.style.color = 'red'
        errorElement.id = 'error-element'

        switch(error.code) {
        case CodeError.INVALID_EMAIL:
          if (inputEmail) inputEmail.style.border = '2px solid red'
          inputEmail.insertAdjacentElement('afterend', errorElement)
          break
        case CodeError.UNSECURE_PASSWORD:
          inputPass.style.border = '2px solid red'
          inputPass.insertAdjacentElement('afterend', errorElement)
          break
        case CodeError.USERNAME_TAKEN:
          inputName.style.border = '2px solid red'
          inputName.insertAdjacentElement('afterend', errorElement)
          break
        case CodeError.USER_ALREADY_EXISTS:
          inputName.style.border = '2px solid red'
          inputName.insertAdjacentElement('afterend', errorElement)
          if (inputEmail) inputEmail.style.border = '2px solid red'
          inputEmail.insertAdjacentElement('afterend', errorElement)
          eachForm.prepend(errorElement)
          break
        default:
          if (inputEmail) inputEmail.style.border = '2px solid red'
          inputPass.style.border = '2px solid red'
          inputName.style.border = '2px solid red'
          eachForm.prepend(errorElement)
          break
        }


      }
    }
  })
  )

  closeButtonsModals.forEach(eachButton => {
    eachButton.addEventListener('click', e => {
      if (signUpModal.open) {
        signUpModal.close()
        signUpModal.querySelectorAll('small').forEach(e => {
          if (e.id !== 'auth_redirect') e.remove()
        })
        resetFormInputs(signUpModal)
      }
      if (signInModal.open) {
        signInModal.close()
        signInModal.querySelectorAll('small').forEach(e => {
          if (e.id !== 'auth_redirect') e.remove()
        })
        resetFormInputs(signInModal)
      }
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

  closeButtonMenu.addEventListener('click',  (e) => {
    navMenu1.classList.remove('nav-links-show')
    nav.style.zIndex = 0
  })
  
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