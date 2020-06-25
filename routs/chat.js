const express = require('express')
const router = express.Router()
const Room = require('../models/Room')
const Message = require('../models/Message')
const {ensureAuth} = require('../middleware/auth')

// @desc  Show index page
// @route Get /chat/rooms
router.get('/', ensureAuth, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('user')
      .lean()
    res.render('chat/index', {
      rooms
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc  Show index page
// @route Get /chat
router.get('/room/:id', ensureAuth, async (req, res) => {
  try {
    const rooms = await Room.find().lean()
    const room = await Room.findById(req.params.id)

    const messages = await Message.find()
      .populate('user')
      .lean()
    res.render('chat/room', {
      messages,
      rooms,
      room
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = router