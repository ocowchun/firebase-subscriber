import _ from 'lodash';

class Channel {
  constructor({ ref }) {
    this._ref = ref;
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
