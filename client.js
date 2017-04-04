const kue = require('kue')
const queue = kue.createQueue({
  redis: process.env.REDIS_URL
})

const e = {}

const core = ({ method, query, body, priority, endpoint }) => new Promise((resolve, reject) => {
  const job = queue.createJob('request', { method, query, body, endpoint }).removeOnComplete(true)

  if (priority) {
    job.priority(priority)
  }

  job.attempts(5).on('complete', resolve).on('failed', reject)

  job.save(err => {
    if (err) reject(err)
  })
})

e.get = (endpoint, params) =>
  core(Object.assign({ method: 'GET', endpoint }, params))

e.put = (endpoint, params) =>
  core(Object.assign({ method: 'PUT', endpoint }, params))

e.post = (endpoint, params) =>
  core(Object.assign({ method: 'POST', endpoint }, params))

module.exports = e
