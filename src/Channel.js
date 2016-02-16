import _ from 'lodash';

class Channel {
  constructor({ connection, path }) {
    this._conn = connection;
    this._path = path;
    this._ref = connection.child(path);
    this._events = [];
  }

  on(eventName, cb, option = { ignoreFirst: false }) {
    let { ignoreFirst } = option;
    let handle = this._ref.on(eventName, this._valuedCb(cb, ignoreFirst));
    this._events.push({ eventName, handle });
  }

  _valuedCb(cb, ignoreFirst) {
    let isFirstMessage = true;

    return (snpashot, ...args)=> {
      let val = snpashot.val();

      if ( val ) {
        if ( ! (ignoreFirst && isFirstMessage) ) {
          cb(val, ...args);
        }
      }

      isFirstMessage = false;
    }
  }

  off() {
    _.each(this._events, ({ eventName, handle })=> {
      this._ref.off(eventName, handle);
    });
  }

  update(value) {
    this._ref.update(value);
  }

  push(value) {
    this._ref.push(value);
  }

  onDisconnect(callback) {
    let disconnectRef = this._ref.onDisconnect();
    callback(disconnectRef);
  }
}

export default Channel;
