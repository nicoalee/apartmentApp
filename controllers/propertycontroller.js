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

function getProperties(req, res) {

    let query = "SELECT * FROM property"
    let msg = req.params.msg

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error: data.code})
            } else {
                res.render('./property/display', {properties: data, msg: msg})
            }
        })
}

// TODO: FIX THIS. QUERY IS WRONG.
// TODO: ADD UPDATE OWNER FUNCTIONALITY
function getReviews(req, res) {

    let address = req.params.address
    let neighborhood = req.params.neighborhood
    
    let avgQuery = "SELECT p.address, AVG(r.rating), COUNT(*) FROM (SELECT * FROM property WHERE address = '"+ address +"') p, property_review pr, review r WHERE p.address = pr.address AND r.review_id = pr.review_id GROUP BY p.address;"
    let getReviews = "SELECT pf.address, pf.unit_number, pf.start_lease_date, pf.end_lease_date, pf.description, pf.rating, w.email AS reviewer_email FROM (SELECT p.address, nname, email, pr.review_id, start_lease_date, end_lease_date, unit_number, description, rating FROM (SELECT * FROM property WHERE address = '" + address + "') p, property_review pr, review r WHERE p.address = pr.address AND r.review_id = pr.review_id) AS pf JOIN writes w ON w.review_id = pf.review_id;"

    sendQuery(avgQuery)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                res.render('./err', {error: data.code})
            } else {
                if(data.length > 0) {
                    data[0].avg = (Math.round(data[0].avg*100)/100).toString()
                }

                sendQuery(getReviews)
                    .then((moreData) => {
                        if(moreData.name == 'error') {
                            console.log(moreData.name + ': ' + moreData.code);
                            res.render('./err', {error: moreData.code})
                        } else {
                            moreData.forEach((element) => {
                                if(element.start_lease_date != null) {
                                    let startDate = element.start_lease_date
                                    let endDate = element.end_lease_date
                                    let startDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear()
                                    let endDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear()            
                                    element.start_lease_date = startDateStr
                                    element.end_lease_date = endDateStr
                                }
                            });    
                            res.render('./property/info', {reviews: moreData, averages: data[0], address: address, neighborhood: neighborhood})
                        }
                    })
            }
        })
}

function createProperty(req, res) {
    
    let address = req.body.address
    let email = req.body.email
    let nname = req.body.nname

    let createPropertyQuery = "INSERT INTO Property VALUES('" + address + "', '" + nname + "'"
    
    if(email) {
        createPropertyQuery = createPropertyQuery + ", '" + email + "')"
    } else {
        createPropertyQuery = createPropertyQuery + ", null)"
    }

    propertyExists(address)
        .then((succ) => {
            if(succ) {
                req.params.msg = "The property " + address + " already exists!"
                directToNew(req, res)
            } else {

                sendQuery(createPropertyQuery)
                    .then((data) => {
                        if(data.name == 'error') {
                            if(data.code = 23503) {
                                req.params.msg = "The owner " + email + " does not exist! Please create an owner first."
                                directToNew(req, res)
                            } else {
                                console.log(data.name + ': ' + data.code);
                                res.render('./err', {error: data.code})
                            }
                        } else {
                            req.params.msg = "Success! Property " + address + " created!"
                            getProperties(req, res)
                        }
                    })
            }
        })
}

// check if owner exists in the database
function propertyExists(address) {
    
    let existQueryProperty = "SELECT * FROM Property WHERE address = '" + address + "'"

    return sendQuery(existQueryProperty)
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

    let query = "SELECT * FROM neighbourhood;"
    let msg = req.params.msg

    sendQuery(query)
        .then((data) => {
            if(data.name == 'error') {
                console.log(data.name + ': ' + data.code);
                return true
            } else {
                let neighborhoodList = []
                data.forEach(element => {
                    neighborhoodList.push(element.nname)
                });                
                res.render('./property/new', {neighborhoods: neighborhoodList, ErrMsg : msg})
            }
        })
}

module.exports = {
    getProperties,
    getReviews,
    createProperty,
    directToNew
}