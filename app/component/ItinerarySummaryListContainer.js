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
import { getPOIs } from '../util/apiUtils';
import { getFitMePOITest } from '../util/apiUtils';
import { setPoiPoints } from '../action/PoiPointActions';

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
  arrays have POI candidates:
  {
    waiting:waitingTimeinMin,
    address:leg.from.name,
    lat:leg.from.lat,
    lon:leg.from.lon
  }
*/
const removeDuplicateCandidates = (candidates) => {
  const poiPlaces = [];
  candidates.forEach(poi=>{
    if (poiPlaces.length === 0) {
      poiPlaces.push(poi); // The first one is always OK (and added to array).
    } else {
      let isSame = false;
      poiPlaces.every(p=>{
        // if closer than 30 m and address is same => duplicate => don't use.
        if (distance(p,poi) < 30 && p.address === poi.address) {
          isSame = true;
          return false; // break out from the loop.
        }
        return true; // continue with next p
      });
      if (!isSame) {
        poiPlaces.push(poi);
      }
    }
  });
  return poiPlaces;
};

const areTwoArraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  let isSame = true;
  a.every((pa,i) => {
    const pb = b[i];
    if (pa.address !== pb.address || pa.waiting !== pb.waiting || distance(pa,pb) > 30) {
      isSame = false;
      return false; // break out from the loop.
    }
    return true; // continue with next pa
  });
  return isSame;
};
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
  const [previousPOIPlaces, setpreviousPOIPlaces] = useState([]);
  //const { config, match } = context;
  // FITME! Add executeAction here => enable to access it?
  const { config, match, executeAction } = context;
  // FITME!
  if (!error && itineraries && itineraries.length > 0 && !itineraries.includes(undefined)) {
    // FITME!
    const poiPlaceCandidates = [];
    
    const waitThreshold = 180000; // 3 mins (3 x 60 x 1000 = 180 000) 
    itineraries.forEach((itinerary, i) => {
      if (i === activeIndex) {
        const compressedLegs = compressLegs(itinerary.legs).map(leg => ({
          ...leg,
        }));
        //console.log(['CHECK POI Candidates for itinerary index=',activeIndex]);
        compressedLegs.forEach((leg, i) => {
          let waitTime;
          const nextLeg = compressedLegs[i + 1];
          if (nextLeg && !nextLeg.intermediatePlace && !connectsFromViaPoint(nextLeg, intermediatePlaces)) {
            // don't show waiting in intermediate places
            waitTime = nextLeg.startTime - leg.endTime;
            //console.log(['waitTime=',waitTime]);
            if (waitTime > waitThreshold) {
              if (!nextLeg?.interlineWithPreviousLeg) {
                const waitingTimeinMin = Math.floor(waitTime / 1000 / 60);
                //console.log(['waitingTimeinMin=',waitingTimeinMin,' leg=',leg]);
                const poi = {
                  waiting:waitingTimeinMin,
                  address:leg.from.name,
                  lat:leg.from.lat,
                  lon:leg.from.lon
                };
                poiPlaceCandidates.push(poi);
              }
            }
          }
        });
        // Remove duplicate locations from our list of POI candidates.
        const poiPlaces = removeDuplicateCandidates(poiPlaceCandidates);
        //console.log(['poiPlaceCandidates=',poiPlaceCandidates]);
        //console.log(['poiPlaces=',poiPlaces]);
        //console.log(['previousPOIPlaces=',previousPOIPlaces]);
        // Check if previousPOIPlaces array is the same as poiPlaces array.
        if (!areTwoArraysEqual(previousPOIPlaces, poiPlaces)) {
          setpreviousPOIPlaces(poiPlaces); // Set this as the new "previous" in STATE.
          //console.log(['context=',context]);
          // Generate an API call and return with POI results => show on the map.
          getPOIs(poiPlaces)
            .then(res => {
              if (Array.isArray(res)) {
                context.executeAction(setPoiPoints, res);
              }
            })
            .catch(err => {
              console.log(['err=',err]);
            })
            .finally(() => {
              //console.log('FINALLY OK!');
            });
          // Test publicly available JSON to simulate POI fetching from server.
          getFitMePOITest()
            .then(res => {
              console.log(['getFitMePOITest res=',res]);
            })
            .catch(err => {
              console.log(['getFitMePOITest err=',err]);
            })
            .finally(() => {
              //console.log('FINALLY OK!');
            });
        }
      }
    });
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
  } else if (distance(from, to) < config.minDistanceBetweenFromAndTo) {
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
