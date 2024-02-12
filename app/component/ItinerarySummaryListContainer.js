import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import cx from 'classnames';
import startsWith from 'lodash/startsWith';
import { matchShape } from 'found';
import isEqual from 'lodash/isEqual';

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import moment from 'moment';
import Icon from './Icon';
import SummaryRow from './SummaryRow';
import { isBrowser } from '../util/browser';
import { getZones } from '../util/legUtils';
import CanceledItineraryToggler from './CanceledItineraryToggler';
import { itineraryHasCancelation } from '../util/alertUtils';
import { getCurrentSettings, getDefaultSettings } from '../util/planParamUtil';
import { ItinerarySummarySubtitle } from './ItinerarySummarySubtitle';
import Loading from './Loading';

// FITME!
import { compressLegs } from '../util/legUtils';
import { getFitMePOIs } from '../util/apiUtils';
import { setPoiPoints } from '../action/PoiPointActions';
import { getSources } from '../util/poiSourceUtils';
import { getTypes } from '../util/poiTypeUtils';
import { getCustomizedSettings } from '../store/localStorage';

const getViaPointIndex = (leg, intermediatePlaces) => {
  if (!leg || !Array.isArray(intermediatePlaces)) {
    return -1;
  }
  return intermediatePlaces.findIndex(
    place => place.lat === leg.from.lat && place.lon === leg.from.lon,
  );
};

const connectsFromViaPoint = (currLeg, intermediatePlaces) =>
  getViaPointIndex(currLeg, intermediatePlaces) > -1;

/*
// FITME! 
  arrays have waiting place candidates:
  {
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon
    index (active itinerary index)
  }
*/
const removeDuplicateCandidates = (candidates) => {
  const waitPlaces = [];
  candidates.forEach(wp=>{
    if (waitPlaces.length === 0) {
      waitPlaces.push(wp); // The first one is always OK (and added to array).
    } else {
      let isSame = false;
      waitPlaces.every(p=>{
        // if closer than 30 m and address is same => duplicate => don't use.
        //if (distance(p,wp) < 30 && p.address === wp.address && p.index === wp.index) {
        if (p.lat === wp.lat && p.lon === wp.lon && p.address === wp.address && p.index === wp.index) {
          isSame = true;
          return false; // break out from the loop.
        }
        return true; // continue with next p
      });
      if (!isSame) {
        waitPlaces.push(wp);
      }
    }
  });
  return waitPlaces;
};

const areTwoArraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  let isSame = true;
  a.every((pa,i) => {
    const pb = b[i];
    //if (pa.address !== pb.address || pa.waiting !== pb.waiting || distance(pa,pb) > 30 || pa.index !== pb.index) {
    if (pa.address !== pb.address || pa.waiting !== pb.waiting || pa.lat !== pb.lat || pa.lon !== pb.lon || pa.index !== pb.index) {
      isSame = false;
      return false; // break out from the loop.
    }
    return true; // continue with next pa
  });
  return isSame;
};
/*

defaultOptions.walkSpeed = array

Todo:

Q: How we get the user selected value of walkSpeed?
A: const settings = getCurrentSettings(config);
   console.log(['settings=',settings]);
   if (settings.walkSpeed) {
     console.log(['settings.walkSpeed=',settings.walkSpeed]);
   }

Example of POI object in JSON:
    {
        "name": "www.katipohjanmaa.fi",
        "type": "experience",
        "description": "",
       "address": {
            "street": "Timontie 4A",
            "city": "Espoo",
            "zipCode": "02180"
        },
        "geolocation": [
            "60.190395",
            "24.7590695"
        ],
        "contactInfo": {
            "email": "kati.pohjanmaa@gmail.com",
            "phone": "+358 400 402656"
        },
        "url": "https://www.katipohjanmaa.fi/english-kati/",
        "thumbnailsURls": [
            "https://cdn-datahub.visitfinland.com/images/ecfe7c80-5e48-11ec-958a-e368ec3fe4d5-LOW%20kati%20nassu.JPG?s=240",
        ],
        "waiting":"30"
    }
  We want to filter different types of POIs:
    1. accommodation
    2. attraction
    3. event
    4. experience
    5. rental_service
    6. restaurant
    7. shop
    8. venue
    9. transportation
*/
const createPOI = (data) => {
  /*
  For POI to be compatible with ViaPoint, put 
  locationSlack and address to "root-level" also.
  */
  //console.log(['createPOI data=',data]);
  //const waiting = typeof data.waiting === 'string' ? parseInt(data.waiting) : data.waiting;
  //const _locationSlack = waiting * 60; // in seconds
  const _locationSlack = 0; // in seconds
  const latF = typeof data.geolocation[0] === 'string' ? parseFloat(data.geolocation[0]) : data.geolocation[0];
  const lonF = typeof data.geolocation[1] === 'string' ? parseFloat(data.geolocation[1]) : data.geolocation[1];
  const index = typeof data.index === 'string' ? parseInt(data.index) : data.index;
  
  const poi = {
    lat: latF,
    lon: lonF,
    locationSlack: _locationSlack,
    address: data.address.street+', '+data.address.city,
    index: index,
    extra: {
      locationSlack: _locationSlack,
      name: data.name,
      type: data.type,
      source: data.source,
      address: data.address,
      contactInfo: data.contactInfo,
      url: data.url,
      thumbnailsURls: data.thumbnailsURls
    }
  };
  return poi;
}
// FITME!

