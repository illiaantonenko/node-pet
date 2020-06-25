const express = require('express')
const router = express.Router()
const {ensureAuth} = require('../middleware/auth')

// @desc  Show index page
// @route Get /chat/rooms
router.get('/', ensureAuth, (req, res) => {
  res.render('chat/index', {
    // layout: 'chat'
  })
})

// @desc  Show index page
// @route Get /chat
router.get('/room', ensureAuth, async (req, res) => {
  res.render('chat/chat', {
    // layout: 'chat'
  })
})


module.exports = router