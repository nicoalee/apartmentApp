const { Pool, Client } = require('pg')

// function getProperties(req, res) {

//     const pool = new Pool({
//         user: process.env.DB_USERNAME,
//         host: process.env.DB_HOST,
//         database: process.env.DB_NAME,
//         password: process.env.DB_PASSWORD,
//         port: process.env.DB_PORT,
//     })

//     let query = "SELECT * FROM property"

//     pool.query(query, (err, data) => {
//         let dataArr = []
//         if(err) console.log(err)
//         else {
//             data.rows.forEach(elem => {
//                 let item = {
//                     address: elem.address,
//                     nname: elem.nname,
//                     email: elem.email
//                 }
//                 dataArr.push(item)
//             })
//         }
//         pool.end()
//         res.render('./property/display', {properties: dataArr})
//     })
// }

function getProperties(req, res) {
    properties = [
        {
            address: '5935 disputed rd',
            neighborhood: 'Pierrefonds-Roxboro',
            owner: 'hunter.roy@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        },
        {
            address: '556 coastal highway',
            neighborhood: 'Anjou',
            owner: 'ryder.barnaby@example.com'
        }
    ]
    res.render('./property/display', {properties})
}

module.exports = {
    getProperties
}