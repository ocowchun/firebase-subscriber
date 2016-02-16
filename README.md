# Firebase Subscriber

FirebaseSubscriber is an abstract layer on top of Firebase official SDK.
The main purpose of FirebaseSubscriber is to:

- Abstract logic token expiring/re-auth from application logic
- Abstract event unsubscribing by an additional `Channel` layer


## Usage:

```javascript
var FirebaseSubscriber = require('firebase-subscriber');

var getAuthToken = function() {
  // request application api here to get fresh firebase auth token
  // return a promise
  // this function would be invoked whenever the firebase auth token expired
}

var subscribe = FirebaseSubscriber.subscriber(endPoint, getAuthToken);
var channel = subscribe('/my-test-path');

channel.on('child_added', function(val) {
  // `val` here is the result of snapshot.val()
  console.log('on child added', val);
})
channel.on('value', function(val) {
  console.log('on value', val);
})


channel.off(); //=> unsubscribe ALL event handlers bound on the channel
```


## LICENCE

MIT
