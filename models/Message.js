const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'Room'
  },
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('Message', MessageSchema)