import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PoiStore from '../../../store/PoiStore';
import { setPoiPoints } from '../../../action/PoiPointActions';
import { setIntermediatePlaces } from '../../../util/queryUtils';
import { locationToOTP } from '../../../util/otpStrings';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require
/*
const filterViaPoint = (allPoints, pointToRemove) => {
  return allPoints.filter(
    p => p.lat !== pointToRemove.lat && p.lon !== pointToRemove.lon,
  );
};
*/
function PoiPopup(
  { lat, lon, poiPoints },
  { executeAction, router, match },
) {
  const currentPoint = { lat, lon };
  
  const addViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    //const filteredViaPoints = filterViaPoint(viaPoints, currentPoint);
    //executeAction(setViaPoints, filteredViaPoints);
    //setIntermediatePlaces(router, match, filteredViaPoints.map(locationToOTP));
  };
  /* Cannot be used "as is"... copied from class MarkerPopupBottom extends React.Component
  routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    this.props.onSelectLocation(this.props.location, 'via');
    this.props.leaflet.map.closePopup();
  };*/
  
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
            <FormattedMessage id="poi-point" defaultMessage="Poi point" />
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
}

PoiPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  poiPoints: PropTypes.array.isRequired,
};

PoiPopup.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connectedComponent = connectToStores(
  PoiPopup,
  [PoiStore],
  ({ getStore }) => {
    const poiPoints = getStore(PoiStore).getPoiPoints();
    console.log(['PoiPopup connectedComponent poiPoints=', poiPoints]);
    return { poiPoints };
  },
);

export { connectedComponent as default, PoiPopup as Component };
