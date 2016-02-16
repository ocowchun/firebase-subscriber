# Firebase Subscriber

FirebaseSubscriber is an abstract layer on top of [Firebase official SDK](https://www.firebase.com/docs/web/api/).
The main purpose of FirebaseSubscriber is to:

- Abstract logic token expiring/re-auth from application logic
- Abstract event unsubscribing by an additional `Channel` layer


## Usage:

```javascript
var FirebaseSubscriber = require('firebase-subscriber');

var getAuthToken = function() {
  // request application api here to get fresh firebase auth token
  // return a promise
  // this function would be invoked whenever the firebase auth token is expired
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

## API:

### Channel

A `Channel` instance is returned by `subscribe` function.

#### `channel.on(eventName, handler)`:

Wrap [Firebase.on()](https://www.firebase.com/docs/web/api/query/on.html),
invoke handler with `snapshot.val()`

#### `channel.off()`:

Unregister *ALL* event handlers on the channel

#### `channel.onDisconnect(callback)`:

Invoke callback with disconnected ref, for example:

```javascript
channel.onDisconnect(function(presenceRef) {
  presenceRef.set('offline')
})
```

### Connection

`Connection` is a configurable factory returning singleton connection, which would auto re-auth when expired.

```javascript
import { Connection } from 'firebase-subscriber';

let getConnection = Connection(firebaseEndpoint, getAuthToken);
let connection1 = getConnection();
let connection2 = getConnection();

expect(connection1).to.equal(connection2);
```

where `getAuthToken` is a function which

- fetches firebase auth token from your application server
- returns a promise

it would be invoked whever firebase auth token is expired.


## Testing

`$ npm test`

## LICENCE

MIT
