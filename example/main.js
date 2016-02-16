(function() {
  var endPoint = 'https://luminous-fire-6308.firebaseio.com';
  var getAuthToken = function() {
    return Promise.resolve('the-token');
  }
  var subscribe = FirebaseSubscriber.subscriber(endPoint, getAuthToken);
  var channel = subscribe('/my-test-path');

  channel.update({ hello: 'world' });
  channel.on('value', function(val) {
    console.log('on value', val);
  })
})();
