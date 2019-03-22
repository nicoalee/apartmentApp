var express = require('express')
var router = express.Router()

const membercontroller = require('../controllers/memberController')

router.route('/')
    .get(membercontroller.getMembers)

module.exports = router