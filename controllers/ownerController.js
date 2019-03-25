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

function getOwners(req, res) {

    let query = "SELECT * FROM owner JOIN person ON owner.email = person.email"
    let msg = req.params.msg

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error: data.code})
            } else {
                res.render('./owner/display', {owners: data, msg: msg})
            }
        })
}

function getOwnerInfo(req, res) {

    let name = req.params.name
    let email = req.params.email
    let msg = req.params.msg
    
    let propertiesQuery = "SELECT * FROM property WHERE email = '" + email + "'"
    let averagesQuery = "SELECT p.email, AVG(r.rating), COUNT(*) FROM (SELECT * FROM property WHERE email = '" + email +"') p, property_review pr, review r WHERE p.address = pr.address AND r.review_id = pr.review_id GROUP BY p.email;"
    let avgOwnerRating = "SELECT owr.email, AVG(r.rating) avg_rating, COUNT(*) num_reviews FROM owner_review owr, review r WHERE owr.review_id = r.review_id AND owr.email = '" + email + "' GROUP BY owr.email;"
    let ownerReviews = "SELECT X.email as ownerEmail, X.review_id, description, rating, w.email as ReviewerEmail FROM (SELECT email, r.review_id, description, rating FROM review r, owner_review owr WHERE r.review_id = owr.review_id AND owr.email = '"+ email +"') X JOIN writes w ON X.review_id = w.review_id;"

    sendQuery(propertiesQuery)
        .then((allProperties) => {
            if(allProperties.name == 'error') {
                console.log(allProperties.name + ': ' + allProperties.code);
                res.render('./err', {error: allProperties.code})
            } else {

                sendQuery(averagesQuery)
                    .then((allAverages) => {
                        if(allAverages.name == 'error') {
                            console.log(allAverages.name + ': ' + allAverages.code);
                            res.render('./err', {error: allAverages.code})
                        } else {
                            
                            sendQuery(avgOwnerRating)
                                .then((avgRating) => {
                                    if(avgRating.name == 'error') {
                                        console.log(avgRating.name + ': ' + avgRating.code);
                                        res.render('./err', {error: avgRating.code})
                                    } else {

                                        sendQuery(ownerReviews)
                                            .then((allReviews) => {
                                                if(allReviews.name == 'error') {
                                                    console.log(allReviews.name + ': ' + allReviews.code);
                                                    res.render('./err', {error: allReviews.code})
                                                } else {
                                                    console.log("allProperties: ");
                                                    console.log(allProperties);
                                                    console.log("allAverages: ");
                                                    console.log(allAverages);
                                                    console.log("avgRating: ");
                                                    console.log(avgRating);
                                                    console.log("allReviews: ");
                                                    console.log(allReviews);
                                                    
                                                    if(avgRating.length != 0) {
                                                        avgRating[0].avg_rating = (Math.round(avgRating[0].avg_rating * 100)/100).toString()
                                                    }
                                                    if(allAverages.length != 0) {
                                                        allAverages[0].avg = (Math.round(allAverages[0].avg * 100)/100).toString()
                                                    }
                                                    res.render('./owner/info', {allProperties: allProperties, allAverages : allAverages[0], avgRating : avgRating[0], allReviews : allReviews, owner: {name: name, email: email}, msg: msg})

                                                }
                                            })
                                    }
                                })
                        }
                    })
            }       
        })
}

function updateOwner(req, res) {

    let email = req.params.email
    let name = req.body.name
    
    let query = "UPDATE Person SET name='" + name + "' WHERE email='" + email + "'"
    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error : data.code})
            } else {
                req.params.name = name
                req.params.msg = "Success! Owner " + email + " updated with new name: " + name
                getOwnerInfo(req, res)
            }
        })
}

function deleteOwner(req, res) {

    let email = req.params.email
    let query = "DELETE FROM Owner WHERE email = '" + email + "'"

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error : data.code})
            } else {
                req.params.msg = "Owner " + email + " deleted"
                getOwners(req, res)
            }
        })
}

function createOwner(req, res) {

    let email = req.body.email
    let name = req.body.name
    req.params.email = email
    req.params.name = name

    let createPersonQuery = "INSERT INTO Person VALUES('" + email + "', '" + name + "')"
    let createOwnerQuery = "INSERT INTO Owner VALUES ('" + email + "')"

    ownerExists(email)
        .then((succ) => {
            if(succ) {
                res.render('./owner/new', {ErrMsg: "The owner " + email + " already exists"})
            } else {
                sendQuery(createPersonQuery)
                    .then((data) => {
                        if(data.name == 'error') {
                            console.log(data.name + ': ' + data.code);
                            res.render('./err', {error: data.code})
                        } else {
                            sendQuery(createOwnerQuery)
                                .then((data) => {
                                    if(data.name == 'error') {
                                        console.log(data.name + ': ' + data.code);
                                        res.render('./err', {error: data.code})
                                    } else {
                                        req.params.msg = "Success! Owner " + email + " created!"
                                        getOwnerInfo(req, res)
                                    }
                                })
                        }
                    })
            }
        })
}

// check if owner exists in the database
function ownerExists(email) {
    
    let existQueryPerson = "SELECT * FROM Owner WHERE email = '" + email + "'"

    return sendQuery(existQueryPerson)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                return true
            } else {
                // data is empty, so doesn't exist
                if(data === undefined || data.length == 0) {
                    return false
                } else {
                    return true
                }
            }
        })
}

module.exports = {
    getOwners,
    getOwnerInfo,
    updateOwner,
    deleteOwner,
    createOwner
}