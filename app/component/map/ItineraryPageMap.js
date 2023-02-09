/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import LocationMarker from './LocationMarker';
import ItineraryLine from './ItineraryLine';
import MapWithTracking from './MapWithTracking';
import { onLocationPopup } from '../../util/queryUtils';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer'; // DT-3473

function ItineraryPageMap(
  {
    itineraries,
    active,
    showActive,
    from,
    to,
    viaPoints,
    // FITME: BEGIN insert some code to test if POIs can be shown in the map.
    pois,
    // FITME: END
    breakpoint,
    showVehicles,
    topics,
    onlyHasWalkingItineraries,
    loading,
    ...rest
  },
  { match, router, executeAction, config },
) {
  const { hash } = match.params;
  const leafletObjs = [];
  
  const fitmeExtractPOIs = legs => {
    let retu = [];
    console.log(['legs=',legs]);
    retu.push({address:'Kera, Espoo',lat:60.217992,lon:24.75494});
    return retu;
  };
  
  if (showVehicles) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon topics={topics} />,
    );
  }
  if (!showActive) {
    itineraries.forEach((itinerary, i) => {
      if (i !== active) {
        leafletObjs.push(
          <ItineraryLine
            key={`line_${i}`}
            hash={i}
            legs={itinerary.legs}
            passive
          />,
        );
        const fitmePOIs = fitmeExtractPOIs(itinerary.legs);
        console.log(['FIRST CASE fitmePOIs=',fitmePOIs]);
      }
    });
  }
  if (active < itineraries.length) {
    leafletObjs.push(
      <ItineraryLine
        key={`line_${active}`}
        hash={active}
        streetMode={hash}
        legs={itineraries[active].legs}
        showTransferLabels={showActive}
        showIntermediateStops
        onlyHasWalkingItineraries={onlyHasWalkingItineraries}
        loading={loading}
      />,
    );
    const fitmePOIs = fitmeExtractPOIs(itineraries[active].legs);
    console.log(['SECOND CASE fitmePOIs=',fitmePOIs]);
  }
  
  if (from.lat && from.lon) {
    leafletObjs.push(
      <LocationMarker key="fromMarker" position={from} type="from" />,
    );
  }
  if (to.lat && to.lon) {
    leafletObjs.push(<LocationMarker key="toMarker" position={to} type="to" />);
  }
  viaPoints.forEach((via, i) => {
    leafletObjs.push(<LocationMarker key={`via_${i}`} position={via} />);
  });
  // FITME: BEGIN insert some code to test if POIs can be shown in the map.
  // NOTE: We might want to create a new type "poi", but use now "via" for simplicity
  pois.forEach((poi, i) => {
    leafletObjs.push(<LocationMarker key={`poi_${i}`} position={poi} type="poi"/>);
  });
  // FITME: END
  
  // max 5 viapoints
  const locationPopup =
    config.viaPointsEnabled && viaPoints.length < 5
      ? 'all'
      : 'origindestination';
  const onSelectLocation = (item, id) =>
    onLocationPopup(item, id, router, match, executeAction);

  return (
    <MapWithTracking
      leafletObjs={leafletObjs}
      locationPopup={locationPopup}
      onSelectLocation={onSelectLocation}
      {...rest}
    >
      {breakpoint !== 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          fallback="pop"
        />
      )}
    </MapWithTracking>
  );
}

ItineraryPageMap.propTypes = {
  itineraries: PropTypes.array.isRequired,
  topics: PropTypes.array,
  active: PropTypes.number.isRequired,
  showActive: PropTypes.bool,
  breakpoint: PropTypes.string.isRequired,
  showVehicles: PropTypes.bool,
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  viaPoints: PropTypes.array.isRequired,
  // FITME: BEGIN insert some code to test if POIs can be shown in the map.
  pois: PropTypes.array,
  // FITME: END
  onlyHasWalkingItineraries: PropTypes.bool,
  loading: PropTypes.bool,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
  executeAction: PropTypes.func.isRequired,
};

export default ItineraryPageMap;
