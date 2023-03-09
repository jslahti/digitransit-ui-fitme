import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import ViaPointStore from '../../../store/ViaPointStore';
import PoiStore from '../../../store/PoiStore';
import { setViaPoints } from '../../../action/ViaPointActions';
import { unlockPoiPoint } from '../../../action/PoiPointActions';
import { setIntermediatePlaces } from '../../../util/queryUtils';
import { locationToOTP } from '../../../util/otpStrings';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require

const filterViaPoint = (allPoints, pointToRemove) => {
  return allPoints.filter(
    p => p.lat !== pointToRemove.lat && p.lon !== pointToRemove.lon,
  );
};

const findExtras = (pois, lat, lon) => {
  let extra = undefined;
  pois.every(poi => {
    if (poi.lat === lat && poi.lon === lon) {
      extra = poi.extra;
      return false; // break out from the every-loop.
    }
    return true; // continue with next poi
  });
  return extra;
};

function ViaPointPopup(
  { lat, lon, viaPoints, poiPoints },
  { executeAction, router, match },
) {
  const currentPoint = { lat, lon };

  let locationSlack = 0;
  let title = 'TITLE';
  let street = 'STREET';
  let zip = 'ZIP';
  let city = 'CITY';
  let info_email = 'EMAIL';
  let info_phone = 'PHONE';
  let info_url = '';
  let thumbnailArray = [];
  let imgUrl = '';

  // FITME!
  const extra = findExtras(poiPoints, lat, lon);
  if (extra) {
    locationSlack = extra.locationSlack;
    title = extra.name;
    street = extra.address.street;
    zip = extra.address.zipCode;
    city = extra.address.city;
    info_email = extra.contactInfo.email;
    info_phone = extra.contactInfo.phone;
    info_url = extra.url;
    thumbnailArray = extra.thumbnailsURls;
    if (thumbnailArray.length > 0) {
      imgUrl = thumbnailArray[0];
    }
  }
  
  const deleteViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    const filteredViaPoints = filterViaPoint(viaPoints, currentPoint);
    executeAction(setViaPoints, filteredViaPoints);
    setIntermediatePlaces(router, match, filteredViaPoints.map(locationToOTP));
    executeAction(unlockPoiPoint, currentPoint);
  };
  
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
            onClick={e => deleteViaPoint(e)}
            className="route cursor-pointer route-add-viapoint"
          >
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </button>
        </div>
      </Card>
    </Popup>
  );
}

ViaPointPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  viaPoints: PropTypes.array.isRequired,
  poiPoints: PropTypes.array.isRequired,
};

ViaPointPopup.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connectedComponent = connectToStores(
  ViaPointPopup,
  [ViaPointStore, PoiStore],
  ({ getStore }) => ({
    viaPoints: getStore(ViaPointStore).getViaPoints(),
    poiPoints: getStore(PoiStore).getPoiPoints()
  }),
);

export { connectedComponent as default, ViaPointPopup as Component };
