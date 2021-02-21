const Axios = require('axios')

const ORIGIN = 'https://www.walgreens.com'
const AVAILABILITY_ENDPOINT = `${ORIGIN}/hcschedulersvc/svc/v1/immunizationLocations/availability`
const STORE_ENDPOINT = `${ORIGIN}/locator/v1/stores/search?requestor=search`

const getAvailability = async ({
  latitude,
  longitude,
  startDateTime=new Date().toISOString().slice(0, 10),
  location=ORIGIN
}) => ({
  ...(await Axios.post(AVAILABILITY_ENDPOINT, {
    serviceId: '99',
    position: { latitude, longitude },
    appointmentAvailability: { startDateTime },
    radius: 25
  })).data,
  location
})

const getStores = async ({
  zip='78701'
}) => (await Axios.post(STORE_ENDPOINT, {
  r: '5000',
  requestType: 'dotcom',
  s: '1000',
  p: 1,
  q: zip,
  lat: '',
  lng: '',
  zip
})).data.results

const toFloatingPointPosition = ({ latitude, longitude, storeSeoUrl }) => ({ latitude: parseFloat(latitude), longitude: parseFloat(longitude), location: `${ORIGIN}${storeSeoUrl}` })

const checkAvailabilityNear = async ({ zip, onlyAvailable }) => (await Promise.all((await getStores({ zip })).map(toFloatingPointPosition).map(getAvailability))).filter(hit => !onlyAvailable || hit.appointmentsAvailable)

module.exports = {
  getAvailability,
  getStores,
  checkAvailabilityNear
}

if (!module.parent) {
  const [zip, onlyAvailable] = process.argv.slice(2)
  checkAvailabilityNear({ zip, onlyAvailable }).then(console.log)
}
