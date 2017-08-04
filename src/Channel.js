import _each from 'lodash/each'

const SETTER_METHODS = [ 'update', 'push', 'set', 'remove' ]

class Channel {
  constructor({ ref }) {
    this._ref = ref
    this._events = []

    delegateMethods(SETTER_METHODS, this, ref)
  }

  once(eventName, cb, inputOptions) {
    let options = Object.assign({}, inputOptions)
    let _ref = this._ref

    if(options) {
      _ref = useOptionAsMethod(options, _ref)
    }

    _ref.once(eventName, this._valuedCb(cb, options.ignoreFirst))
  }

  on(eventName, cb, inputOptions) {
    let options = Object.assign({}, inputOptions)
    let _ref = this._ref

    if(options) {
      _ref = useOptionAsMethod(options, _ref)
    }

    let handle = _ref.on(eventName, this._valuedCb(cb, options.ignoreFirst))
    this._events.push({ eventName, handle })
  }

  _valuedCb(cb, ignoreFirst) {
    let isFirstMessage = true

    return (snpashot, ...args)=> {
      let val = snpashot.val()

      if ( ! (ignoreFirst && isFirstMessage) ) {
        cb(val, ...args)
      }

      isFirstMessage = false
    }
  }

  off() {
    _each(this._events, ({ eventName, handle })=> {
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

function useOptionAsMethod(options, self) {
  let _self = self
  for(let key of Object.keys(options)) {
    if(typeof self[key] === 'function') {
      _self = _self[key](options[key])
    }
  }
  return _self
}

export default Channel
