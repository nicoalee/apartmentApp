var express = require('express')
var router = express.Router()

const reviewcontroller = require('../controllers/reviewController')

router.route('/')
    .get(reviewcontroller.getReviews)

router.route('/new')
    .get(reviewcontroller.directToNew)

router.route('/create')
    .post(reviewcontroller.createReview)

module.exports = router