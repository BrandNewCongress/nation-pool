const request = require('superagent')
const kue = require('kue')
const queue = kue.createQueue({
  redis: process.env.REDIS_URL
})

const start = () => {
  const SLUG = process.env.NATION_SLUG

  if (!SLUG) {
    console.log('Must have NATION_SLUG set')
    process.exit()
  }

  const API_KEYS = []

  let numKeys = 1
  let key = true

  while (key) {
    key = process.env[`NATION_KEY_${numKeys}`]

    if (key) {
      API_KEYS.push({
        key,
        delay: 0
      })
    }

    numKeys++
  }

  if (API_KEYS.length == 0) {
    console.log('Must have at least 1 NATION_KEY set')
    process.exit()
  }

  console.log(`Worker running for ${SLUG} with ${API_KEYS.length} api keys`)

  let idx = 0
  const nextKey = () => new Promise((resolve, reject) => {
    const currentKey = API_KEYS[idx]
    if (currentKey.delay !== 0) {
      setTimeout(() => {
        resolve({ key: currentKey.key, idx })
        currentKey.delay = 0
      }, currentKey.delay)
      idx = (idx + 1) % (API_KEYS.length - 1)
    } else {
      resolve({ key: currentKey.key, idx })
      idx = (idx + 1) % (API_KEYS.length - 1)
    }
  })


  queue.process('request', API_KEYS.length / 2, (job, done) => {
    const { method, query, body } = job.data

    const endpoint = job.data.endpoint.includes('/api/v1')
      ? `https://${SLUG}.nationbuilder.com/${job.data.endpoint}`
      : `https://${SLUG}.nationbuilder.com/api/v1/${job.data.endpoint}`

    nextKey()
    .then(({key, idx}) => {
      const params = Object.assign({access_token: key}, query)

      let req = request(method, endpoint)
        .set('Accept', 'application/json')
        .query(params)

      if (body) {
        req = req.send(body)
      }

      req.end((err, res) => {
        if (err) {
          console.log('hi')
          done(new Error(JSON.stringify(err)))
        }

        if (!res) {
          const goodAt = req.res.headers['x-ratelimit-reset']
          API_KEYS[idx].delay = (goodAt - new Date().getTime()/1000|0) * 1000
          return done('Rate Limit')
        }

        done(null, res.body)
      })
    })
    .catch(console.error)
  })
}

module.exports = { start }
