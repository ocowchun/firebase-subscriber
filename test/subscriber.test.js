import subscriberCreator from 'src/subscriber';

describe('subscriberCreator(endPoint, getAuthToken)', function(){
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

    subscriberCreator.__Rewire__('Connection', Connection);
  });
  afterEach(function(){
    subscriberCreator.__ResetDependency__('Connection');
  });

  it('returns a channel subscriber as a function', function(){
    let subscriber = subscriberCreator(endPoint, getAuthToken);

    expect(subscriber).to.be.an.instanceof(Function);
  });
  it('inject endPoint and getAuthToken to generate chennel getter', function(){
    let subscriber = subscriberCreator(endPoint, getAuthToken);
    expect(Connection).to.have.been.calledWith(endPoint, getAuthToken);
  });

  describe('Subscriber(path)', function(){
    let subscribe, authTokenDeferred;
    let ref;
    let authToken = 'auth-token',
        path = 'the-path';

    let Channel, conn, channel;
    beforeEach(function(){
      channel = {};
      Channel = sinon.stub();
      Channel.returns(channel);
      subscriberCreator.__Rewire__('Channel', Channel);
    });
    afterEach(function(){
      subscriberCreator.__ResetDependency__('Channel');
    });
    beforeEach(function(){
      ref = {};
      conn = {
        child: sinon.stub()
      };
      conn.child.returns(ref);
      getConnection.returns(conn);
      subscribe = subscriberCreator(endPoint, getAuthToken);
    });

    it('creates a channel with connection', function(){
      let connection = conn;
      let ch = subscribe(path);
      expect(conn.child).to.have.been.calledWith(path);
      expect(Channel).to.have.been.calledWith({ ref })
      expect(ch).to.equal(channel);
    });
  });
});
