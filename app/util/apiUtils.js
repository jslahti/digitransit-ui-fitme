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

export function getFitMeClusters() {
  return new Promise(function(resolve) {
    const promises = [];
    const mock_data = [
      {
        title:"Nauvo",
        /*via: [
          {address:"Saaristotie 4529",city:"Nauvo",locationSlack:1200,lat:60.192561829564454,lon:21.910686096477846},
          {address:"Rantapolku 5",city:"Nauvo",locationSlack:1200,lat:60.1937562468021,lon:21.911866146996186},
          {address:"Nauvonranta 2",city:"Nauvo",locationSlack:1200,lat:60.194092221310825,lon:21.910964469558074},
          {address:"Saaristotie 4549",city:"Nauvo",locationSlack:1200,lat:60.19300985237414,lon:21.907027827268365}
        ]*/
        via: [
          {address:"Puistotie 1",city:"Nauvo",locationSlack:3600,lat:60.1928706,lon:21.909745644227602},
          {address:"Pappilanpolku 3",city:"Nauvo",locationSlack:3600,lat:60.1944552,lon:21.9090438},
        ]
      },
      {
        title:"Taideluontopolku ja viihtyisää bistrotunnelmaa",
        via: [
          {address:"Österretaisintie 45",city:"Korpo",locationSlack:3600,lat:60.17433847992975,lon:21.666155023123952},
          {address:"Österretaisintie 120",city:"Pargas",locationSlack:3600,lat:60.1754966,lon:21.676705},
        ]
      }
    ];
    const options = {
      method: 'GET',
      headers: {
        'x-container': 'clusterdemo_r6bna6yo'
      }
    };
    // Old: 'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
    // New: 'https://prod-api.zoneatlas.com/collections'
    const p = retryFetch(
      'https://prod-api.zoneatlas.com/collections',
      options,
      //'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
      //{},
      2,
      200);
    promises.push(p);
    const nested=[];
    Promise.all(promises).then(res => {
      res.forEach(r=>{
        nested.push(r.json());
      });
      Promise.all(nested).then(data=>{
        console.log(['getFitMeClusters data=',data]);
        resolve(mock_data);
      });
    });
  });
}

/*
params is an array of
  { 
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon.
    index
  }
  
  http://datahub.northeurope.cloudapp.azure.com:4000/match?
  http://datahub.northeurope.cloudapp.azure.com:4000/match?lat=60.189272&lon=24.771822&range=3000
  https://datahub.northeurope.cloudapp.azure.com/match?lat=60.189272&lon=24.771822&range=3000&index=0
  
  each call results as an array of objects
  [ {...},{...},{...} ]
  We must create an "union" of the responses.
  before storing:
  context.executeAction(setPoiPoints, res);
*/
export function getFitMePOIs(places, maxRange, walkSpeed) {
  // places is an array of waiting places.
  // maxRange is a param now in settings.
  //const maxRange = 1000;
  //const walkSpeed = 1.2;
  // walkSpeed: [0.69, 0.97, 1.2, 1.67, 2.22], m/s
  // waiting is minutes => change speed to metres/minute
  return new Promise(function(resolve) {
    const promises = [];
    places.forEach(wp=>{
      const index = wp.index;
      const waiting = wp.waiting;
      // multiply with 30 (not 60), because we need to go there and come back.
      let range = Math.round(waiting * walkSpeed*30);
      if (range > maxRange) {
        range = maxRange;
      }
      const queryUrl = 'https://datahub.northeurope.cloudapp.azure.com/match?'+
        'lat='+wp.lat+
        '&lon='+wp.lon+
        '&range='+range+
        '&index='+index;
      const p = retryFetch(
        queryUrl,
        {},
        2,
        1000);
      promises.push(p);
    });
    const nested=[];
    Promise.all(promises).then(res => {
      res.forEach(r=>{
        const ressu = r.json();
        //console.log('%%%%%%%%%%%%%%%%%%');
        //console.log(['ressu=',ressu]);
        //console.log('%%%%%%%%%%%%%%%%%%');
        nested.push(ressu);
      });
      Promise.all(nested).then(data=>{
        //console.log('????????????????????????');
        //console.log(['getFitMePOIs all data=',data]);
        //console.log('????????????????????????');
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
        //console.log(['getFitMePOITest data=',data]);
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
