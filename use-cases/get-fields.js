const client = require('../client')
const toCamelCase = require('to-camel-case')

const limit = 200
const fields = {}

console.log('getting people')

const pool = []

client
.get('people', { query: { limit }})
.then(({results}) => {
  results.forEach(p => {
    Object.keys(p).forEach(field => {
      if (p[field]) {
        fields[toCamelCase(field)] = typeof p[field]
      } else {
        if (!fields[toCamelCase(field)]) {
          fields[toCamelCase(field)] = 'Unknown'
        }
      }
    })
  })

  Object.keys(fields).forEach(f => {
    console.log(`${fields[f]}: ${f}`)
  })
})
.catch(console.error)
