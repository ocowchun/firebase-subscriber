import Connection from './Connection'
import Channel from './Channel'
import firebase from 'firebase'

function firebaseAppFactory({ apiKey, databaseURL, authDomain, getAuthToken, isAnonymous }){
  let fbApp
  let authed = false
  let authorizing = false
  let expiresAt = 0

  function shouldAuth () {
    if (authorizing) {
      return false
    }
    return !authed || aboutToExpired()
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

  return function(){
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

}

const subscriber = function({ apiKey, databaseURL, authDomain, getAuthToken, isAnonymous }) {
  if (!isAnonymous && typeof getAuthToken !== 'function') {
    throw new TypeError('getAuthToken should be a function for non-anonymous auth')
  }
  if (isAnonymous && typeof getAuthToken === 'function') {
    throw new TypeError('getAuthToken should not be given for anonymous auth')
  }
  const getFirebaseApp = firebaseAppFactory({ apiKey, databaseURL, authDomain, getAuthToken, isAnonymous })

  return function subscribe(path) {
    const fbApp = getFirebaseApp()
    const db = firebase.database(fbApp)
    const ref = db.ref(path)
    return new Channel({ ref })
  }
}


export default subscriber

