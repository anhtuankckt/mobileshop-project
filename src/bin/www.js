const app = require('../apps/app')
const config = require('config')

const port = config.get('app.port')

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