function ItinerarySummaryListContainer(
  {
    activeIndex,
    currentTime,
    error,
    from,
    locationState,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    searchTime,
    to,
    bikeAndPublicItinerariesToShow,
    bikeAndParkItinerariesToShow,
    walking,
    biking,
    showAlternativePlan,
    separatorPosition,
    loadingMoreItineraries,
    loading,
    driving,
    onlyHasWalkingItineraries,
  },
  context,
) {
  const [showCancelled, setShowCancelled] = useState(false);
  const [waitingPlaces, setWaitingPlaces] = useState([]);
  //const { config, match } = context;
  // FITME! Add executeAction here => enable to access it?
  const { config, match, executeAction } = context;
  // FITME!
  if (!error && itineraries && itineraries.length > 0 && !itineraries.includes(undefined)) {
    // FITME!
    const waitingCandidates = [];
    
    //const waitThreshold = 600000; // 10 mins (10 x 60 x 1000 = 600 000) 
    //const waitThresholdCONST = 1800000; // EDIT: 30 mins (30 x 60 x 1000 = 1 800 000) 
    // TESTING!!!
    const { waitThreshold, maxRange } = getCustomizedSettings();
    //console.log('======  TESTING ============');
    //console.log(['waitThreshold=',waitThreshold,' maxRange=',maxRange]);
    //console.log('======  TESTING ============');
    // NOTE: CONVERT waitThreshold from minutes to milliseconds
    const waitThresholdMS = waitThreshold * 60 * 1000;
    
    itineraries.forEach((itinerary, iti_index) => {
      //if (i === activeIndex) {
      //console.log(['CHECK waiting place candidates for itinerary index=',iti_index]);
      // NOTE: We check waiting candidates ONLY to ACTIVE itinerary.
      // IF waiting place set has changed (it usually changes when itinerary is changed), 
      // then we fetch the list of POIs and store it to the PoiStore (setPoiPoints) => 
      // refresh is called to those components (emitChange) that are listening to PoiStore 
      // ONLY if new POIs are added or old POIs are removed from the PoiStore.
      //
      // NEW 20230504: 
      // Fetch POIs for ALL itineraries.
      // Added index to POI points in POIStore.
      // Filter them when map is displayed.
      //
      const compressedLegs = compressLegs(itinerary.legs).map(leg => ({
        ...leg,
      }));
      
      compressedLegs.forEach((leg, i) => {
        let waitTime;
        const nextLeg = compressedLegs[i + 1];
        //if (nextLeg && !nextLeg.intermediatePlace && !connectsFromViaPoint(nextLeg, intermediatePlaces)) {
        if (nextLeg) {
          waitTime = nextLeg.startTime - leg.endTime;
          //console.log(['waitTime=',waitTime]);
          if (waitTime >= waitThresholdMS) {
            if (!nextLeg?.interlineWithPreviousLeg) {
              const waitingTimeinMin = Math.floor(waitTime / 1000 / 60);
              //console.log(['waitingTimeinMin=',waitingTimeinMin,' leg=',leg]);
              const candi = {
                waiting:waitingTimeinMin,
                address:nextLeg.from.name, // or leg.to.name
                lat:nextLeg.from.lat, //  or leg.to.lat
                lon:nextLeg.from.lon, //  or leg.to.lon
                index: iti_index
              };
              waitingCandidates.push(candi);
            }
          }
        }
      });
    });
    // Remove duplicate locations from our list of candidates.
    const wPlaces = removeDuplicateCandidates(waitingCandidates);
    //console.log(['waitingCandidates=',waitingCandidates]);
    //console.log(['wPlaces=',wPlaces]);
    //console.log(['waitingPlaces=',waitingPlaces]);
    // Check if waitingPlaces array is the same as wPlaces array.
    if (!areTwoArraysEqual(waitingPlaces, wPlaces)) {
      // walkSpeed in m/s
      const settings = getCurrentSettings(config);
      let walkSpeed = 1.2;
      console.log(['settings=',settings]);
      if (settings.walkSpeed) {
        console.log(['settings.walkSpeed=',settings.walkSpeed]);
        walkSpeed = settings.walkSpeed;
      }
      setWaitingPlaces(wPlaces); // Set this as the new state in STATE.
      
      console.log(['wPlaces=',wPlaces,' intermediatePlaces=',intermediatePlaces]);
      const allpois = [];
      // Generate an API call and return with POI results => show on the map.
      if (wPlaces.length > 0) {
        console.log('========================== getFitMePOIs =================================');
        // getFitMePOIs(places, maxRange, walkSpeed) {
        getFitMePOIs(wPlaces, maxRange, walkSpeed)
          .then(res => {
            if (Array.isArray(res)) {
              console.log(['res=',res]);
              // returns an array of arrays!
              // 
              const flattened = res.flat();
              console.log(['flattened result array=',flattened]);
              const types = getTypes(config);
              const sources = getSources(config);
              console.log(['ItinerarySummaryListContainer types=',types,' sources=',sources]);
              // "ACCOMMODATION"
              // "EVENT"
              // "ATTRACTION"
              // "EXPERIENCE"
              // Here we can filter out types that are not included (see: Settings)
              // Also source (openstreetmap or datahub) can be used as filtering 
              if (types && Array.isArray(types) && types.length > 0 && sources && Array.isArray(sources) && sources.length > 0 ) {
                flattened.forEach(d=>{
                  if (d.type === 'accomodation') {
                    d.type = 'accommodation';
                  }
                  if (d.source === 'osm') {
                    d.source = 'openstreetmap';
                  }
                  const ucType = d.type ? d.type.toUpperCase() : 'UNKNOWN';
                  const ucSource = d.source ? d.source.toUpperCase() : 'UNKNOWN';
                  if (ucType==='UNKNOWN' || ucSource==='UNKNOWN') {
                    console.log('============================================');
                    console.log('    WARNING! POI type or source NOT KNOWN!  ');
                    console.log('============================================');
                  }
                  if (types.includes(ucType) && sources.includes(ucSource)) {
                    allpois.push(createPOI(d));
                  }
                });
              }
              context.executeAction(setPoiPoints, {poi:allpois, via:intermediatePlaces});
            }
          })
          .catch(err => {
            console.log(['err=',err]);
          })
          .finally(() => {
            //console.log('FINALLY OK!');
          });
      } else {
        context.executeAction(setPoiPoints, {poi:allpois, via:intermediatePlaces});
      }
    }
    // FITME!
    
    const summaries = itineraries.map((itinerary, i) => (
      <SummaryRow
        refTime={searchTime}
        key={i} // eslint-disable-line react/no-array-index-key
        hash={i}
        data={itinerary}
        passive={i !== activeIndex}
        currentTime={currentTime}
        onSelect={onSelect}
        onSelectImmediately={onSelectImmediately}
        intermediatePlaces={intermediatePlaces}
        isCancelled={itineraryHasCancelation(itinerary)}
        showCancelled={showCancelled}
        onlyHasWalkingItineraries={onlyHasWalkingItineraries}
        zones={
          config.zones.stops && itinerary.legs ? getZones(itinerary.legs) : []
        }
      />
    ));
    if (
      context.match.params.hash &&
      context.match.params.hash === 'bikeAndVehicle'
    ) {
      if (bikeAndParkItinerariesToShow > 0) {
        summaries.splice(
          0,
          0,
          <ItinerarySummarySubtitle
            translationId="itinerary-summary.bikePark-title"
            defaultMessage="Biking \u0026 public transport \u0026 walking"
            key="itinerary-summary.bikePark-title"
          />,
        );
      }
      if (
        itineraries.length > bikeAndParkItinerariesToShow &&
        bikeAndPublicItinerariesToShow > 0
      ) {
        const bikeAndPublicItineraries = itineraries.slice(
          bikeAndParkItinerariesToShow,
        );
        const filteredBikeAndPublicItineraries = bikeAndPublicItineraries.map(
          i =>
            i.legs.filter(obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE'),
        );
        const allModes = Array.from(
          new Set(
            filteredBikeAndPublicItineraries.length > 0
              ? filteredBikeAndPublicItineraries.map(p =>
                  p[0].mode.toLowerCase(),
                )
              : [],
          ),
        );
        summaries.splice(
          bikeAndParkItinerariesToShow ? bikeAndParkItinerariesToShow + 1 : 0,
          0,
          <ItinerarySummarySubtitle
            translationId={`itinerary-summary.bikeAndPublic-${allModes
              .sort()
              .join('-')}-title`}
            defaultMessage="Biking \u0026 public transport"
            key="itinerary-summary.bikeAndPublic-title"
          />,
        );
      }
    }
    if (separatorPosition) {
      summaries.splice(
        separatorPosition,
        0,
        <div
          className="summary-list-separator"
          key={`summary-list-separator-${separatorPosition}`}
        />,
      );
    }

    if (loading) {
      return null;
    }

    const canceledItinerariesCount = itineraries.filter(itineraryHasCancelation)
      .length;
    return (
      <>
        <div className="summary-list-container" role="list">
          {showAlternativePlan && (
            <div
              className={cx(
                'flex-horizontal',
                'summary-notification',
                'show-alternatives',
              )}
            >
              <Icon className="icon-icon_settings" img="icon-icon_settings" />
              <div>
                <FormattedMessage
                  id="no-route-showing-alternative-options"
                  defaultMessage="No routes with current settings found. Here are some alternative options:"
                />
              </div>
            </div>
          )}
          {loadingMoreItineraries === 'top' && (
            <div className="summary-list-spinner-container">
              <Loading />
            </div>
          )}
          {isBrowser && (
            <div
              className={cx('summary-list-items', {
                'summary-list-items-loading-top':
                  loadingMoreItineraries === 'top',
              })}
            >
              {summaries}
            </div>
          )}
          {loadingMoreItineraries === 'bottom' && (
            <div className="summary-list-spinner-container">
              <Loading />
            </div>
          )}
          {isBrowser && canceledItinerariesCount > 0 && (
            <CanceledItineraryToggler
              showItineraries={showCancelled}
              toggleShowCanceled={() => setShowCancelled(!showCancelled)}
              canceledItinerariesAmount={canceledItinerariesCount}
            />
          )}
        </div>
        {onlyHasWalkingItineraries && !showAlternativePlan && (
          <div className="summary-no-route-found" style={{ marginTop: 0 }}>
            <div
              className={cx('flex-horizontal', 'summary-notification', 'info')}
            >
              <Icon
                className={cx('no-route-icon', 'info')}
                img="icon-icon_info"
                color="#0074be"
              />
              <div>
                <FormattedMessage
                  id="walk-bike-itinerary-1"
                  defaultMessage="Unfortunately, only walking routes were found for your journey."
                />
              </div>
            </div>{' '}
          </div>
        )}
      </>
    );
  }
  if (!error) {
    if ((!from.lat || !from.lon) && (!to.lat || !to.lon)) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-start-end"
              defaultMessage="Please select origin and destination"
            />
          </div>
        </div>
      );
    }
    if (!from.lat || !from.lon) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-start"
              defaultMessage="Please select origin"
            />
          </div>
        </div>
      );
    }
    if (!to.lat || !to.lon) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-end"
              defaultMessage="Please select destination"
            />
          </div>
        </div>
      );
    }
  }

  let msgId;
  let outside;
  let iconType = 'caution';
  let iconImg = 'icon-icon_caution';
  const timeDifferenceDays = moment
    .duration(moment(searchTime).diff(moment()))
    .asDays();
  // If error starts with "Error" it's not a message id, it's an error message
  // from OTP
  if (error && !startsWith(error, 'Error')) {
    msgId = 'no-route-msg';
  } else if (!inside([from.lon, from.lat], config.areaPolygon)) {
    msgId = 'origin-outside-service';
    outside = true;
  } else if (!inside([to.lon, to.lat], config.areaPolygon)) {
    msgId = 'destination-outside-service';
    outside = true;
  } else if (distance(from, to) < config.minDistanceBetweenFromAndTo) { // 20 m
    iconType = 'info';
    iconImg = 'icon-icon_info';
    if (
      locationState &&
      locationState.hasLocation &&
      ((from.lat === locationState.lat && from.lon === locationState.lon) ||
        (to.lat === locationState.lat && to.lon === locationState.lon))
    ) {
      msgId = 'no-route-already-at-destination';
    } else if (to && from && from.lat === to.lat && from.lon === to.lon) {
      msgId = 'no-route-origin-same-as-destination';
    } else {
      msgId = 'no-route-origin-near-destination';
    }
  } else if (walking || biking || driving) {
    iconType = 'info';
    iconImg = 'icon-icon_info';
    const yesterday = currentTime - 24 * 60 * 60 * 1000;
    if (searchTime < yesterday) {
      msgId = 'itinerary-in-the-past';
    } else if (driving) {
      msgId = 'walk-bike-itinerary-4';
    } else if (walking && !biking) {
      msgId = 'walk-bike-itinerary-1';
    } else if (!walking && biking) {
      msgId = 'walk-bike-itinerary-2';
    } else {
      msgId = 'walk-bike-itinerary-3';
    }
    // Show different message if trip is >30 days in the future
    if (timeDifferenceDays > 30) {
      msgId = 'no-route-msg-time-threshold';
    }
  } else {
    const hasChanges = !isEqual(
      getCurrentSettings(config),
      getDefaultSettings(config),
    );
    if (timeDifferenceDays > 30) {
      iconType = 'info';
      iconImg = 'icon-icon_info';
      msgId = 'no-route-msg-time-threshold';
    } else if (hasChanges) {
      msgId = 'no-route-msg-with-changes';
    } else {
      msgId = 'no-route-msg';
    }
  }

  let linkPart = null;
  if (outside && config.nationalServiceLink) {
    linkPart = (
      <div>
        <FormattedMessage
          id="use-national-service-prefix"
          defaultMessage="You can also try the national service available at"
        />
        <a className="no-decoration" href={config.nationalServiceLink.href}>
          {config.nationalServiceLink.name}
        </a>
        <FormattedMessage id="use-national-service-postfix" defaultMessage="" />
      </div>
    );
  }

  let titlePart = null;
  if (msgId === 'itinerary-in-the-past') {
    titlePart = (
      <div className="in-the-past">
        <FormattedMessage id={`${msgId}-title`} defaultMessage="" />
      </div>
    );
    linkPart = (
      <div>
        <a
          className={cx('no-decoration', 'medium')}
          href={match.location.pathname}
        >
          <FormattedMessage id={`${msgId}-link`} defaultMessage="" />
        </a>
      </div>
    );
  }

  const background = iconImg.replace('icon-icon_', '');
  return (
    <div className="summary-list-container summary-no-route-found">
      <div
        className={cx('flex-horizontal', 'summary-notification', background)}
      >
        <Icon
          className={cx('no-route-icon', iconType)}
          img={iconImg}
          color={iconImg === 'icon-icon_info' ? '#0074be' : null}
        />
        <div>
          {titlePart}
          <FormattedMessage
            id={msgId}
            defaultMessage={
              'Unfortunately no routes were found for your journey. ' +
              'Please change your origin or destination address.'
            }
          />
          {linkPart}
        </div>
      </div>
    </div>
  );
}

const locationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

ItinerarySummaryListContainer.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string }),
  ]),
  from: locationShape.isRequired,
  intermediatePlaces: PropTypes.arrayOf(locationShape),
  itineraries: PropTypes.array,
  locationState: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  searchTime: PropTypes.number.isRequired,
  to: locationShape.isRequired,
  bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
  bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  driving: PropTypes.bool,
  showAlternativePlan: PropTypes.bool,
  separatorPosition: PropTypes.number,
  loadingMoreItineraries: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onlyHasWalkingItineraries: PropTypes.bool,
};

ItinerarySummaryListContainer.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
  walking: false,
  biking: false,
  showAlternativePlan: false,
  separatorPosition: undefined,
  loadingMoreItineraries: undefined,
};

ItinerarySummaryListContainer.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
  // FITME! Can I just add this here?
  // And then it is available here just like that?!?
  executeAction: PropTypes.func.isRequired
  // FITME!
};

const containerComponent = createFragmentContainer(
  ItinerarySummaryListContainer,
  {
    itineraries: graphql`
      fragment ItinerarySummaryListContainer_itineraries on Itinerary
      @relay(plural: true) {
        walkDistance
        startTime
        endTime
        legs {
          realTime
          realtimeState
          transitLeg
          startTime
          endTime
          mode
          distance
          duration
          rentedBike
          interlineWithPreviousLeg
          intermediatePlace
          intermediatePlaces {
            stop {
              zoneId
            }
          }
          route {
            mode
            shortName
            type
            color
            agency {
              name
            }
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              trip {
                pattern {
                  code
                }
              }
            }
          }
          trip {
            pattern {
              code
            }
            stoptimes {
              realtimeState
              stop {
                gtfsId
              }
              pickupType
            }
          }
          from {
            name
            lat
            lon
            stop {
              gtfsId
              zoneId
              platformCode
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
              }
            }
            bikeRentalStation {
              bikesAvailable
              networks
            }
          }
          to {
            stop {
              gtfsId
              zoneId
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
              }
            }
            bikePark {
              bikeParkId
              name
            }
            carPark {
              carParkId
              name
            }
          }
        }
      }
    `,
  },
);

export {
  containerComponent as default,
  ItinerarySummaryListContainer as Component,
};
