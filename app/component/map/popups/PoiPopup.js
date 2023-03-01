import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PoiStore from '../../../store/PoiStore';
import ViaPointStore from '../../../store/ViaPointStore';
//import { setPoiPoints } from '../../../action/PoiPointActions';
import { setViaPoints } from '../../../action/ViaPointActions';
import { setIntermediatePlaces } from '../../../util/queryUtils';
import { locationToOTP } from '../../../util/otpStrings';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require
import { withLeaflet } from 'react-leaflet/es/context';
/*
const filterPoiPoint = (allPoints, pointToRemove) => {
  return allPoints.filter(
    p => p.lat !== pointToRemove.lat && p.lon !== pointToRemove.lon,
  );
};



    address: {
      street: "Ahertajantie 5",
      city: "Espoo",
      zipCode: "02100"
    },

*/
function PoiPopup(
  { lat, lon, locationSlack, attribs, poiPoints, viaPoints, leaflet },
  { executeAction, router, match },
) {
  const street = attribs.address.street;
  const thumbnailArray = attribs.thumbnailsURls;
  console.log(['PoiPopup thumbnailArray=',thumbnailArray]);
  const currentPoint = { lat, lon, locationSlack, address:street };
  const addViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    viaPoints.push(currentPoint);
    const newViaPoints = [...viaPoints];
    executeAction(setViaPoints, newViaPoints);
    setIntermediatePlaces(router, match, newViaPoints.map(locationToOTP));
    
    // How to close the popup?
    leaflet.map.closePopup();
    
    //const filteredPoiPoints = filterPoiPoint(poiPoints, currentPoint);
    //executeAction(setPoiPoints, filteredPoiPoints);
    //setIntermediatePlaces(router, match, newViaPoints.map(locationToOTP));
  };
  
  return (
    <Popup
      position={{ lat: lat + 0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={120}
      maxHeight={80}
      autoPan={false}
      className="popup single-popup"
    >
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-address">
          {street}
          {/*<FormattedMessage id="poi-point" defaultMessage="Poi point" />*/}
          </div>
        </div>
        {/*
        <PoiPopupBottom 
          location={{
            address,
            lat,
            lon,
          }}
          onSelectLocation={onSelectLocation}
        />
        */}
        <div className="bottom location">
          <button
            type="button"
            onClick={e => addViaPoint(e)}
            className="route cursor-pointer route-add-viapoint"
          >
            <FormattedMessage id="add-itinerary-via-point" defaultMessage="Add" />
          </button>
        </div>
      </Card>
    </Popup>
  );
}

PoiPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  //address: PropTypes.string.isRequired,
  locationSlack: PropTypes.number,
  attribs: PropTypes.object.isRequired,
  poiPoints: PropTypes.array.isRequired,
  viaPoints: PropTypes.array.isRequired,
  leaflet: PropTypes.shape({
    map: PropTypes.shape({
      closePopup: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

PoiPopup.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connectedComponent = withLeaflet(
  connectToStores(
    PoiPopup,
    ['PoiStore','ViaPointStore'],
    ({ getStore }) => ({
      poiPoints: getStore('PoiStore').getPoiPoints(),
      viaPoints: getStore('ViaPointStore').getViaPoints(),
    }),
  ),
);
/*
Can I use "withLeaflet" here like this?
I need access to code like this:
    this.props.leaflet.map.closePopup();

import { withLeaflet } from 'react-leaflet/es/context';
...
const markerPopupBottomWithLeaflet = withLeaflet(MarkerPopupBottom);
export {
  markerPopupBottomWithLeaflet as default,
  MarkerPopupBottom as Component,
};

SEE EXAMPLE IN 
TileLayerContainer.js
import { withLeaflet } from 'react-leaflet/es/context';
...
const connectedComponent = withLeaflet(
  connectToStores(
    props => (
      <ReactRelayContext.Consumer>
        {({ environment }) => (
          <TileLayerContainer {...props} relayEnvironment={environment} />
        )}
      </ReactRelayContext.Consumer>
    ),
    [RealTimeInformationStore],
    context => ({
      vehicles: context.getStore(RealTimeInformationStore).vehicles,
    }),
  ),
);

export { connectedComponent as default, TileLayerContainer as Component };

*/
export { connectedComponent as default, PoiPopup as Component };
