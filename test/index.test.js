import Firebase from 'src';

describe('Firebase(endPoint, getAuthToken)', function(){
  let endPoint = 'fb-end-point';
  let getAuthToken;
  beforeEach(function(){
    getAuthToken = sinon.stub();
  });
  let Connection, getConnection;
  beforeEach(function(){
    Connection = sinon.stub();
    getConnection = sinon.stub();
    Connection.returns(getConnection);

    Firebase.__Rewire__('Connection', Connection);
  });
  afterEach(function(){
    Firebase.__ResetDependency__('Connection');
  });

  it('returns a channel subscriber as a function', function(){
    let subscriber = Firebase(endPoint, getAuthToken);

    expect(subscriber).to.be.an.instanceof(Function);
  });
  it('inject endPoint and getAuthToken to generate connection getter', function(){
    let subscriber = Firebase(endPoint, getAuthToken);
    expect(Connection).to.have.been.calledWith(endPoint, getAuthToken);
  });

  describe('Subscriber(path)', function(){
    let subscribe, authTokenDeferred;
    let authToken = 'auth-token',
        path = 'the-path';

    let Channel, conn, channel;
    beforeEach(function(){
      channel = {};
      Channel = sinon.stub();
      Channel.returns(channel);
      Firebase.__Rewire__('Channel', Channel);
    });
    afterEach(function(){
      Firebase.__ResetDependency__('Channel');
    });
    beforeEach(function(){
      conn = {};
      getConnection.returns(conn);
      subscribe = Firebase(endPoint, getAuthToken);
    });

    it('creates a channel with connection', function(){
      let connection = conn;
      let ch = subscribe(path);
      expect(Channel).to.have.been.calledWith({ path, connection })
      expect(ch).to.equal(channel);
    });
  });
});
