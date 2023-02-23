import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';
import { dtLocationShape } from '../../util/shapes';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

class PoiPopupBottom extends React.Component {
  static displayName = 'PoiPopupBottom';

  static propTypes = {
    location: dtLocationShape.isRequired,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        closePopup: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    onSelectLocation: PropTypes.func.isRequired,
  };

  routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    console.log(['routeAddViaPoint this.props.location=',this.props.location]);
    this.props.onSelectLocation(this.props.location, 'via');
    this.props.leaflet.map.closePopup();
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    return (
      <div className="bottom location">
        <div onClick={() => this.routeAddViaPoint()} className="route cursor-pointer route-add-viapoint">
          <FormattedMessage id="route-add-viapoint" defaultMessage="Via point" />
        </div>
      </div>
    );
  }
}

const poiPopupBottomWithLeaflet = withLeaflet(PoiPopupBottom);

export {
  poiPopupBottomWithLeaflet as default,
  PoiPopupBottom as Component,
};
