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

function getMembers(req, res) {
    
    let query = "SELECT * FROM member JOIN person ON member.email = person.email"
    
    let msg = req.params.msg

    sendQuery(query)
        .then((queryResult) => {
            if(queryResult.name == 'error') {
                console.log(queryResult.name + ': ' + queryResult.code);
                res.render('./err', {error: queryResult.code})
            } else {
                res.render('./member/display', {members: queryResult, Success: msg})
            }
        })
}

function getMemberReviews(req, res) {
    
    let email = req.params.email
    let name = req.params.name
    let msg = req.params.msg

    let propertyReviewsQuery = "SELECT * FROM (SELECT r.review_id AS rrid, w.email AS reviewer_email, r.description, r.rating FROM review r, writes w WHERE r.review_id = w.review_id AND w.email = '" + email + "') rw JOIN property_review pr ON rw.rrid = pr.review_id;"
    let neighborhoodReviewsQuery = "SELECT * FROM (SELECT r.review_id AS rrid, w.email AS reviewer_email, r.description, r.rating FROM review r, writes w WHERE r.review_id = w.review_id AND w.email = '" + email + "') rw JOIN neighbourhood_review nr ON rw.rrid = nr.review_id;"
    let ownerReviewsQuery = "SELECT * FROM (SELECT r.review_id AS rrid, w.email AS reviewer_email, r.description, r.rating FROM review r, writes w WHERE r.review_id = w.review_id AND w.email = '" + email + "') rw JOIN owner_review owr ON rw.rrid = owr.review_id;"

    sendQuery(propertyReviewsQuery)
        .then((propertyReviews) => {
            if(propertyReviews.name == 'error') {
                console.log(propertyReviews.name + ': ' + propertyReviews.code);
                res.render('./err', {error: propertyReviews.code})
            } else {

                sendQuery(ownerReviewsQuery)
                    .then((ownerReviews) => {
                        if(ownerReviews.name == 'error') {
                            console.log(ownerReviews.name + ': ' + ownerReviews.code);
                            res.render('./err', {error: ownerReviews.code})
                        } else {

                            sendQuery(neighborhoodReviewsQuery)
                                .then((neighborhoodReviews) => {

                                    if(neighborhoodReviews.name == 'error') {
                                        console.log(neighborhoodReviews.name + ': ' + neighborhoodReviews.code);
                                        res.render('./err', {error: neighborhoodReviews.code})
                                    } else {
                                        let member = { email: email, name: name }

                                        // fixing dates
                                        propertyReviews.forEach((element) => {
                                            let startDate = element.start_lease_date
                                            let endDate = element.end_lease_date
                                            let startDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear()
                                            let endDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear()            
                                            element.start_lease_date = startDateStr
                                            element.end_lease_date = endDateStr
                                        });                                        

                                        let reviews = { propertyReviews, ownerReviews, neighborhoodReviews }
                                        res.render('./member/info', {reviews: reviews, member: member, msg: msg})
                                    }
                                })
                        }
                    })
            }
        })
}

function createMember(req, res) {

    let email = req.body.email
    let name = req.body.name
    req.params.email = email
    req.params.name = name

    let createPersonQuery = "INSERT INTO Person VALUES('" + email + "', '" + name + "')"
    let createMemberQuery = "INSERT INTO Member VALUES ('" + email + "')"

    memberExists(email)
        .then((succ) => {

            if(succ) {
                res.render('./member/new', {ErrMsg: "The member " + email + " already exists"})
            } else {
                PersonExists(email)
                    .then((succ) => {
                        if(succ) {
                            sendQuery(createMemberQuery)
                                .then((data) => {
                                    if(data.name == 'error') {
                                        console.log(data.name + ': ' + data.code);
                                        res.render('./err', {error: data.code})
                                    } else {
                                        req.params.msg = "Success! Member " + email + " created!"
                                        getMemberReviews(req, res)
                                    }
                                })
                        } else {
                            sendQuery(createPersonQuery)
                                .then((data) => {
                                    if(data.name == 'error') {
                                        console.log(data.name + ': ' + data.code);
                                        res.render('./err', {error: data.code})
                                    } else {

                                        sendQuery(createMemberQuery)
                                            .then((data) => {
                                                if(data.name == 'error') {
                                                    console.log(data.name + ': ' + data.code);
                                                    res.render('./err', {error: data.code})
                                                } else {
                                                    req.params.msg = "Success! Member " + email + " created!"
                                                    getMemberReviews(req, res)
                                                }
                                            })

                                    }
                                })
                        }
                    })
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

// check if person exists in the database
function PersonExists(email) {
    
    let existQueryPerson = "SELECT * FROM Person WHERE email = '" + email + "'"

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

function deleteMember(req, res) {

    let email = req.params.email
    let query = "DELETE FROM Member WHERE email = '" + email + "'"

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error : data.code})
            } else {
                req.params.msg = "Member " + email + " deleted"
                getMembers(req, res)
            }
        })
}

function updateMember(req, res) {

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
                req.params.msg = "Success! Member " + email + " updated with new name: " + name
                getMemberReviews(req, res)
            }

        })
}

module.exports = {
    getMembers,
    getMemberReviews,
    createMember,
    memberExists,
    deleteMember,
    updateMember
}