/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
//import React from 'react';
import React, { useState } from 'react';
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
  
  const [selectedPois, setSelectedPois] = useState([]);
  /*
  When POI is selected or ViaPoint (created from POI) is removed, this is called.
  LocationMarker key = {type:'poi',lat:lat,lon:lon} or {type:'via',lat:lat,lon:lon}
  */
  const onMarkerToggle = (key) => {
    // First check if key is for 'via' or 'poi' marker.
    if (key.type === 'via') {
      console.log(['This is a ViaPoint key=',key]);
    } else if (key.type === 'poi') {
      console.log(['This is a PoiPoint key=',key]);
    } else {
      console.log(['Not VIA or POI key=',key]);
    }
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
  }
  
  if (from.lat && from.lon) {
    leafletObjs.push(
      <LocationMarker key="fromMarker" position={from} type="from" onLocationMarkerToggle={onMarkerToggle} />,
    );
  }
  if (to.lat && to.lon) {
    leafletObjs.push(<LocationMarker key="toMarker" position={to} type="to" onLocationMarkerToggle={onMarkerToggle} />);
  }
  viaPoints.forEach((via, i) => {
    leafletObjs.push(<LocationMarker key={`via_${i}`} position={via} onLocationMarkerToggle={onMarkerToggle} />);
  });
  // FITME: BEGIN insert some code to show POIs in the map.
  pois.forEach((poi, i) => {
    leafletObjs.push(<LocationMarker key={`poi_${i}`} position={poi} type="poi" onLocationMarkerToggle={onMarkerToggle} />);
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
