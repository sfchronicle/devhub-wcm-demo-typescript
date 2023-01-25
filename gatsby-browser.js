/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
const env = process.env.GATSBY_DEPLOY_ENV
const projectConfig = require('./project-config.json')
exports.onClientEntry = () => {
  // prideful console
  if (projectConfig.PROJECT.MARKET_KEY === 'SFC') {
    const css =
      'font-weight: bold; font-size: 30px;color: red; text-shadow: 1px 1px 0 rgb(217,31,38), 2px 2px 0 rgb(226,91,14), 3px 3px 0 rgb(245,221,8), 4px 4px 0 rgb(5,148,68), 5px 5px 0 rgb(2,135,206), 6px 6px 0 rgb(4,77,145), 7px 7px 0 rgb(42,21,113)'
    console.log(
      '%c** SFC INTERACTIVE DESK **\nWelcome to a SF Chronicle project',
      css
    )
  }

  // dev
  if (env === 'development') {
    const { getSettings } = require('sfc-utils')
    console.info('DEV: Available SFC settings', getSettings())
  }

  // Twitter Intent
  ;(function () {
    if (window.__twitterIntentHandler) return
    var intentRegex = /twitter\.com\/intent\/(\w+)/,
      windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
      width = 550,
      height = 420,
      winHeight = window.height,
      winWidth = window.width

    function handleIntent(e) {
      e = e || window.event
      var target = e.target || e.srcElement,
        m,
        left,
        top

      while (target && target.nodeName.toLowerCase() !== 'a') {
        target = target.parentNode
      }

      if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
        m = target.href.match(intentRegex)
        if (m) {
          left = Math.round(winWidth / 2 - width / 2)
          top = 0

          if (winHeight > height) {
            top = Math.round(winHeight / 2 - height / 2)
          }

          window.open(
            target.href,
            'intent',
            windowOptions +
              ',width=' +
              width +
              ',height=' +
              height +
              ',left=' +
              left +
              ',top=' +
              top
          )
          e.returnValue = false
          e.preventDefault && e.preventDefault()
        }
      }
    }

    if (document.addEventListener) {
      document.addEventListener('click', handleIntent, false)
    } else if (document.attachEvent) {
      document.attachEvent('onclick', handleIntent)
    }
    window.__twitterIntentHandler = true
  })()
}
