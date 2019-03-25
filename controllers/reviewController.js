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

async function deleteQuery(query1, query2) {
    const pool = new Pool(dbConfig)
    return pool.query(query1)
        .then((data) => {
            return pool.query(query2)
                .then((data) => {
                    pool.end()
                    return data.rows
                })
                .catch((err) => {
                    pool.end()
                    return err
                })
        })
        .catch((err) => {
            pool.end()
            return err
        })
}

function getReviews(req, res) {

    let ownerReviewQuery = "SELECT review.review_id, email, description, rating FROM owner_review JOIN review ON owner_review.review_id = review.review_id;"
    let neighborhoodReviewQuery = "SELECT review.review_id, nname, description, rating FROM neighbourhood_review JOIN review ON neighbourhood_review.review_id = review.review_id;"
    let propertyReviewQuery = "SELECT review.review_id, start_lease_date, end_lease_date, unit_number, address, description, rating FROM property_review JOIN review ON property_review.review_id = review.review_id;"
    let msg = req.params.msg

    sendQuery(ownerReviewQuery)
        .then((ownerReviews) => {
            if(ownerReviews.name == 'error') {
                console.log(ownerReviews.name + ': ' + ownerReviews.code);
                res.render('./err', {error: ownerReviews.code})
            } else {

                sendQuery(neighborhoodReviewQuery)
                    .then((neighborhoodReviews) => {

                        if(neighborhoodReviews.name == 'error') {
                            console.log(neighborhoodReviews.name + ': ' + neighborhoodReviews.code);
                            res.render('./err', {error: neighborhoodReviews.code})
                        } else {

                            sendQuery(propertyReviewQuery)
                                .then((propertyReviews) => {
                                    if(propertyReviews.name == 'error') {
                                        console.log(propertyReviews.name + ': ' + propertyReviews.code);
                                        res.render('./err', {error: propertyReviews.code})
                                    } else {
                                        // fixing dates
                                        propertyReviews.forEach((element) => {
                                            if(element.start_lease_date != null) {
                                                let startDate = element.start_lease_date
                                                let endDate = element.end_lease_date
                                                let startDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear()
                                                let endDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear()            
                                                element.start_lease_date = startDateStr
                                                element.end_lease_date = endDateStr
                                            }
                                        });                                          
                                        res.render('./review/display', {ownerReviews: ownerReviews, neighborhoodReviews: neighborhoodReviews, propertyReviews: propertyReviews, msg: msg})
                                    }
                                })
                        }
                    })
            }
        })
}


