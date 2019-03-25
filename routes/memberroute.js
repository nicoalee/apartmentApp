var express = require('express')
var router = express.Router()

const membercontroller = require('../controllers/memberController')

router.route('/')
    .get(membercontroller.getMembers)
    
router.route('/delete/:email')
    .get(membercontroller.deleteMember)

router.route('/edit/:email')
    .get((req, res) => {
        res.render('./member/update', {email: req.params.email})
    })
    .post(membercontroller.updateMember)

router.route('/:email/:name')
    .get(membercontroller.getMemberReviews)

router.route('/new')
    .get((req, res) => {
        res.render('./member/new')
    })

router.route('/create')
    .post(membercontroller.createMember)

module.exports = router