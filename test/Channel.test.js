import Channel from 'src/Channel';

describe('Firebase::Channel', function(){
  let path = '/items';
  let connection;
  let channel, ref;
  beforeEach(function(){
    connection = {
      child: sinon.stub()
    };
  });
  beforeEach(function(){
    ref = { on: sinon.stub() };
    connection.child.returns(ref);
    channel = new Channel({ connection, path });
  });

  describe('::new({ connection, path })', function(){
    it('takes a channel path to init', function(){
      let channel = new Channel({ path, connection });
    });
  });

  describe('#update(value)', function() {
    beforeEach(function(){
      ref.update = sinon.stub();
    });
    it('updates value into child ref', function(){
      let channel = new Channel({ path, connection });
      channel.update('the-val');
      expect(ref.update).to.have.been.calledWith('the-val');
    });
  });
  describe('#onDisconnect(callback)', function(){
    let disconnectRef;
    beforeEach(function(){
      disconnectRef = {};
      ref.onDisconnect = sinon.stub();
      ref.onDisconnect.returns(disconnectRef);
    });
    it('invokes callback with disconnect ref', function(){
      let disconnectCb = sinon.stub();
      channel.onDisconnect(disconnectCb);

      expect(disconnectCb).to.have.been.calledWith(disconnectRef);
    });
  });

  describe('Event Handling', function(){
    describe('#on(eventName, callback, { ignoreFirst })', function(){
      function getDataSnpashot (data) {
        return {
          val() { return data }
        };
      }
      it('registers event and callback to firebase child', function(){
        let onChildAdded = sinon.spy();

        channel.on('child_added', onChildAdded);

        expect(connection.child)
          .to.have.been.calledWith(path);
        expect(ref.on).to.have.been.calledWith('child_added', sinon.match.func);
      });
      it('invokes callback with `val`ed first params', function(){
        let onChildAdded = sinon.spy();
        let callback;
        let data = { key: 'val' };
        let dataSnapshot = getDataSnpashot(data);
        ref.on = function(evName, cb) {
          callback = cb;
        };

        channel.on('child_added', onChildAdded);
        callback(dataSnapshot, 'arg1', 'arg2');

        expect(onChildAdded).to.have.been.calledWith(data, 'arg1', 'arg2');
      });
      it('not invokes callback is `val`ed result is null', function(){
        let onChildAdded = sinon.spy();
        let callback;
        let dataSnapshot = getDataSnpashot(null);
        ref.on = function(evName, cb) {
          callback = cb;
        };

        channel.on('child_added', onChildAdded);
        callback(dataSnapshot, 'arg1', 'arg2');

        expect(onChildAdded).not.to.have.been.called;
      });
      it('ignore the first one if `ignoreFirst` is passed', function(){
        let onChildAdded = sinon.spy();
        let callback;
        let dataSnapshot1 = getDataSnpashot('val1');
        let dataSnapshot2 = getDataSnpashot('val2');
        ref.on = function(evName, cb) {
          callback = cb;
        };

        channel.on('child_added', onChildAdded, { ignoreFirst: true });
        callback(dataSnapshot1, 'arg1', 'arg2');
        callback(dataSnapshot2, 'arg3', 'arg4');

        expect(onChildAdded).to.have.been.calledOnce;
        expect(onChildAdded).to.have.been.calledWith('val2', 'arg3', 'arg4');
      });
    });
  });
  describe('#off()', function(){
    function createHandle () {
      return function() {}
    }
    let handle1 = createHandle(),
        handle2 = createHandle(),
        handle3 = createHandle();
    beforeEach(function(){
      ref.on.onCall(0).returns(handle1);
      ref.on.onCall(1).returns(handle2);
      ref.on.onCall(2).returns(handle3);
      ref.off = sinon.spy();
    });

    it('offs all the registered events', function(){
      let channel = new Channel({ connection, path });
      let cb = sinon.spy();
      channel.on('event1', cb);
      channel.on('event2', cb);
      channel.on('event3', cb);

      channel.off();

      expect(ref.off).to.have.been.calledWith('event1', handle1);
      expect(ref.off).to.have.been.calledWith('event2', handle2);
      expect(ref.off).to.have.been.calledWith('event3', handle3);
    });
  });

});
