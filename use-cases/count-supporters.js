const client = require('../client')

const params = { query: { limit: 100 } }

const getSupporterCount = async (url, total) => {
  console.log(`Requesting ${url}`)

  const { results, next } = await client.get(url, params)
  console.log(`Got page ${results.length}`)

  if (!next) {
    return total + results.length
  } else {
    console.log(`Have ${total}`)
    return getSupporterCount(next, total + results.length)
  }
}

console.time('count')

getSupporterCount('tags/Supporter/people', 0)
  .then(count => {
    console.log(count)
    console.timeEnd('count')
  })
  .catch(console.error)
