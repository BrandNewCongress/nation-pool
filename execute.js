const request = require('superagent')

module.exports = (slug, key, { endpoint, method, body, query }) => new Promise((resolve, reject) => {
  const fullUrl = endpoint.includes('/api/v1')
    ? `https://${slug}.nationbuilder.com/${endpoint}`
    : endpoint.includes('admin')
      ? `https://${slug}.nationbuilder.com/${endpoint}`
      : `https://${slug}.nationbuilder.com/api/v1/${endpoint}`

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
})
