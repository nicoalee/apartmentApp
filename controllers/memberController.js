const { Pool, Client } = require('pg')

// function getMembers(req, res) {

//     const pool = new Pool({
//         user: process.env.DB_USERNAME,
//         host: process.env.DB_HOST,
//         database: process.env.DB_NAME,
//         password: process.env.DB_PASSWORD,
//         port: process.env.DB_PORT,
//     })

//     let query = "SELECT * FROM member"

//     pool.query(query, (err, data) => {
//         let dataArr = []
//         if(err) console.log(err)
//         else {
//             data.rows.forEach(elem => {
                
//                 dataArr.push(elem.email)
//             })
//         }
//         pool.end()
//         res.render('./member/display', {members: dataArr})
//     })
// }

function getMembers(req, res) {
    res.render('./member/display', {members: ['email1@example.com', 'email2@example.com', 'email3@example.com', 'email4@example.com', 'email5@example.com','email6@example.com','email7@example.com','email8@example.com','email9@example.com','email10@example.com','email11@example.com','email12@example.com']})
}

module.exports = {
    getMembers
}