import Connection from 'src/Connection';
import Channel from 'src/Channel';

let subscriber = function(endPoint, getAuthToken) {
  let getConnection = Connection(endPoint, getAuthToken);

  return function subscribe(path) {
    let connection = getConnection();
    return new Channel({ connection, path });
  }
}

export default subscriber;

