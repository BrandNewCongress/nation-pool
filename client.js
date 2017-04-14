const execute = require('./execute')
const kue = require('kue')
const queue = process.env.REDIS_URL && kue.createQueue({
  redis: process.env.REDIS_URL
})

const e = {}

let core

if (!queue) {
  const SLUG = process.env.NATION_SLUG

  if (!SLUG) {
    console.log('Must have NATION_SLUG set')
    process.exit()
  }

  const KEY = process.env.NATION_KEY_1

  if (!KEY.length == 0) {
    console.log('Must have at least 1 NATION_KEY set')
    process.exit()
  }

  core = execute(SLUG, KEY, { endpoint, method, body, query })
} else {
  core = ({ method, query, body, priority, endpoint }) => new Promise((resolve, reject) => {
    const job = queue.createJob('request', { method, query, body, endpoint }).removeOnComplete(true)

    if (priority) {
      job.priority(priority)
    }

    job.attempts(5).on('complete', resolve).on('failed', reject)

    job.save(err => {
      if (err) reject(err)
    })
  })
}

e.get = (endpoint, params) =>
  core(Object.assign({ method: 'GET', endpoint }, params))

e.put = (endpoint, params) =>
  core(Object.assign({ method: 'PUT', endpoint }, params))

e.post = (endpoint, params) =>
  core(Object.assign({ method: 'POST', endpoint }, params))

module.exports = e