function createReview(req, res) {
    
    let reviewType = req.body.review
    let rating = req.body.optionsRadios
    let email = req.body.email
    let description = req.body.description
    let nname = req.body.nname
    let ownerEmail = req.body.ownerEmail
    let startDate = req.body.startDate
    let endDate = req.body.endDate
    let unitNumber = req.body.unitNumber
    let address = req.body.address

    let createReviewQuery = "INSERT INTO review (review_id,description,rating) VALUES ((SELECT MAX(review_id) FROM review)+1, "
    let writesQuery = "INSERT INTO Writes VALUES ((SELECT MAX(review_id) FROM review), '" + email + "')"
    let neighborhoodQuery = "INSERT INTO neighbourhood_review (review_id, nname) VALUES ((SELECT MAX(review_id) FROM review), '" + nname + "')"
    let ownerQuery = "INSERT INTO owner_review (review_id, email) VALUES ((SELECT MAX(review_id) FROM review), '"+ ownerEmail +"')"
    let propertyQuery = "INSERT INTO property_review (review_id, start_lease_date, end_lease_date, unit_number, address) VALUES ((SELECT MAX(review_id) FROM review), "
    if(startDate && endDate) {
        propertyQuery = propertyQuery + "CAST('" + startDate +"' AS Date), CAST('" + endDate + "' AS Date), "
    } else {
        propertyQuery = propertyQuery + "null, null, "
    }   
    if(unitNumber) {
        propertyQuery = propertyQuery + unitNumber + ", '" + address + "')"
    } else {
        propertyQuery = propertyQuery + "null, '" + address + "')"
    }
    if(description) {
        createReviewQuery = createReviewQuery + "'" + description + "', " + rating + ");"
    } else {
        createReviewQuery = createReviewQuery + "null, " + rating + ")";
    }
    
    // check if member exists
    // if yes, create review, add to writes table
    // if neighborhood_review, im good
    // if owner_review, check that owner exists (db can do it for me)
    // if property_review, check address exists (db can do it for me)

    memberExists(email)
        .then((succ) => {
            if(succ) {
                if(reviewType == "Neighborhood Review") {

                    sendQuery(createReviewQuery)
                        .then((data) => {
                            if(data.name == 'error') {
                                console.log(data.name + ': ' + data.code);
                                res.render('./err', {error: data.code})
                            } else {
                                sendQuery(writesQuery)
                                    .then((data) => {
                                        if(data.name == 'error') {
                                            console.log(data.name + ': ' + data.code);
                                            res.render('./err', {error: data.code})
                                        } else {
                                            //create neighborhood
                                            sendQuery(neighborhoodQuery)
                                            .then((data) => {
                                                if(data.name == 'error') {
                                                    console.log(data.name + ': ' + data.code);
                                                    res.render('./err', {error: data.code})
                                                } else {
                                                    req.params.msg = "Success! " + reviewType + " created!"
                                                    getReviews(req, res)
                                                }
                                            })
                                        }
                                    })
                            }
                        })

                } else if(reviewType == "Owner Review") {
                    sendQuery(createReviewQuery)
                        .then((data) => {
                            if(data.name == 'error') {
                                console.log(data.name + ': ' + data.code);
                                res.render('./err', {error: data.code})
                            } else {
                                sendQuery(writesQuery)
                                    .then((data) => {
                                        if(data.name == 'error') {
                                            console.log(data.name + ': ' + data.code);
                                            res.render('./err', {error: data.code})
                                        } else {
                                            sendQuery(ownerQuery)
                                            // create an owner
                                                .then((data) => {
                                                    if(data.name == 'error') {
                                                        if(data.code == 23503) {
                                                            let deleteQuery1 = "DELETE FROM Writes WHERE review_id=(SELECT MAX(review_id) FROM review)"
                                                            let deleteQuery2 = "DELETE FROM Review WHERE review_id=(SELECT MAX(review_id) FROM review)"
                                                            deleteQuery(deleteQuery1, deleteQuery2)
                                                                .then((data) => {
                                                                    if(data.name == 'error') {
                                                                        console.log(data.name + ': ' + data.code);
                                                                        return true
                                                                    } else {
                                                                        req.params.msg = "The address " + address + " does not exist!"
                                                                        directToNew(req, res)
                                                                    }
                                                                })
                                                        } else {
                                                            console.log(data.name + ': ' + data.code);
                                                            res.render('./err', {error: data.code})
                                                        }
                                                    } else {
                                                        req.params.msg = "Success! " + reviewType + " created!"
                                                        getReviews(req, res)
                                                    }
                                                })
                                        }
                                    })
                            }
                        })

                } else {
                    // creating property review
                    
                    sendQuery(createReviewQuery)
                        .then((data) => {
                            if(data.name == 'error') {
                                console.log(data.name + ': ' + data.code);
                                res.render('./err', {error: data.code})
                            } else {

                                sendQuery(writesQuery)
                                    .then((data) => {
                                        if(data.name == 'error') {
                                            console.log(data.name + ': ' + data.code);
                                            res.render('./err', {error: data.code})
                                        } else {
                                            sendQuery(propertyQuery)
                                                .then((data) => {
                                                    if(data.name == 'error') {
                                                        if(data.code == 23503) {
                                                            let deleteQuery1 = "DELETE FROM Writes WHERE review_id=(SELECT MAX(review_id) FROM review)"
                                                            let deleteQuery2 = "DELETE FROM Review WHERE review_id=(SELECT MAX(review_id) FROM review)"
                                                            deleteQuery(deleteQuery1, deleteQuery2)
                                                                .then((data) => {
                                                                    if(data.name == 'error') {
                                                                        console.log(data.name + ': ' + data.code);
                                                                        return true
                                                                    } else {
                                                                        req.params.msg = "The address " + address + " does not exist!"
                                                                        directToNew(req, res)
                                                                    }
                                                                })
                                                        } else {
                                                            console.log(data.name + ': ' + data.code);
                                                            res.render('./err', {error: data.code})
                                                        }
                                                    } else {
                                                        req.params.msg = "Success! " + reviewType + " created!"
                                                        getReviews(req, res)
                                                    }
                                                })
                                        }
                                    })
                            }
                        })
                }
            } else {
                res.render('./review/new', {ErrMsg: "The member " + email + " does not exist!s"})
            }
        })

}

// checks if member exists. NOTE: Does not check person database
function memberExists(email) {
    
    let existQueryPerson = "SELECT * FROM Member WHERE email = '" + email + "'"

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

function directToNew(req, res) {
    let query = "SELECT * FROM Neighbourhood"
    let msg = req.params.msg

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error: data.code})
            } else {
                let tempArr = []
                data.forEach(element => {
                    tempArr.push(element.nname)
                });
                res.render('./review/new', {neighborhoods: tempArr, ErrMsg: msg})
            }
        })
}


module.exports = {
    getReviews,
    createReview,
    directToNew
}