import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
//import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
//import { addAnalyticsEvent } from '../util/analyticsUtils';
//import withSearchContext from './WithSearchContext';
/*import {
  setIntermediatePlaces,
  updateItinerarySearch,
  onLocationPopup,
} from '../util/queryUtils';
*/
//import { getIntermediatePlaces, locationToOTP } from '../util/otpStrings';
import { getIntermediatePlaces } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import { setViaPoints } from '../action/ViaPointActions';
//import { setPoiPoints } from '../action/PoiPointActions';
//import { LightenDarkenColor } from '../util/colorUtils';
import { getRefPoint } from '../util/apiUtils';
import { useCitybikes } from '../util/modeUtils';

// FITME
import { getFitMeJourneys } from '../util/apiUtils';
// FITME

/*
const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);
*/
class FitmeTestBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    language: PropTypes.string,
    isMobile: PropTypes.bool,
    showFavourites: PropTypes.bool.isRequired,
    viaPoints: PropTypes.array,
    locationState: dtLocationShape.isRequired,
    modeSet: PropTypes.string,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static defaultProps = {
    className: undefined,
    language: 'fi',
    isMobile: false,
    viaPoints: [],
    modeSet: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const viaPoints = getIntermediatePlaces(this.context.match.location.query);
    this.context.executeAction(setViaPoints, viaPoints);
    this.mounted = true;
  }
/*
  updateViaPoints = newViaPoints => {
    // fixes the bug that DTPanel starts excecuting updateViaPoints before this component is even mounted
    if (this.mounted) {
      const p = newViaPoints.filter(vp => vp.lat && vp.address);
      this.context.executeAction(setViaPoints, p);
      setIntermediatePlaces(
        this.context.router,
        this.context.match,
        p.map(locationToOTP),
      );
    }
  };
  */
  /*
  swapEndpoints = () => {
    const { location } = this.context.match;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    updateItinerarySearch(
      this.props.destination,
      this.props.origin,
      this.context.router,
      location,
      this.context.executeAction,
    );
  };
  */
  /*
  onLocationSelect = (item, id) => {
    let action;
    console.log('======== TEST: RESET POI Store ==============');
    this.context.executeAction(setPoiPoints, {poi:[], via:[]});
    console.log('======== SEE IF POIs are fetched or NOT? ==========');
    console.log(['======== onLocationSelect item=',item,' id=',id]);
    if (id === parseInt(id, 10)) {
      // id = via point index
      action = 'EditJourneyViaPoint';
      const points = [...this.props.viaPoints];
      points[id] = { ...item };
      this.updateViaPoints(points);
    } else {
      action =
        id === 'origin' ? 'EditJourneyStartPoint' : 'EditJourneyEndPoint';
      onLocationPopup(
        item,
        id,
        this.context.router,
        this.context.match,
        this.context.executeAction,
      );
    }
    addAnalyticsEvent({
      action,
      category: 'ItinerarySettings',
      name: item.type,
    });
  };
  */
  render() {
    const { config } = this.context;
    const refPoint = getRefPoint(
      this.props.origin,
      this.props.destination,
      this.props.locationState,
    );
    const desktopTargets = ['Locations', 'CurrentPosition', 'Stops'];
    if (useCitybikes(this.context.config.cityBike?.networks)) {
      desktopTargets.push('BikeRentalStations');
    }
    console.log('========================== getFitMeJourneys =================================');
    getFitMeJourneys()
      .then(res => {
        console.log(['res=',res]);
        document.getElementById('fitme-test-bar-text').innerText = 'JourneyList will be HERE!';
      })
      .catch(err => {
        console.log(['err=',err]);
      })
      .finally(() => {
        console.log('FINALLY OK!');
      });
    
    const mobileTargets = [...desktopTargets, 'MapPosition'];
    const filter = config.stopSearchFilter
      ? results => results.filter(config.stopSearchFilter)
      : undefined;
    return (
      <div
        className={cx(
          'fitme-test-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <p id="fitme-test-bar-text">Hello from FitmeTestBar!</p>
      </div>
    );
  }
}

const connectedComponent = connectToStores(
  FitmeTestBar,
  ['PreferencesStore', 'FavouriteStore', 'ViaPointStore', 'PositionStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
    showFavourites: getStore('FavouriteStore').getStatus() === 'has-data',
    viaPoints: getStore('ViaPointStore').getViaPoints(),
    locationState: getStore('PositionStore').getLocationState(),
  }),
);

export { connectedComponent as default, FitmeTestBar as Component };
