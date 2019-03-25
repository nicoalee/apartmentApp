const { Pool, Client } = require('pg')

const dbConfig = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}

async function sendQuery(query) {
    const pool = new Pool(dbConfig)
    return pool.query(query)
        .then((data) => {
            pool.end()
            return data.rows
        })
        .catch((err) => {
            pool.end()
            return err
        })
}

function getNeighborhoods(req, res) {
    
    let query = "SELECT * FROM neighbourhood"
    let msg = req.params.msg

    sendQuery(query)
        .then((queryResult) => {
            if(queryResult.name == 'error') {
                console.log(queryResult.name + ': ' + queryResult.code);
                res.render('./err', {error: queryResult.code})
            } else {
                res.render('./neighborhood/display', {neighborhoods: queryResult, Success: msg})
            }
        })
}

function getProperties(req, res) {
    let nname = req.params.neighborhood
    let query = "SELECT p.nname, p.address, AVG(r.rating) average_rating, COUNT(*) rating_count FROM property p, property_review pr, review r WHERE p.address = pr.address AND r.review_id = pr.review_id AND p.nname = '" + nname +"' GROUP BY p.address ORDER BY average_rating DESC;"

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error: data.code})
            } else {
                let averageReview = 0
                let numReviews = 0
                if(data.length > 0) {
                    // find average rating for neighborhood
                    let sumReviews = 0
                    data.forEach(element => {
                        numReviews = numReviews + parseInt(element.rating_count)
                        sumReviews = sumReviews + (element.rating_count * element.average_rating)
                    });
                    averageReview = (Math.round(sumReviews/numReviews * 100)/100).toString()

                    data.forEach(element => {
                        element.average_rating = (Math.round(element.average_rating * 100)/100).toString()
                    })
                }

                let details = {
                    name: nname,
                    averageReview: averageReview,
                    numReviews: numReviews
                }              
                res.render('./neighborhood/info', {properties: data, details: details})
            }
        })
}


module.exports = {
    getNeighborhoods,
    getProperties
}