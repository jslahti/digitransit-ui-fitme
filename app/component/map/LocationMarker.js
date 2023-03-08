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
  //onLocationMarkerToggle,
  disabled,
}) {
  
  const getValidType = markertype => {
    switch (markertype) {
      case 'from':
        return 'from';
      case 'to':
        return 'to';
      // FITME: BEGIN insert some code to test if POIs can be shown in the map.
      case 'poi':
        return 'poi';
      // FITME: END
      case 'via':
      default:
        return 'via';
    }
  };
  const validType = getValidType(type);
  const sideLength = isLarge ? 30 : 24;
  /*
  let adjusted_position = {lat:position.lat, lon:position.lon};
  if (validType === 'poi' && position.selected) {
    adjusted_position.lon = position.lon+0.0001;
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
            img={`icon-icon_mapMarker-${validType}-map`}
            color={disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
    >
      {validType === 'via' && (
        <ViaPointPopup
          lat={position.lat}
          lon={position.lon}
          extra={position.extra}
          key={`${position.lat}${position.lon}`}
        />
      )}
      {validType === 'poi' && (
        <PoiPopup
          lat={position.lat}
          lon={position.lon}
          extra={position.extra}
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
