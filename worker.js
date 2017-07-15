const execute = require('./execute')
const kue = require('kue')
const queue = process.env.REDIS_URL && kue.createQueue({
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
    // Fetch next api key to use
    nextKey()
    .then(({key, idx}) => {
      // Execute request with that key
      execute(SLUG, key, job.data)
      .then(body => done(null, body))
      .catch(err => {
        // Modify API_KEYS delay
        if (err.rateLimitReset) {
          API_KEYS[idx].delay = (err.rateLimitReset - new Date().getTime()/1000|0) * 1000
          return done('Rate Limit')
        }

        // Respond with unknown error
        return done(err)
      })
    })
    .catch(console.error)
  })
}

const stop = () => {
  queue.shutdown(100, err => {
    console.log(`Shutdown ${err && `with ${err}`}`)
  })
}

module.exports = { start, stop }

if (require.main == module) {
  start()
}
