const { Pool, Client } = require('pg')

function getNeighborhoods(req, res) {

    const pool = new Pool({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    })

    let query = "SELECT * FROM neighbourhood"

    pool.query(query, (err, data) => {
        let dataArr = []
        if(err) console.log(err)
        else {
            data.rows.forEach(elem => {
                let item = {
                    nname: elem.nname,
                    population: elem.population
                }
                dataArr.push(item)
            })
        }
        pool.end()
        res.render('./neighborhood/display', {neighborhoods: dataArr})
    })
}

// function getNeighborhoods(req, res) {

//     let neighborhoods = [
//         {
//             nname: "New York",
//             population: 1244
//         },
//         {
//             nname: "California",
//             population: 2398345
//         },
//         {
//             nname: "Montreal",
//             population: 328894
//         },
//         {
//             nname: "Paris",
//             population: 239045
//         },
//         {
//             nname: "Lachine",
//             population: 4845
//         },
//         {
//             nname: "Little Arkansas",
//             population: 8943
//         },
//         {
//             nname: "Chinatown",
//             population: 32903
//         }
//     ]
//     res.render('./neighborhood/display', {neighborhoods: neighborhoods})
// }

function getAverage(req, res) {

    const pool = new Pool({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    })

    let neighborhoodParam = req.params.neighborhood

    let querypt1 = "SELECT nname, address, avg_rating, num_reviews FROM (SELECT P.nname, P.address, AVG(R.rating) AS avg_rating, COUNT(R.rating) as num_reviews FROM Property P,Property_Review PR, Review R WHERE PR.review_ID = R.review_ID AND P.address = PR.address GROUP BY P.address) AS PropertyRatings WHERE nname IN ('"
    let querypt2 = "') ORDER BY avg_rating DESC,num_reviews DESC LIMIT 10;"
    let query = querypt1 + neighborhoodParam + querypt2
    
    pool.query(query, (err, data) => {
        let item = {}
        if(err) console.log(err)
        else {
            data.rows.forEach(elem => {
                item = {
                    nname: elem.nname,
                    address: elem.address,
                    avg_rating: elem.avg_rating,
                    num_reviews: elem.num_reviews
                }
            })
        }
        pool.end()
        
        res.render('./neighborhood/info', {neighborhoodInfo: item})
    })
}


module.exports = {
    getNeighborhoods,
    getAverage
}