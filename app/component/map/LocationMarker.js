import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../Icon';
import IconMarker from './IconMarker';
import ViaPointPopup from './popups/ViaPointPopup';
// FITME: BEGIN insert some code to test if POIs can be shown in the map.
import PoiPopup from './popups/PoiPopup';
// FITME: END

export default function LocationMarker({
  position,
  className,
  isLarge,
  type,
  disabled,
}) {
  
  const getValidType = markertype => {
    switch (markertype) {
      case 'from':
        return 'from';
      case 'to':
        return 'to';
      case 'poi':
        return 'poi';
      case 'via':
      default:
        return 'via';
    }
  };
  /*
  We want to show different icon for different types of POIs:
  Extra TYPE is found in: position.extra.type and it can be one of the following:
    1. accommodation
    2. attraction
    3. event
    4. experience
    5. rental_service
    6. restaurant
    7. shop
    8. venue
    
    id="icon-icon_mapMarker-poi-accommodation-map"
    id="icon-icon_mapMarker-poi-attraction-map"
    id="icon-icon_mapMarker-poi-event-map"
    id="icon-icon_mapMarker-poi-experience-map"
    id="icon-icon_mapMarker-poi-rental_service-map"
    id="icon-icon_mapMarker-poi-restaurant-map"
    id="icon-icon_mapMarker-poi-shop-map"
    id="icon-icon_mapMarker-poi-venue-map"
  */
  const validType = getValidType(type);
  const validTypeExtra = validType === 'poi' ? 'poi-'+position.extra.type : validType;
  const sideLength = isLarge ? 30 : 24;
  /*
  we need to define SVG symbol in the files:
    svg-sprite.default.svg
    svg-sprite.hsl.svg
  
  'icon-icon_mapMarker-poi'
  <symbol id="icon-icon_mapMarker-poi" viewBox="0 0 16 24">
    <path fill="#ff9800" fill-rule="evenodd" d="M4.5 8c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5S4.5 9.93 4.5 8zM8 24c5.333-7.721 8-13.054 8-16A8 8 0 1 0 0 8c0 2.946 2.667 8.279 8 16z"/>
  </symbol>
  
  'icon-icon_mapMarker-poi-map'
  <symbol id="icon-icon_mapMarker-poi-map" viewBox="0 0 20 29">
    <path fill="#ff9800" stroke="#FFF" stroke-width="1.5" d="M9.383 26.426C3.96 18.577 1.25 13.155 1.25 10a8.75 8.75 0 0 1 17.5 0c0 3.155-2.711 8.577-8.133 16.426L10 27.32l-.617-.894z"/>
    <path fill="#FFF" d="M6.5 10c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z"/>
  </symbol>
  
  See:
  map.scss
  div.leaflet-marker-icon.poi {
    color: #ff9800;
  }
  */
  return (
    <IconMarker
      position={position}
      className={cx(validType, className)}
      icon={{
        className: cx(validType, className),
        element: (
          <Icon
            img={`icon-icon_mapMarker-${validTypeExtra}-map`}
            color={disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
    >
      {validType === 'poi' && (
        <PoiPopup
          lat={position.lat}
          lon={position.lon}
          extra={position.extra}
          key={`${position.lat}${position.lon}`}
        />
      )}
      {validType === 'via' && (
        <ViaPointPopup
          lat={position.lat}
          lon={position.lon}
          key={`${position.lat}${position.lon}`}
        />
      )}
    </IconMarker>
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  // FITME: BEGIN insert some code to test if POIs can be shown in the map.
  type: PropTypes.oneOf(['from', 'via', 'poi', 'to', 'favourite']),
  // FITME: END
  disabled: PropTypes.bool,
};

LocationMarker.defaultProps = {
  className: undefined,
  isLarge: false,
  type: 'via',
  disabled: false,
};
