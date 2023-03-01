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
/*
params is an array of
  { 
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon
  }
*/
const createFitMeFoo = (p, latdiff, londiff) => {
  const _lat = p.lat + latdiff; // + 0.000003 * Math.random();
  const _lon = p.lon + londiff;
  //const _address = p.address;
  const _locationSlack = p.waiting*60; // in seconds
  
  const testPOI = {
    name: "EMMA – Espoo Museum of Modern Art",
    type: "attraction",
    description: "Lorem ipsum...",
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
  
  const pos = {
    lat: _lat,
    lon: _lon,
    locationSlack: _locationSlack,
    attribs: {
      name: testPOI.name,
      type: testPOI.type,
      address: testPOI.address,
      contactInfo: testPOI.contactInfo,
      thumbnailsURls: testPOI.thumbnailsURls
    }
  };
  return pos;
}

export function getPOIs(params) {
  // use params when real API call is made.
  return new Promise(function(resolve) {
    const foo = [];
    params.forEach(p=>{
      // For testing purposes create 4 points around given intermediate point.
      foo.push(createFitMeFoo(p, 0.01, 0.01));
      foo.push(createFitMeFoo(p, -0.01, 0.01));
      foo.push(createFitMeFoo(p, -0.01, -0.01));
      foo.push(createFitMeFoo(p, 0.01, -0.01));
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
    resolve(foo);
  });
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
