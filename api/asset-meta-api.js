const queryAssets = require('../meta/assets-resolver'),
    AssetQueryModel = require('./asset-query-model')

//process the relative API path if it was provided
let relativePath = process.env.RELATIVE_PATH
if (relativePath) {
    if (relativePath[0] !== '/') {
        relativePath = '/' + relativePath
    }
} else {
    relativePath = ''
}

module.exports = function (app) {
    //map the API route
    app.get(relativePath, function (req, res) {
        //parse query params
        const queryParams = new AssetQueryModel(req)
        //invoke query
        queryAssets(queryParams)
            //send response in JSON format
            .then(data => res.json(data))
            .catch(err => {
                //primitive error handling
                console.error(err)
                res.status(500).end()
            })
    })
}