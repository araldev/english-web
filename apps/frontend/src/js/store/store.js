/* ===========================================================================================================
===    IMPORTANTE USAR un OBJETO PARA QUE SE PUEDA ACCEDER A SU REFERENCIA INDEPENDIENTEMENTE DEL MÓDULO   ===
============================================================================================================== */
const store = {
  userSession: null
}

const userSessionListeners = []

export const getUserSession = () => {
  return store.userSession
}

export const setUserSession = (newUserSession) => {
  if (newUserSession == null) {
    store.userSession = null
  } else {
    store.userSession = {}
    Object.assign(store.userSession, newUserSession)
  }

  const copyuserSessionListeners = [ ...userSessionListeners ]

  if (copyuserSessionListeners.length > 0) copyuserSessionListeners.forEach(eachListenerFn => eachListenerFn())

  return store.userSession
}

export const subscribeUserSession = (fn, instaCallFn = false) => {
  userSessionListeners.push(fn)
  if(instaCallFn) fn()

  return () => {
    const index = userSessionListeners.indexOf(fn)
    if (index > -1) userSessionListeners.splice(index, 1)
  }
}