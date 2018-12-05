const AssetQueryModel = require('../api/asset-query-model'),
    queryStatic = require('./static-asset-metadata-resolver'),
    queryExternal = require('./external-asset-metadata-resolver'),
    {preparePagedData} = require('./list-helper')

/**
 * Query assets metadata.
 * @param {AssetQueryModel} queryParams - Query parameters.
 * @return {Promise<Array>}
 */
function queryAssets(queryParams) {
    //try to query from external resource
    return queryExternal(queryParams)
        //fallback to static file meta
        .then(data => data || queryStatic(queryParams))
        //format the response to follow Horizon API format convention
        .then(res => preparePagedData(queryParams, res))
}

module.exports = queryAssets