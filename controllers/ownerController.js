const { Pool, Client } = require('pg')

// function getMembers(req, res) {

//     const pool = new Pool({
//         user: process.env.DB_USERNAME,
//         host: process.env.DB_HOST,
//         database: process.env.DB_NAME,
//         password: process.env.DB_PASSWORD,
//         port: process.env.DB_PORT,
//     })

//     let query = "SELECT * FROM owner"

//     pool.query(query, (err, data) => {
//         let dataArr = []
//         if(err) console.log(err)
//         else {
//             data.rows.forEach(elem => {
                
//                 dataArr.push(elem.email)
//             })
//         }
//         pool.end()
//         res.render('./owner/display', {owners: dataArr})
//     })
// }

function getOwners(req, res) {
    res.render('./owner/display', {owners: ['owner1@example.com', 'owner2@example.com', 'owner3@example.com', 'owner4@example.com', 'owner5@example.com','owner6@example.com','owner7@example.com','owner8@example.com','owner9@example.com','owner10@example.com','owner11@example.com','owner12@example.com']})
}

module.exports = {
    getOwners
}