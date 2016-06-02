import _ from 'lodash'

const SETTER_METHODS = [ 'update', 'push', 'set', 'remove' ]

class Channel {
  constructor({ ref }) {
    this._ref = ref
    this._events = []

    delegateMethods(SETTER_METHODS, this, ref)
  }

  on(eventName, cb, inputOptions) {
    let defaultOptions = { ignoreFirst: false }
    let options = Object.assign({}, defaultOptions, inputOptions)
    let _ref = this._ref

    /*
     * TODO: enable this when needed
    if(options !== defaultOptions) {
      _ref = useOptionAsMethod(options, _ref)
    }
    function useOptionAsMethod(options, self) {
      let _self = self
      for(let key of Object.keys(options)) {
        if(!self.hasOwnProperty(key) &&
          typeof self[key] === 'function') {
          _self = self[key](options[key])
        }
      }
      return _self
    }
    */

    let handle = _ref.on(eventName, this._valuedCb(cb, options.ignoreFirst))
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
