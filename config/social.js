const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env
const { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET } = process.env

module.exports = {
  google: {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET
  },
  facebook: {
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET
  }
}