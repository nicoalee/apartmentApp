require('dotenv').config()

var express = require('express')
var exphb = require('express-handlebars')
var app = express()

const memberroute = require('./routes/memberroute')
const neighborhoodroute = require('./routes/neighborhoodroute')
const ownerroute = require('./routes/ownerroute')
const propertyroute = require('./routes/propertyroute')

app.engine('handlebars', exphb({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/members', memberroute)
app.use('/neighborhoods', neighborhoodroute)
app.use('/owners', ownerroute)
app.use('/properties', propertyroute)

app.listen(3000)