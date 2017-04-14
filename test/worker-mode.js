const worker = require('../worker')
worker.start()

const client = require('../client')
client.attemptWorker()

const expect = require('chai').expect

describe('client should fetch people - worker', () => {
  let next

  it('should return json', done => {
    client.get('people').then(response => {
      next = response.next
      expect(response).to.be.an.object
      expect(response.results).to.be.an.array
      done()
    })
    .catch(done)
  })

  it('should handle next style links', done => {
    client.get(next).then(response => {
      expect(response).to.be.an.object
      expect(response.results).to.be.an.array
      done()
    })
    .catch(done)
  })
})
