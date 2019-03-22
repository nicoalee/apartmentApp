var express = require('express')
var router = express.Router()

const propertycontroller = require('../controllers/propertycontroller')

router.route('/')
    .get(propertycontroller.getProperties)

module.exports = router