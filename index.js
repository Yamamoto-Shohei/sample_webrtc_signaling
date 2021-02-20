const server = require('ws').Server;
const Crypto = require("crypto");

const ws = new server({ port: 8081 });
const socketLists = {}
ws.on('connection', (socket, request, client) => {
  console.log('connected!')
  console.log(request.headers)
  console.log(request.connection.remoteAddress)
  const sockectId  = Crypto.randomBytes(8).toString("hex")
  console.log(sockectId)
  socketLists[sockectId] = {
    socket: socket
  }
  emit(sockectId, JSON.stringify({myId: sockectId}))
  socket.on('message', message => {
    const parseMessage = JSON.parse(message)
    console.log(parseMessage)
    if (parseMessage.chat) {
      emit_all(parseMessage.chat)
    }
    if (parseMessage.offer) {
      emit(parseMessage.remoteId, JSON.stringify({...parseMessage, requestId:sockectId}))
    }
    if (parseMessage.answer) {
      emit(parseMessage.remoteId, JSON.stringify({...parseMessage, requestId:sockectId}))
    }
    if (parseMessage.candidate) {
      emit(parseMessage.remoteId, JSON.stringify({...parseMessage, requestId:sockectId}))
    }
    if (parseMessage.setUsername) {
      socketLists[sockectId].username = parseMessage.setUsername
      emit_all(JSON.stringify({
        users: Object.keys(socketLists).filter(element => socketLists[element].username).map(element => {
          return {
            id: element,
            username: socketLists[element].username
          }
        })
      }))
    }
    if (parseMessage.disconnect) {
      emit(parseMessage.remoteId, JSON.stringify({...parseMessage, requestId:sockectId}))
    }
  });

  socket.on('close', () => {
    delete socketLists[sockectId]
    console.log('good bye.');
  });
});



const emit = (targetSocketId, message) => {
  if (!socketLists[targetSocketId]) {
    console.log(`emit >${targetSocketId}< no socket`)
  } else {
    console.log(`emit >${targetSocketId}< ${message}`)
    socketLists[targetSocketId].socket.send(message)
  
  }
}

const emit_broadcast = (sockectId, message) => {
  console.log(`emit_broadcast >${sockectId}< ${message}`)
  Object.keys(socketLists).filter(element => element !== sockectId).forEach((element) => {
    socketLists[element].socket.send(message)
  })
}

const emit_all = (message) => {
  console.log(`emit_all >all< ${message}`)
  Object.keys(socketLists).forEach((element) => {
    socketLists[element].socket.send(message)
  })
}
