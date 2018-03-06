import Connection, { EXPIRING_BUFFER } from 'src/Connection'
import Promise from 'bluebird'

describe('Firebase::Connection(endPoint, options)', () => {
  let endPoint = 'the-fb-endpoint'
  let getAuthToken
  let mockGetTime
  let currentTimeStamp = 1000
  beforeEach(() => {
    getAuthToken = sinon.stub()
    mockGetTime = Date.prototype.getTime
    Date.prototype.getTime = sinon.stub().returns(currentTimeStamp)
  })
  afterEach(() => {
    Date.prototype.getTime = mockGetTime
  })

  describe('Argument Error Behavior', () => {
    it('should throw an TypeError when `isAnonymous = false` and `getAuthToken` is not a function', () => {
      try {
        Connection(endPoint, { isAnonymous: false })
      } catch (err) {
        expect(err.name).to.equal('TypeError')
        expect(err.message).to.equal('getAuthToken should be a function for non-anonymous auth')
      }
    })
    it('should throw an TypeError when `isAnonymous = true` and `getAuthToken` is a function', () => {
      try {
        Connection(endPoint, { isAnonymous: true, getAuthToken: () => {} })
      } catch (err) {
        expect(err.name).to.equal('TypeError')
        expect(err.message).to.equal('getAuthToken should not be given for anonymous auth')
      }
    })
  })

  describe('#getConnection', () => {
    let getConnection
    let FB, conn
    let authTokenDeferred, onFbAuth
    let authToken = 'the-token'

    function fbAuthDone (err, data) {
      if (typeof onFbAuth !== 'function') {
        throw new Error('onFbAuth is not a function')
      }
      onFbAuth(err, data)
    }
    function nowInSec () {
      return parseInt(new Date().getTime() / 1000)
    }
    beforeEach(() => {
      onFbAuth = null
      conn = {
        authWithCustomToken: (token, cb) => { onFbAuth = cb },
        authAnonymously: cb => { onFbAuth = cb }
      }
      sinon.spy(conn, 'authWithCustomToken')
      sinon.spy(conn, 'authAnonymously')
      FB = sinon.stub()
      FB.returns(conn)
      Connection.__Rewire__('FB', FB)
      authTokenDeferred = Promise.defer()
      getAuthToken.returns(authTokenDeferred.promise)
    })

    afterEach(() => {
      Connection.__ResetDependency__('FB')
    })

    describe('getConnection behaviors', () => {
      let connection
      beforeEach(() => {
        getConnection = Connection(endPoint, { getAuthToken, isAnonymous: false})
        connection = getConnection()
      })
      it('returns `getConnection` as a function', () => {
        expect(getConnection).to.be.an.instanceof(Function)
      })
      it('inits firebase connection if not inited yet', () => {
        expect(FB).to.have.been.calledWith(endPoint)
        expect(connection).to.equal(conn)
      })
      it('reuse the connection', () => {
        const connection2 = getConnection()
        expect(FB).to.have.been.calledOnce
        expect(connection).to.equal(connection2)
      })
    })

    describe('when call Connection with `getAuthToken`', () => {
      beforeEach(() => {
        getConnection = Connection(endPoint, { getAuthToken, isAnonymous: false})
      })
      it('retrieve firebase authToken using `getAuthToken`', () => {
        getConnection()
        expect(getAuthToken).to.have.been.called
      })
      it('`authWithCustomToken` if getAuthToken success', (done) => {
        getConnection()
        authTokenDeferred.resolve(authToken)
        authTokenDeferred.promise.then(()=> {
          expect(conn.authWithCustomToken).to
            .have.been.calledWith(authToken, sinon.match.func)
          done()
        })
      })
      it('should not doulbe-auth', (done) => {
        getConnection()
        authTokenDeferred.resolve(authToken)
        authTokenDeferred.promise.then(()=> {
          fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER + 100 })
          getConnection()
          expect(getAuthToken).to.have.been.calledOnce
          done()
        })
      })
      it('should not auth when authorizing', () => {
        getConnection()
        getConnection()
        expect(getAuthToken).to.have.been.calledOnce
      })
      it('re-auth if connection is about to be expired', (done) => {
        getConnection()
        authTokenDeferred.resolve(authToken)
        authTokenDeferred.promise.then(()=> {
          fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER - 300 })
          getConnection()
          expect(getAuthToken).to.have.been.calledTwice
          done()
        })
      })
    })

    describe('when call Connection without `getAuthToken`', () => {
      beforeEach(() => {
        getConnection = Connection(endPoint, { isAnonymous: true })
      })
      it('should call `authAnonymously`', () => {
        getConnection()
        expect(conn.authAnonymously).to.have.been.called
      })
      it('should not doulbe-auth', () => {
        getConnection()
        fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER + 300 })
        getConnection()
        expect(conn.authAnonymously).to.have.been.calledOnce
      })
      it('should not auth when authorizing', () => {
        getConnection()
        getConnection()
        expect(conn.authAnonymously).to.have.been.calledOnce
      })
      it('re-auth if connection is about to be expired', () => {
        getConnection()
        fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER - 300 })
        getConnection()
        expect(conn.authAnonymously).to.have.been.calledTwice
      })
    })
  })
})
