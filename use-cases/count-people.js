const client = require('../client')

client.get('people/count', { query: { sex: 'M' } }) // this doesn't work
.then(console.log).catch(console.error)
