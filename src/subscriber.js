import Connection from './Connection'
import Channel from './Channel'

const subscriber = function(endPoint, { getAuthToken, isAnonymous = false }) {
  const getConnection = Connection(endPoint, { getAuthToken, isAnonymous })

  return function subscribe(path) {
    let connection = getConnection()
    let ref = connection.child(path)
    return new Channel({ ref })
  }
}

export default subscriber

