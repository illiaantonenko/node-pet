const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'public',
    enum: ['public', 'private']
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

module.exports = mongoose.model('Room', RoomSchema)