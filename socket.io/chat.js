const formatMessage = require('../utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('../utils/users')

module.exports = function (io) {
  io.on('connection', socket => {
    const botName = process.env.BOT_NAME || 'ChatAdmin'

    socket.on('joinRoom', ({username, room}) => {
      const user = userJoin(socket.id, username, room)

      socket.join(user.room)

      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

      // Broadcast when a user connects
      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${username} has joined the ${room} chat!`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    })

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id)
      // todo: save msg to db
      io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // Runs when client disconnect
    socket.on('disconnect', () => {
      const user = userLeave(socket.id)
      if (user) {
        io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the ${user.room} chat`))

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        })
      }
    })
  })
}