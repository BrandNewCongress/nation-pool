# nation-pool
Client and worker for a Redis `kue` backed NationBuilder autolimiting request pool

# Module Status

Load balances across API keys but gets tripped up if they all timeout at once

# Usage

Make sure environment variables `NATION_SLUG`, `REDIS_URL`, and at least `NATION_KEY_1` are
set. To add additional API keys, add `NATION_KEY_2`, `NATION_KEY_3`, etc.
Consecutive integers!


## Worker

```javascript
const nationWorker = require('nation-pool').worker
nationWorker.start()
```

## Client

```javascript
const client = require('nation-pool').client

/* client.get, client.post, client.put
   each return a promise and take the same options */

client.get('people', {
  query: { limit: 20 }, // URL parameters
  body: { },            // body is ignored for .get
  priority: 'medium',   // passed directly to `kue`
})
.then(responseBody => {
  const { results, next, prev } = responseBody
  // do things
})
```

Note that the Promise may resolve in a longer time than it typically
takes to make a Nationbuilder request because the worker is scheduling
your request to avoid rate limit problems!



