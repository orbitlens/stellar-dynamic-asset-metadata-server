# Stellar Dynamic Asset Metadata Service

This service is a reference NodeJS implementation of 
[Stellar SEP DRAFT-0004](https://github.com/stellar/stellar-protocol/blob/master/drafts/draft-0004.md). 

It's the standard way for the anchor to provide metadata for the unlimited 
number of assets without defining each of them in `stellar.toml` file. 
There are plenty of use-cases that require issuing thousands of assets: 
bonds, securities, futures, non-fungible tokens.

The service allows the anchor to define assets metadata using one of the  
following approaches:

- Static files containing asset metadata in JSON format.
- External resources like databases or internal API/RPC interfaces.

## Installation

Prerequisites: [NodeJS](https://nodejs.org/) 8.6.0 or later.

Clone the repository to local service directory.

    git clone https://github.com/orbitlens/stellar-dynamic-asset-metadata-server.git
    cd ./stellar-dynamic-asset-metadata-server

Install the dependencies.

    npm i 

## Configuration

**Environment Variables**
 
- `PORT` - API port (`3000` by default).
- `RELATIVE_PATH` - API endpoint relative path (`/` by default)  
For example, `assets/` or `assets-meta-server/`. 

**Static Configuration**

To statically manage assets metadata, add all assets controlled by the domain 
to the `./assets.json` file. The detailed description of all supported fields 
can be found in [SEP-0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md#currency-documentation).

Sample configuration:

    [
      {
        "code": "EXAMPLE",
        "issuer": "GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI",
        "status": "test",
        "name": "Example",
        "desc": "Example token for testing purpose only.",
        "conditions": "Issued for testing, not meant to be used on public network.",
        "image": "https://via.placeholder.com/128",
        "fixed_number": 1000000
      },
      {
        "code": "GOLD",
        "issuer": "GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI",
        "status": "test",
        "display_decimals": "4",
        "name": "Gold-backed sample token",
        "is_unlimited": true,
        "is_asset_anchored": true,
        "anchor_asset_type": "commodity",
        "anchor_asset": "GOLD",
        "redemption_instructions": "For testing purpose only."
      }
    ]

**Dynamic metadata resolution**

In the case of the dynamic asset metadata resolution, it's possible to extend 
the [`meta/external-asset-metadata-resolver.js`](meta/external-asset-metadata-resolver.js) 
to request data from the external resource (database, private API etc).

**Production deployment**

It is recommended to use the Dynamic Asset Metadata Service behind the reverse 
proxy (nginx, haproxy) or load-balancer with SSL offloading. In the production 
environment the data should be served strictly via HTTPS protocol and from 
the domain/subdomain set as the `home_domain` of the issuing accounts.  

## Starting the service

    node server.js
    
Once it is up and running, we can experiment with queries supported by 
[SEP DRAFT-0004](https://github.com/stellar/stellar-protocol/blob/master/drafts/draft-0004.md).

Fetch assets:

    curl http://localhost:3001/
    
Descending sort order, 200 items per page: 

    curl http://localhost:3001/?order=desc&limit=200
    
Find all assets issued by the particular account:
    
    curl http://localhost:3001/?issuer=GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI
    
Fetch metadata for the specific asset:
    
    curl http://localhost:3001/?code=EXAMPLE&issuer=GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI
    
Response JSON example:
    
    {
      "_links": {
        "self": {
          "href": "http://localhost:3001/assets/?order=desc&limit=10"
        },
        "prev": {
          "href": "http://localhost:3001/assets/?order=asc&limit=10&cursor=EXAMPLE-GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI"
        },
        "next": {
          "href": "http://localhost:3001/assets/?order=desc&limit=10&cursor=EXAMPLE-GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI"
        }
      },
      "_embedded": {
        "records": [
          {
            "code": "EXAMPLE",
            "issuer": "GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI",
            "status": "test",
            "display_decimals": "7",
            "name": "Example token",
            "desc": "Example token for testing purpose only.",
            "conditions": "Issued for testing, not meant to be used on public network.",
            "image": "https://via.placeholder.com/128",
            "fixed_number": 1000000,
            "max_number": 1000000,
            "is_unlimited": false,
            "is_asset_anchored": "true if token can be redeemed for underlying asset, otherwise false",
            "anchor_asset_type": "Type of asset anchored. Can be fiat, crypto, stock, bond, commodity, realestate, or other.",
            "anchor_asset": "If anchored token, asset that token is anchored to. E.g. USD, BTC, SBUX, Address of real-estate investment property.",
            "redemption_instructions": "No redemption, the token is for testing purpose only.",
            "paging_token": "EXAMPLE-GBK3CBEMYWZS5PDITD63CS5L5IB6BDTPGIJWLWCUZND2HZ6W3CARDMHI"
          }
        ]
      }
    }


## Advertising the service through `stellar.toml`

To inform clients about the service, it should be listed in `stellar.toml` file: 

```
ASSET_METADATA_SERVER="https://mydomain.com/"
...
```

Make sure that the URL contains a relative path if it was specified in the 
`RELATIVE_PATH` environment variable. 