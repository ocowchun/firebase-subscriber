import Connection, { EXPIRING_BUFFER } from 'src/Connection';
import Promise from 'bluebird';
import _ from 'lodash';

describe('Firebase::Connection(endPoint, getAuthToken)', function(){
  let endPoint = 'the-fb-endpoint';
  let getAuthToken;
  beforeEach(function(){
    getAuthToken = sinon.stub();
  });

  it('returns `getConnection` as a function', function(){
    let getConnection = Connection(endPoint, getAuthToken);
    expect(getConnection).to.be.an.instanceof(Function);
  });

  describe('#getConnection', function(){
    let getConnection;
    let FB, conn;
    let authTokenDeferred, onFbAuth;
    let authToken = 'the-token';

    function fbAuthDone (err, data) {
      if (!_.isFunction(onFbAuth)) {
        throw new Error('onFbAuth is not a function');
      }
      onFbAuth(err, data);
    }
    function nowInSec () {
      return parseInt(new Date().getTime() / 1000);
    }
    beforeEach(function(){
      onFbAuth = null;
      conn = {
        authWithCustomToken: function(token, cb) { onFbAuth = cb }
      };
      sinon.spy(conn, 'authWithCustomToken');
      FB = sinon.stub();
      FB.returns(conn);
      Connection.__Rewire__('FB', FB);
    });
    afterEach(function(){
      Connection.__ResetDependency__('FB');
    });
    beforeEach(function(){
      getConnection = Connection(endPoint, getAuthToken);
    });
    beforeEach(function(){
      authTokenDeferred = Promise.defer();
      getAuthToken.returns(authTokenDeferred.promise);
    });

    it('inits firebase connection if not inited yet', function(){
      let connection = getConnection();
      expect(FB).to.have.been.calledWith(endPoint);
      expect(connection).to.equal(conn);
    });
    it('reuse the connection', function(){
      let connection1 = getConnection();
      let connection2 = getConnection();
      expect(FB).to.have.been.calledOnce;
      expect(connection1).to.equal(connection2);
    });
    it('retrieve firebase authToken using `getAuthToken`', function(){
      let connection = getConnection();
      expect(getAuthToken).to.have.been.called;
    });
    it('`authWithCustomToken` if getAuthToken success', function(done){
      let connection = getConnection();
      authTokenDeferred.resolve(authToken);
      authTokenDeferred.promise.then(()=> {
        expect(conn.authWithCustomToken).to
          .have.been.calledWith(authToken, sinon.match.func);
        done();
      });
    });
    it('should not doulbe-auth', function(done){
      let connection = getConnection();
      authTokenDeferred.resolve(authToken);
      authTokenDeferred.promise.then(()=> {
        fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER + 300 });

        let otherConn = getConnection();
        expect(getAuthToken).to.have.been.calledOnce;
        done();
      });
    });
    it('should not auth when authorizing', function(){
      let connection1 = getConnection();
      let connection2 = getConnection();

      expect(getAuthToken).to.have.been.calledOnce;
    });
    it('re-auth if connection is about to be expired', function(done){
      let connection = getConnection();
      authTokenDeferred.resolve(authToken);
      authTokenDeferred.promise.then(()=> {
        fbAuthDone(null, { expires: nowInSec() + EXPIRING_BUFFER - 300 });

        let otherConn = getConnection();
        expect(getAuthToken).to.have.been.calledTwice;
        done();
      });
    });
  });
});
