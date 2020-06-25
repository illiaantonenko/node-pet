const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphps = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

// Load config
dotenv.config({path: './config/config.env'})

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()
const server = http.createServer(app);
const io = socketio(server)
// Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')
// Handlebars
app.engine(
  '.hbs',
  exphps({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select
    },
    defaultLayout: 'main',
    extname: '.hbs'
  })
)
app.set('view engine', '.hbs')

// Session middleware
app.use(session({
  secret: 'some secret text',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routs/index'))
app.use('/auth', require('./routs/auth'))
app.use('/stories', require('./routs/stories'))
app.use('/chat', require('./routs/chat'))

// Socket run
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
    if (user){
      io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the ${user.room} chat`))

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))