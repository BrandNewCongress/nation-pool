const request = require('superagent')

module.exports = (slug, key, { endpoint, method, body, query }) => {
  const fullUrl = endpoint.includes('/api/v1')
    ? `https://${SLUG}.nationbuilder.com/${job.data.endpoint}`
    : endpoint.includes('admin')
      ? `https://${SLUG}.nationbuilder.com/${job.data.endpoint}`
      : `https://${SLUG}.nationbuilder.com/api/v1/${job.data.endpoint}`

  const params = Object.assign({access_token: key}, query)

  let req = request(method, fullUrl)
    .set('Accept', 'application/json')
    .query(params)

  if (body)
    req = req.send(body)

  req.end((err, res) => {
    if (err) return reject(err)

    if (!res) {
      const rateLimitReset = req.res.headers['x-ratelimit-reset']
      return reject({ rateLimitReset })
    }

    return resolve(res.body)
  })
}
