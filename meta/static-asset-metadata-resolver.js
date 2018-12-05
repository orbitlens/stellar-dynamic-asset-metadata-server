const fs = require('fs'),
    path = require('path'),
    {generatePagingToken} = require('./list-helper')

class StaticAssetsMetadataContainer {
    constructor() {
        this.staticAssetsFileName = path.join(__dirname, '..', 'assets.json')
        this.staticAssets = []

        this.fetch()
        this.watchChanges()
    }

    /**
     * Fetch metadata from the static file.
     */
    fetch() {
        //read JSON from disk
        fs.readFile(this.staticAssetsFileName, 'utf8', (err, data) => {
            if (err) return console.error(`Failed to read assets metadata from file "${this.staticAssetsFileName}".`, err)
            try {
                //try to parse data
                const parsed = JSON.parse(data)
                //array check
                if (!(parsed instanceof Array)) throw new Error('Invalid assets metadata. Expected JSON-serialized array of objects.')
                //required parameters check
                for (let asset of parsed) {
                    if (!asset.code) throw new Error('Invalid asset description. Asset code is missing.')
                    if (!asset.issuer) throw new Error('Invalid asset description. Asset issuer is missing.')
                }
                //sort and ensure uniqueness
                parsed.sort(function (a, b) {
                    if (a.code < b.code) return -1
                    if (a.code > b.code) return 1
                    if (a.issuer < b.issuer) return -1
                    if (a.issuer > b.issuer) return 1
                    throw new Error(`Duplicate asset description for ${generatePagingToken(a)}.`)
                })
                //update static mapping
                this.staticAssets = parsed
            } catch (e) {
                console.error(`Failed to parse assets metadata from file "${this.staticAssetsFileName}".`, err)
            }
        })
    }

    /**
     * Watch for file changes and reload assets immediately.
     */
    watchChanges() {
        fs.watch(this.staticAssetsFileName, (event, filename) => this.fetch())
    }

    /**
     * Query assets metadata.
     * @param {AssetQueryModel} queryParams - Query parameters.
     * @return {Array}
     */
    query(queryParams) {
        const res = [],
            {code, issuer, cursor, limit, order} = queryParams

        let assets = this.staticAssets,
            cursorPositionFound = false
        //reverse an array if desc order requested
        if (order === 'desc') {
            assets = assets.slice(0).reverse()
        }
        //iterate through the assets
        for (let asset of assets) {
            //skip entries until the cursor found
            if (cursor && !cursorPositionFound) {
                const pagingToken = generatePagingToken(asset)
                if (pagingToken === cursor) {
                    cursorPositionFound = true //we found the cursor position
                }
                //skip and proceed to the next entry
                continue
            }
            //skip entries if code doesn't match
            if (code && asset.code !== code) continue
            //skip entries if issuer doesn't match
            if (issuer && asset.issuer !== issuer) continue
            //the asset matches all the criteria - add it to the results array
            res.push(asset)
            //stop iterating when limit reached
            if (res.length === limit) break
        }
        return res
    }
}

const metaContainer = new StaticAssetsMetadataContainer()

/**
 * Query assets metadata from static file (assets.json).
 * @param {AssetQueryModel} queryParams - Query parameters.
 * @return {Promise<Array>}
 */
function queryStatic(queryParams) {
    try {
        return Promise.resolve(metaContainer.query(queryParams))
    } catch (e) {
        console.error(e)
        return Promise.reject(`Failed to query static assets metadata.`)
    }
}

module.exports = queryStatic