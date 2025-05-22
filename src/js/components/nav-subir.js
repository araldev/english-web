function fadeInNavSubir() {
  const $navSubir = document.querySelector('.nav-subir') 
  
  document.addEventListener('scroll', () => {
    if(window.scrollY >= 200) {
      $navSubir.classList.add('visible')
    } else {
      $navSubir.classList.remove('visible')
    }
  })
}

fadeInNavSubir()