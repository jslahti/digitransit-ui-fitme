import PropTypes from 'prop-types';
//import React, { useState } from 'react';
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
*/
/*

    attribs: {
      name: testPOI.name,
      type: testPOI.type,
      address: testPOI.address,
      contactInfo: testPOI.contactInfo,
      url: testPOI.url,
      thumbnailsURls: testPOI.thumbnailsURls
    }


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
*/
function PoiPopup(
//  { lat, lon, selected, locationSlack, attribs, onLocationMarkerToggle, poiPoints, viaPoints, leaflet },
  { lat, lon, extra, poiPoints, viaPoints, leaflet },
  { executeAction, router, match },
) {
  // FITME! 
  /*
  if (extra) {
    console.log(['PoiPopup extra=',extra]);
  } else {
    console.log(['PoiPopup NO EXTRA extra=',extra]);
  }
  */
  // FITME!
  const locationSlack = extra.locationSlack;
  const title = extra.name;
  const street = extra.address.street;
  const zip = extra.address.zipCode;
  const city = extra.address.city;
  const info_email = extra.contactInfo.email;
  const info_phone = extra.contactInfo.phone;
  const info_url = extra.url;
  const thumbnailArray = extra.thumbnailsURls;
  //console.log(['PoiPopup thumbnailArray=',thumbnailArray]);
  let imgUrl = '';
  if (thumbnailArray.length > 0) {
    imgUrl = thumbnailArray[0];
  }
  const currentPoint = { lat, lon, locationSlack, address:street+', '+city };
  
  const addViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    viaPoints.push(currentPoint);
    const newViaPoints = [...viaPoints];
    executeAction(setViaPoints, newViaPoints);
    setIntermediatePlaces(router, match, newViaPoints.map(locationToOTP));
    //onLocationMarkerToggle({type:'poi',lat:lat,lon:lon});
    leaflet.map.closePopup();
    //const filteredPoiPoints = filterPoiPoint(poiPoints, currentPoint);
    //executeAction(setPoiPoints, filteredPoiPoints);
    //setIntermediatePlaces(router, match, newViaPoints.map(locationToOTP));
  };
  
  // Allow maximum of 5 ViaPoints on any itinerary.
  if (viaPoints.length < 5) {
  return (
    <Popup
      position={{ lat: lat + 0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={240}
      maxHeight={240}
      autoPan={false}
      className="popup single-popup"
    >
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-title">
            {title}
          </div>
          <div className="location-address">
            {street + ', ' + zip + ' ' + city}
          </div>
          <div className="location-address">
            {info_email}<br/>
            {info_phone}<br/>
            <a href={info_url} target='_blank'>{info_url}</a>
          </div>
        </div>
        <div className="location-popup-wrapper">
          <div className="location-thumbnail-image">
            <img src={imgUrl} width="160" height="90" />
          </div>
        </div>
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
  } else {
  return (
    <Popup
      position={{ lat: lat + 0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={240}
      maxHeight={240}
      autoPan={false}
      className="popup single-popup"
    >
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-title">
            {title}
          </div>
          <div className="location-address">
            {street + ', ' + zip + ' ' + city}
          </div>
          <div className="location-address">
            {info_email}<br/>
            {info_phone}<br/>
            <a href={info_url} target='_blank'>{info_url}</a>
          </div>
        </div>
        <div className="location-popup-wrapper">
          <div className="location-thumbnail-image">
            <img src={imgUrl} width="160" height="90" />
          </div>
        </div>
      </Card>
    </Popup>
  );
  }
}

PoiPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  extra: PropTypes.object,
  //selected: PropTypes.bool.isRequired,
  //locationSlack: PropTypes.number,
  //attribs: PropTypes.object.isRequired,
  //onLocationMarkerToggle: PropTypes.func,
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
