


const Zips = require('./zips.json')
const Axios = require('axios')
const { checkAvailabilityNear } = require('./walgreensClient')

const { HOOK_URI, TEST_HITS } = process.env

const postToSlack = async payload => (await Axios.post(HOOK_URI, payload, { headers: { 'Content-Type': 'application/json' } })).data
const maybeParse = thing => {
  try {
    return [JSON.parse(thing), null]
  } catch (err) {
    return [undefined, err]
  }
}

const [TestHits] = maybeParse(TEST_HITS) || {}

const section = text => ({ type: 'section', text: { type: 'mrkdwn', text } })
const link = (text, uri) => `<${uri}|${text}>`

const handler = async () => await Promise.all(Zips.map(async ([city, zip]) => {
  const available = await checkAvailabilityNear({ zip, onlyAvailable: true })
  const postable = available.concat(TestHits[zip] || [])
  if (postable.length) {
    await postToSlack({
      blocks: [
        section(`<!channel> There are appointments near ${city}`),
        ...postable.map(({ zipCode, location }) => section(`At ${link('this location', location)} in zipcode ${zipCode}`))
      ]
    })
  }
  return [city, postable.length]
}))

const heartbeat = async () => await postToSlack({ blocks: [section('This is an assurance that the Walgreens checker is still online, even if it has been a while since any appointments were found. This message is posted every 6 hours to indicate "signs of life" on the system.')] })

module.exports = {
  handler,
  heartbeat
}
