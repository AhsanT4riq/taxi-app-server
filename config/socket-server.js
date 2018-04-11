import jwt from 'jsonwebtoken';
import config from './env';
import sockeHandler from '../server/socketHandler';
import SocketStore from '../server/service/socket-store';

function startSocketServer(server) {
  const io = require('socket.io').listen(server); //eslint-disable-line

  console.log('SocketServer started'); //eslint-disable-line
  io.on('connection', (socket) => {
    console.log('Client connected to socket', socket.id); //eslint-disable-line
    const authToken = socket.handshake.query.token.replace('JWT ', ''); // check for authentication of the socket
    jwt.verify(authToken, config.jwtSecret, (err, userDtls) => {
      if (err) {
        socket.disconnect();
      } else if (userDtls) {
        socket.userId = userDtls._doc._id; //eslint-disable-line
        console.log(`inside socket server \n\n ${userDtls._doc._id} ${userDtls._doc.email} ${userDtls._doc.fname}`); //eslint-disable-line
        SocketStore.addByUserId(socket.userId, socket);
        sockeHandler(socket); // call socketHandler to handle different socket scenario
      }
    });
  });
}

export default { startSocketServer };
