import _ from 'lodash'

const SETTER_METHODS = [ 'update', 'push', 'set', 'remove' ]

class Channel {
  constructor({ ref }) {
    this._ref = ref
    this._events = []

    delegateMethods(SETTER_METHODS, this, ref)
  }

  on(eventName, cb, option = { ignoreFirst: false }) {
    let { ignoreFirst } = option
    let handle = this._ref.on(eventName, this._valuedCb(cb, ignoreFirst))
    this._events.push({ eventName, handle })
  }

  _valuedCb(cb, ignoreFirst) {
    let isFirstMessage = true

    return (snpashot, ...args)=> {
      let val = snpashot.val()

      if ( val ) {
        if ( ! (ignoreFirst && isFirstMessage) ) {
          cb(val, ...args)
        }
      }

      isFirstMessage = false
    }
  }

  off() {
    _.each(this._events, ({ eventName, handle })=> {
      this._ref.off(eventName, handle)
    })
  }

  onDisconnect(callback) {
    let disconnectRef = this._ref.onDisconnect()
    callback(disconnectRef)
  }
}

function delegateMethods (methods, obj, target) {
  methods.forEach((method)=> {
    obj[method] = function(...args) {
      target[method](...args)
    }
  })
}

export default Channel
