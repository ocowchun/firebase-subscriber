import firebase from 'firebase'
export const EXPIRING_BUFFER = 60 * 60

/*
 * @param {string} endPoint - the firebase endpoint
 * @param {object} options
 * @param {function} [options.getAuthToken] - a promise resolving authToken
 * @param {boolean} [options.isAnonymous] - a flag to determine if auth anonymously
 */
const Connection = function ({ apiKey, databaseURL, authDomain, getAuthToken, isAnonymous }) {
  let fbApp
  let authed = false
  let authorizing = false
  let expiresAt = 0

  if (!isAnonymous && typeof getAuthToken !== 'function') {
    throw new TypeError('getAuthToken should be a function for non-anonymous auth')
  }
  if (isAnonymous && typeof getAuthToken === 'function') {
    throw new TypeError('getAuthToken should not be given for anonymous auth')
  }

  return function getConnection() {
    if (!fbApp) {
      var config = {
        apiKey,
        authDomain,
        databaseURL
      };

      fbApp = firebase.initializeApp(config);
    }
    if (!shouldAuth()) {
      return fbApp
    }
    if (isAnonymous) {
      authAnonymousConnection()
    } else {
      authConnection()
    }
    return fbApp
  }

  function shouldAuth () {
    if (authorizing) {
      return false
    }
    return !authed || aboutToExpired()
  }

  function aboutToExpired () {
    const now = parseInt(new Date().getTime() / 1000)
    return expiresAt - now < EXPIRING_BUFFER
  }

  function authResultHandler (err) {
    authorizing = false
    if (err) {
      console.error('[FIREBASE AUTH FAILED]', err)
      return
    }
    expiresAt = (new Date().getTime()/1000) + 3600
    authed = true
  }

  function authAnonymousConnection () {
    authorizing = true
  }

  function authConnection () {
    authorizing = true
    getAuthToken().then(authToken => {
      return firebase.auth(fbApp).signInWithCustomToken(authToken)
    }).then(userCred =>{
      authResultHandler(null)
    })
    .catch(err => {
      authorizing = false
      console.error('[FIREBASE GET_AUTH FAILED]', err)
    })
  }
}

export default Connection
