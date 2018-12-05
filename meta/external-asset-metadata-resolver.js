/**
 * Query assets metadata from external resource.
 * @param {AssetQueryModel} queryParams - Query parameters.
 * @return {Promise<Array>}
 */
function queryExternal(queryParams) {
    //here the request to the external resource (database, private API etc) can be implemented
    return Promise.resolve(undefined)
}

module.exports = queryExternal