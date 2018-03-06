import Connection, { EXPIRING_BUFFER } from 'src/Connection'
import Promise from 'bluebird'
import isFunction from 'lodash/isFunction'

describe('Firebase::Connection(endPoint, getAuthToken)', () => {
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

  describe('#getConnection', () => {
    let getConnection
    let FB, conn
    let authTokenDeferred, onFbAuth
    let authToken = 'the-token'

    function fbAuthDone (err, data) {
      if (!isFunction(onFbAuth)) {
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
        authWithCustomToken: function(token, cb) { onFbAuth = cb },
        authAnonymously: sinon.stub()
      }
      sinon.spy(conn, 'authWithCustomToken')
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
        getConnection = Connection(endPoint, getAuthToken)
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
        getConnection = Connection(endPoint, getAuthToken)
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
        getConnection = Connection(endPoint)
      })
      it('should call `authAnonymously`', () => {
        getConnection()
        expect(conn.authAnonymously).to.have.been.called
      })
    })
  })
})
