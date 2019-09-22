require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const qs = require('querystring')
const jwt = require('jsonwebtoken')
const ACCESSTOKENURL = 'https://www.googleapis.com/oauth2/v4/token'
const SCOPES = [ 
  "https://www.googleapis.com/auth/documents"
]

let docid = process.argv[2]
let filename = process.argv[3] || `${docid}.json`

console.log(`Fetching ${docid} ...`)

get(docid).then((doc) => {
  fs.writeFileSync(filename, JSON.stringify(doc, null, 2))
  console.log(`Saved to ${filename}`)
})


// Env Variables:
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_EMAIL
// GOOGLE_PRIVATE_KEY

// Scopes:
// https://www.googleapis.com/auth/drive
// https://www.googleapis.com/auth/documents
// https://www.googleapis.com/auth/spreadsheets

// Google OAuth2 Service Account Documentation:
// https://developers.google.com/identity/protocols/OAuth2ServiceAccount

// {"alg":"RS256","typ":"JWT"}

// {
//   "iss":"supersheets@sheets-239620.iam.gserviceaccount.com",
//   "scope":"https://www.googleapis.com/auth/documents,https://www.googleapis.com/auth/drive",
//   "aud":,
//   "exp":1328554385, // The expiration time of the assertion, specified as seconds since 00:00:00 UTC, January 1, 1970. This value has a maximum of 1 hour after the issued time.
//   "iat":1328550785  // The time the assertion was issued, specified as seconds since 00:00:00 UTC, January 1, 1970.
// }

async function get(docid) {
  let token = await accesstoken({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
  })
  let url = `https://docs.googleapis.com/v1/documents/${docid}`
  return (await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })).data
}

function encodeRequestToken(options) {
  options = options || { }
  let header = {
    "alg":"RS256",
    "typ":"JWT"
  }
  let epoch = Math.floor(Date.now() / 1000)
  let claims = {
    iss: options.GOOGLE_CLIENT_EMAIL,
    scope: SCOPES.join(' '),
    aud: "https://www.googleapis.com/oauth2/v4/token",
    iat: epoch,
    exp: epoch + 60 * 60  // 1 hr 
  }
  let token = jwt.sign(claims, options.GOOGLE_PRIVATE_KEY, { algorithm: 'RS256', header })
  return token
}

async function requestAccessToken(token) {
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  let body = {
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: token
  }
  let res = await axios.post(ACCESSTOKENURL, qs.stringify(body), headers)
  return res.data
}

async function accesstoken(options) {
  options = options || { }
  let token = encodeRequestToken(options)
  return (await requestAccessToken(token)).access_token
}
