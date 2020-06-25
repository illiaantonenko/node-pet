const mongoose = require('mongoose')
const Story = require('./Story')

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  image: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

UserSchema.pre('remove', (next) => {
  Story.remove({user: this.id}).exec()
  next()
})

module.exports = mongoose.model('User', UserSchema)