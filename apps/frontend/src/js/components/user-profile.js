import { $ } from '../utils/docQuerySelector.js'
import { getUserSession, subscribeUserSession } from '../store/store.js'

/* ====================  Form Learning Preferences ==================== */
const $formLearningPreferences = $('#form_learning_preferences')

$formLearningPreferences.addEventListener('submit', e => {
  e.preventDefault()

  /* Mandar info al backend */
})

/* ====================  Select Option Current Level ==================== */
const $inputOptionsLevels = $('#input_options_levels')
const $valueOptionsLevels = $('#value_options_levels')
const $optionsLevels = $('#options_levels')
const $allOptionsLevels = $optionsLevels.querySelectorAll('li')

$allOptionsLevels.forEach(li => li.addEventListener('click', e => {
  const li = e.currentTarget
  const value = li.dataset.value
  $valueOptionsLevels.textContent = value
  $inputOptionsLevels.value = value
}))

/* ====================  Select Option Daily Goal ==================== */

const $inputDailyGoal = $('#input_daily_goal')
const $valueDailyGoal = $('#value_daily_goal')
const $optionsDailyGoal = $('#daily_goal')
const $allOptionsDailyGoal = $optionsDailyGoal.querySelectorAll('li')

$allOptionsDailyGoal.forEach(li => li.addEventListener('click', e => {
  const li = e.currentTarget
  const value = li.dataset.value
  $valueDailyGoal.textContent = value
  $inputDailyGoal.value = value
}))

/* ====================  Select Option Show Function ==================== */

const $allDivSelects = $formLearningPreferences.querySelectorAll('.div_select')

$allDivSelects.forEach(div => {
  const ul = div.querySelector('ul')
  const allLi = ul.querySelectorAll('li')

  /* Evitar que se clicke el ul cuando opacity está en 0 */
  ul.addEventListener('transitionend', () => {
    if(div.dataset.state === 'close') {
      ul.style.pointerEvents = 'none'
    } else {
      ul.style.pointerEvents = 'unset'
    }
  })

  div.addEventListener('click', e => {
    const divSelect = e.currentTarget

    const vDelay = 30
    let counterDelay = 0
    let decreaseDelay = allLi.length * vDelay

    if(divSelect.dataset.state === 'close') {
      allLi.forEach(li => {
        li.style.transitionDelay = `${counterDelay}ms`
        counterDelay += vDelay
      })
      
      divSelect.dataset.state = 'open'
    } else {
      allLi.forEach(li => {
        li.style.transitionDelay = `${decreaseDelay}ms`
        decreaseDelay -= vDelay
      })

      divSelect.dataset.state = 'close'
    }
  })
})

/* ====================  function to render user data on UI ==================== */
const userProfileImage = $('#user_profile_image')

function renderUserSession(fn) {
  return () => {
    const userSession = fn()
    if(!userSession || !userProfileImage) return null

    userProfileImage.src = userSession.picture
  }
}

/* ====================  Event to call function when userSession change ==================== */
const unsubscribeUserSession = subscribeUserSession(renderUserSession(getUserSession), true)