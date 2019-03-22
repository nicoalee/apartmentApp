var express = require('express')
var router = express.Router()

const ownercontroller = require('../controllers/ownercontroller')

router.route('/')
    .get(ownercontroller.getOwners)

module.exports = router