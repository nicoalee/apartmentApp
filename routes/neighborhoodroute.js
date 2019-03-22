var express = require('express')
var router = express.Router()

const neighborhoodcontroller = require('../controllers/neighborhoodController')

router.route('/')
    .get(neighborhoodcontroller.getNeighborhoods)

router.route('/:neighborhood')
    .get(neighborhoodcontroller.getAverage)

module.exports = router