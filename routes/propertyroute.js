var express = require('express')
var router = express.Router()

const propertycontroller = require('../controllers/propertycontroller')

router.route('/')
    .get(propertycontroller.getProperties)

router.route('/:address/:neighborhood')
    .get(propertycontroller.getReviews)

router.route('/new')
    .get(propertycontroller.directToNew)

router.route('/create')
    .post(propertycontroller.createProperty)

    // .get(propertycontroller.createProperty)

module.exports = router