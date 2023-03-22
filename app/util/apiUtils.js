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
  accommodation
  attraction
  event
  experience
  rental_service
  restaurant
  shop
  venue
*/
const createFitMeOne = () => {
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
  return testPOI;
}

const createFitMeTwo = () => {
  const testPOI = {
    name: "Sello",
    type: "shop",
    description: "",
    address: {
      street: "Leppävaarankatu 12",
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
  return testPOI;
}

const createFitMeThree = () => {
  const testPOI = {
    name: "Nokia Campus",
    type: "event",
    description: "",
    address: {
      street: "Karaportti 2",
      city: "Espoo",
      zipCode: "02610"
    },
    geolocation: [
      60.224518,
      24.759383
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
  return testPOI;
}

const createPOI = (data, p) => {
  /*
  For POI to be compatible with ViaPoint, put 
  locationSlack and address to "root-level" also.
  */
  const _locationSlack = p.waiting*60; // in seconds
  const poi = {
    lat: data.geolocation[0],
    lon: data.geolocation[1],
    locationSlack: _locationSlack,
    address: data.address.street+', '+data.address.city,
    extra: {
      locationSlack: _locationSlack,
      name: data.name,
      type: data.type,
      address: data.address,
      contactInfo: data.contactInfo,
      url: data.url,
      thumbnailsURls: data.thumbnailsURls
    }
  };
  return poi;
}
/*
params is an array of
  { 
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon
  }
  
  
  http://datahub.northeurope.cloudapp.azure.com:4000/match?
  
  
  lat=60.189272
  &lon=24.771822
  &range=3000
  
  
  each call results as an array of objects
  [ {...},{...},{...} ]
  We must create an "union" of the responses.
  before storing:
  context.executeAction(setPoiPoints, res);
  
*/
export function getPOIs(params) {
  // use params when real API call is made.
  return new Promise(function(resolve) {
    const foo = [];
    params.forEach((p,i)=>{
      if (i===0) {
        const data = createFitMeOne();
        foo.push(createPOI(data, p));
        
      } else if (i===1) {
        const data = createFitMeTwo();
        foo.push(createPOI(data, p));
        
      } else if (i===2) {
        const data = createFitMeThree();
        foo.push(createPOI(data, p));
        
      } else {
        console.log(['apiUtils NO MORE POIs i=',i]);
      }
    });
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
export function getFitMePOITest(count) {
  
  return new Promise(function(resolve) {
    
    const promises = [];
    for (let i=0; i<count; i++) {
      const p = retryFetch(
        'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
        {},
        2,
        200);
      promises.push(p);
    }
    const nested=[];
    Promise.all(promises).then(res => {
      res.forEach(r=>{
        nested.push(r.json());
      });
      Promise.all(nested).then(data=>{
        console.log(['apiUtils data=',data]);
        resolve(data);
      });
    });
  });
}
/*
export function getFitMePOITest() {
  return retryFetch(
    'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
    {},
    2,
    200).then(res => res.json());
}
*/
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
