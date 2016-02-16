$(function() {
  var endPoint = 'https://luminous-fire-6308.firebaseio.com';
  var getAuthToken = function() {
    return Promise.resolve('the-token');
  }
  var subscribe = FirebaseSubscriber.subscriber(endPoint, getAuthToken);
  var channel = subscribe('/my-test-path');

  $('#push').click(function() {
    channel.push({ pushTime: new Date().getTime() });
  });

  channel.on('child_added', function(val) {
    console.log('on child added', val);
  })
  channel.on('value', function(val) {
    console.log('on value', val);
  })
})
