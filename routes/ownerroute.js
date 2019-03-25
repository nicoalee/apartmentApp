var express = require('express')
var router = express.Router()

const ownercontroller = require('../controllers/ownercontroller')

router.route('/')
    .get(ownercontroller.getOwners)

router.route('/edit/:email')
    .get((req, res) => {
        res.render('./owner/update', {email: req.params.email})
    })
    .post(ownercontroller.updateOwner)
    
router.route('/:email/:name')
    .get(ownercontroller.getOwnerInfo)

router.route('/new')
    .get((req, res) => {
        res.render('./owner/new')
    })

router.route('/create')
    .post(ownercontroller.createOwner)

module.exports = router