import moment from 'moment';
import xmlParser from 'fast-xml-parser';
import isEmpty from 'lodash/isEmpty';
import { retryFetch } from './fetchUtils';

export function getUser() {
  const options = {
    credentials: 'include',
  };
  return retryFetch('/api/user', options, 2, 200).then(res => res.json());
}

export function getFavourites() {
  return retryFetch('/api/user/favourites', {}, 2, 200).then(res => res.json());
}

export function updateFavourites(data) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', options, 0, 0).then(res =>
    res.json(),
  );
}

export function deleteFavourites(data) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', options, 0, 0).then(res =>
    res.json(),
  );
}

const createFitMeFoo = (p, latdiff, londiff) => {
  //const _lat = p.lat + latdiff; // + 0.000003 * Math.random();
  //const _lon = p.lon + londiff;
  //const _address = p.address;
  const _locationSlack = p.waiting*60; // in seconds
  
  
  /*
  const testPOI = {
    name: "EMMA – Espoo Museum of Modern Art",
    type: "attraction",
    description: "",
    address: {
      street: "Ahertajantie 5",
      city: "Espoo",
      zipCode: "02100"
    },
    geolocation: [
      60.1787, // lat
      24.79478 // lon
    ],
    contactInfo: {
      email: "info@emmamuseum.fi",
      phone: "0438270941"
    },
    url: "https://emmamuseum.fi/en/",
    thumbnailsURls: [
      "https://cdn-datahub.visitfinland.com/images/58e501e0-d35b-11eb-a8b5-0d99be0b7375-EMMA_Espoo%20museum%20of%20modern%20art_web.jpg?s=240",
      "https://cdn-datahub.visitfinland.com/images/f1bac2e0-d35d-11eb-a8b5-0d99be0b7375-Bryk%20Wirkkala%20Visible%20Storage_3.jpg?s=240",
      "https://cdn-datahub.visitfinland.com/images/17b1bc50-d35f-11eb-a8b5-0d99be0b7375-EMMA_%20Espoo%20Museum%20of%20Modern%20Art.jpg?s=240"
    ]
  };
  */
  const testPOI = {
    name: "EMMA – Espoo Museum of Modern Art",
    type: "attraction",
    description: "",
    address: {
      street: "Leppävaara",
      city: "Espoo",
      zipCode: "02600"
    },
    geolocation: [
      60.219235,
      24.81329
    ],
    contactInfo: {
      email: "info@emmamuseum.fi",
      phone: "0438270941"
    },
    url: "https://emmamuseum.fi/en/",
    thumbnailsURls: [
      "https://cdn-datahub.visitfinland.com/images/58e501e0-d35b-11eb-a8b5-0d99be0b7375-EMMA_Espoo%20museum%20of%20modern%20art_web.jpg?s=240",
      "https://cdn-datahub.visitfinland.com/images/f1bac2e0-d35d-11eb-a8b5-0d99be0b7375-Bryk%20Wirkkala%20Visible%20Storage_3.jpg?s=240",
      "https://cdn-datahub.visitfinland.com/images/17b1bc50-d35f-11eb-a8b5-0d99be0b7375-EMMA_%20Espoo%20Museum%20of%20Modern%20Art.jpg?s=240"
    ]
  };
  
  
  /*
  For POI to be compatible with ViaPoint, put 
  locationSlack and address to "root-level" also.
  */
  const pos = {
    //lat: _lat,
    //lon: _lon,
    lat: testPOI.geolocation[0],
    lon: testPOI.geolocation[1],
    locationSlack: _locationSlack,
    address: testPOI.address.street+', '+testPOI.address.city,
    extra: {
      locationSlack: _locationSlack,
      name: testPOI.name,
      type: testPOI.type,
      address: testPOI.address,
      contactInfo: testPOI.contactInfo,
      url: testPOI.url,
      thumbnailsURls: testPOI.thumbnailsURls
    }
  };
  return pos;
}
/*
params is an array of
  { 
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon
  }
*/
export function getPOIs(params) {
  // use params when real API call is made.
  return new Promise(function(resolve) {
    const foo = [];
    params.forEach(p=>{
      // For testing purposes create one point in 1 km distance to north-east
      // for each intermediate point (which has waiting time for more than 3 minutes).
      // 0.01 = 1km
      foo.push(createFitMeFoo(p, 0.01, 0.01));
      //foo.push(createFitMeFoo(p, -0.01, 0.01));
      //foo.push(createFitMeFoo(p, -0.01, -0.01));
      //foo.push(createFitMeFoo(p, 0.01, -0.01));
    });
    /*
    const foo = [
      {
        lat: 60.217992,
        lon: 24.75494,
        address: 'Kera, Espoo'
      },
      {
        lat: 60.219235,
        lon: 24.81329,
        address: 'Leppävaara, Espoo'
      },
      {
        lat: 60.156843,
        lon: 24.956721,
        address: 'Kaivopuisto, Helsinki'
      }
    ];
    */
    setTimeout(() => {
      resolve(foo);
    },500);
  });
}
/*
// Tries to fetch 1 + retryCount times until 200 is returned.
// Uses retryDelay (ms) between requests. url and options are normal fetch parameters
retryFetch(URL, options = {}, retryCount, retryDelay, config = {})
  retryFetch(
  'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
  {}, 
  2, 
  200).then(res => res.json());
*/

export function getFitMePOITest() {
  return retryFetch(
    'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
    {},
    2,
    200).then(res => res.json());
}

export function getWeatherData(baseURL, time, lat, lon) {
  // Round time to next 5 minutes
  const remainder = 5 - (time.minute() % 5);
  const endtime = time
    .add(remainder, 'minutes')
    .seconds(0)
    .milliseconds(0)
    .toISOString();
  const searchTime = moment.utc(endtime).format();
  return retryFetch(
    `${baseURL}&latlon=${lat},${lon}&starttime=${searchTime}&endtime=${searchTime}`,
    {},
    2,
    200,
  )
    .then(res => res.text())
    .then(str => {
      const options = {
        ignoreAttributes: true,
        ignoreNameSpace: true,
      };
      return xmlParser.parse(str, options);
    })
    .then(json => {
      const data = json.FeatureCollection.member.map(elem => elem.BsWfsElement);
      return data;
    })
    .catch(err => {
      throw new Error(`Error fetching weather data: ${err}`);
    });
}

export function getRefPoint(origin, destination, location) {
  if (!isEmpty(origin)) {
    return origin;
  }
  if (!isEmpty(destination)) {
    return destination;
  }
  if (location && location.hasLocation) {
    return location;
  }
  return null;
}
