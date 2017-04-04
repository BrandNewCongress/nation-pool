const client = require('./client')

const limit = 10

const go = async (next) => {
  try {
    let page = await client.get('people', {
      query: { limit }
    })
    let { results, next } = page

    while (next) {
      results.forEach(p => {
        client.put(`people/${p.id}/taggings`, {
          body: { tagging: {tag: `Source: ${p.source}`} },
        })
        .then(res => {
          console.log(`Did ${p.id}`)
        })
        .catch(console.error)
      })

      page = await client.get(next, {
        query: { limit }
      })
      console.log('Fetched next page')

      results = page.results
      next = page.next
    }

    console.log('Done queueing!')
  } catch (err) {
    console.log('error!')
    console.error(err)
  }
}

go()
