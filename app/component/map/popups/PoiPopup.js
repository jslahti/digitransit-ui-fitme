import PropTypes from 'prop-types';
//import React, { useState } from 'react';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PoiStore from '../../../store/PoiStore';
import ViaPointStore from '../../../store/ViaPointStore';
//import { lockPoiPoint } from '../../../action/PoiPointActions';
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
const findViaPoint = (vias, lat, lon) => {
  let retval = false;
  vias.every(via => {
    if (via.lat === lat && via.lon === lon) {
      retval = true;
      return false; // break out from the every-loop.
    }
    return true; // continue with next via
  });
  return retval;
};

function PoiPopup(
//  { lat, lon, selected, locationSlack, attribs, onLocationMarkerToggle, poiPoints, viaPoints, leaflet },
  { lat, lon, extra, poiPoints, viaPoints, leaflet },
  { executeAction, router, match },
) {
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
    //executeAction(lockPoiPoint,currentPoint); // PoiPoint is now "locked" to ViaPoint.
    leaflet.map.closePopup();
  };
  
  const viaExist = findViaPoint(viaPoints, lat, lon);
  
  // Allow maximum of 5 ViaPoints on any itinerary.
  if (!viaExist && viaPoints.length < 5) {
  return (
    <Popup
      position={{ lat: lat+0.0001, lng: lon }}
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
      position={{ lat: lat+0.0001, lng: lon }}
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

export { connectedComponent as default, PoiPopup as Component };
