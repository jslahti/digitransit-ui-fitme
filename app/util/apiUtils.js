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
  
  http://datahub.northeurope.cloudapp.azure.com:4000/match?
  http://datahub.northeurope.cloudapp.azure.com:4000/match?lat=60.189272&lon=24.771822&range=3000
  https://datahub.northeurope.cloudapp.azure.com:4000/match?lat=60.189272&lon=24.771822&range=3000&waiting=30
  lat=60.189272
  &lon=24.771822
  &range=3000
  
  each call results as an array of objects
  [ {...},{...},{...} ]
  We must create an "union" of the responses.
  before storing:
  context.executeAction(setPoiPoints, res);
*/
export function getFitMePOIs(places) {
  // places is an array of waiting places.
  return new Promise(function(resolve) {
    const promises = [];
    places.forEach(wp=>{
      const waiting = wp.waiting;
      const range = waiting * 100; // each waiting minute gives 100 metres of range.
      const queryUrl = 'https://datahub.northeurope.cloudapp.azure.com/match?'+
        'lat='+wp.lat+
        '&lon='+wp.lon+
        '&range='+range+
        '&waiting='+waiting;
      const p = retryFetch(
        queryUrl,
        {},
        2,
        200);
      promises.push(p);
    });
    const nested=[];
    Promise.all(promises).then(res => {
      res.forEach(r=>{
        nested.push(r.json());
      });
      Promise.all(nested).then(data=>{
        console.log(['getFitMePOIs all data=',data]);
        // Check where we want to do the JSON => POI mapping?
        // Here or in ItinerarySummaryListContainer.js?
        // returns an array of arrays!
        // 
        // const flattened = data.flat();
        //console.log(['flattened result array=',flattened]);
        
        resolve(data);
      });
    });
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
        console.log(['getFitMePOITest data=',data]);
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
