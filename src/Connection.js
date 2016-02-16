import FB from 'firebase';
export const EXPIRING_BUFFER = 60 * 60;
let Connection = function(endPoint, getAuthToken) {
  let conn;
  let authed = false;
  let authorizing = false;
  let expiresAt = 0;

  return function getConnection() {
    if (!conn) {
      conn = new FB(endPoint);
    }

    if ( shouldAuth() ) {
      authConnection();
    }

    return conn;
  }

  function shouldAuth () {
    if (authorizing) {
      return false;
    }
    return !authed || aboutToExpired();
  }
  function aboutToExpired () {
    let now = parseInt(new Date().getTime() / 1000);
    return expiresAt - now < EXPIRING_BUFFER;
  }

  function authConnection () {
    authorizing = true;
    getAuthToken().then((authToken)=> {
      conn.authWithCustomToken(authToken, (err, authData)=> {
        authorizing = false;
        if (err) {
          console.error('[FIREBASE AUTH FAILED]', err);
          return;
        }
        expiresAt = authData.expires;
        authed = true;
      });
    })
    .catch((err)=> {
      authorizing = false;
      console.error('[FIREBASE GET_AUTH FAILED]', err);
    });
  }
};

export default Connection;
