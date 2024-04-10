import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

//import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
//import { addAnalyticsEvent } from '../util/analyticsUtils';
//import withSearchContext from './WithSearchContext';
import {
  setIntermediatePlaces
  //updateItinerarySearch
  //onLocationPopup,
} from '../util/queryUtils';

//import { getIntermediatePlaces, locationToOTP } from '../util/otpStrings';
import { locationToOTP } from '../util/otpStrings';

import { dtLocationShape } from '../util/shapes';
import { setViaPoints } from '../action/ViaPointActions';
import { setCluster } from '../action/ClusterActions';
//import { setPoiPoints } from '../action/PoiPointActions';
//import { LightenDarkenColor } from '../util/colorUtils';
import { getRefPoint } from '../util/apiUtils';
import { useCitybikes } from '../util/modeUtils';

import Select from 'react-select';
import { getFitMeClusters } from '../util/apiUtils';

/*
const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);
*/
class FitmeTestBar extends React.Component {
  state = {
    selectedOption: null,
  };
  options = [];
  //  [{ value: '', label: '' }]
  
  /* list of clusters, each object contains 
  title:"Espoo to Rovaniemi via Oulu",
  via: [{address:"Oulun linja-autoasema",city:"Oulu",locationSlack:1200,lat:65.009861,lon:25.484029}]

  updateItinerarySearch
  - origin
  - destination
  - router
  - location
  - this.context.executeAction
  */
  clusters = [];
  
  static propTypes = {
    className: PropTypes.string,
    //origin: dtLocationShape.isRequired,
    //destination: dtLocationShape.isRequired,
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
  
  componentWillUpdate() {
    console.log('=================== FitmeTestBar componentWillUpdate =================================');
    console.log(['this.clusters=',this.clusters]);
  }
  /*
    The result contains arrays of arrays.
    Now that we have only one URL to fetch, there is only one array in result array.
    title:"Nauvo",
    via: [
      {address:"Puistotie 1",city:"Nauvo",locationSlack:3600,lat:60.1928706,lon:21.909745644227602},
      {address:"Pappilanpolku 3",city:"Nauvo",locationSlack:3600,lat:60.1944552,lon:21.9090438},
    ]
  */
  parseResponse = res => {
    const cc = []; // cluster candidates
    const opts = []; // titles for the select-element
    if (res && Array.isArray(res) && res.length > 0) {
      res.forEach(arr=>{
        if (arr && Array.isArray(arr) && arr.length > 0) {
          arr.forEach((r,r_index)=>{
            if (r.duration > 0) {
              opts.push({value:'index-'+r_index,label:r.title});
              const temp_cluster = {title:'', via:[]};
              const duration = r.duration*3600; // hour has 3600 seconds
              temp_cluster.title = r.title;
              const mi = r.MapItems;
              if (mi && Array.isArray(mi) && mi.length > 0) {
                // Assign each viapoint equal share of full duration.
                const slack = duration/mi.length;
                mi.forEach(item=>{
                  const vp = {locationSlack:slack};
                  if (item.geo && item.geo.coordinates) {
                    vp.lat = item.geo.coordinates[0];
                    vp.lon = item.geo.coordinates[1];
                  }
                  if (item.Point && item.Point.streetAddress) {
                    vp.address = item.Point.streetAddress;
                    //city = ?
                  }
                  temp_cluster.via.push(vp);
                });
              }
              if (temp_cluster.via.length > 0) {
                cc.push(temp_cluster);
              }
            }
          });
        }
      });
    }
    this.clusters = cc;
    this.options = opts;
    this.setState({selectedOption:'index-0'});
  }
  
  componentDidMount() {
    //const viaPoints = getIntermediatePlaces(this.context.match.location.query);
    //this.context.executeAction(setViaPoints, viaPoints);
    this.mounted = true;
    console.log('========================== getFitMeClusters =================================');
    getFitMeClusters()
      .then(res => {
        console.log(['res=',res]);
        // parse viapoint elements from received data.
        this.parseResponse(res);
        /*if (res && Array.isArray(res) && res.length > 0) {
          const opts = [];
          res.forEach((r,i) => {
            opts.push({value:'index-'+i,label:r.title});
          });
          this.clusters = res;
          this.options = opts;
          this.setState({selectedOption:'index-0'});
        }*/
      })
      .catch(err => {
        console.log(['err=',err]);
      })
      .finally(() => {
        console.log('FINALLY OK!');
      });
  }
  
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
  }
  
  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log(['OUTSIDE setState selectedOption=',selectedOption]);
    this.clusters.every(c=>{
      if (c.title === selectedOption.label) {
        console.log(['SELECTED cluster=',c]);
        if (c.via && Array.isArray(c.via) && c.via.length > 0) {
          const vips = [];
          c.via.forEach(v=>{
            const city = v.city ? ', '+v.city : '';
            vips.push({
              address: v.address + city,
              locationSlack: v.locationSlack,
              lat: v.lat,
              lon: v.lon
            });
          });
          this.updateViaPoints(vips);
        }
        console.log('========== executeAction setCluster =======');
        this.context.executeAction(setCluster, c);
        return false; // break out from the every-loop.
      }
      return true; // continue with next journey
    });
  }
  
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
    /*const refPoint = getRefPoint(
      this.props.origin,
      this.props.destination,
      this.props.locationState,
    );*/
    const desktopTargets = ['Locations', 'CurrentPosition', 'Stops'];
    if (useCitybikes(this.context.config.cityBike?.networks)) {
      desktopTargets.push('BikeRentalStations');
    }
    
    console.log('========== RENDER FITME TEST BAR!!! ============');
    
    const { selectedOption } = this.state;
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
        <div style={{width: '400px'}}>
          <Select
            value={selectedOption}
            onChange={this.handleChange}
            options={this.options}
          />
        </div>
      </div>
    );
  }
}

const connectedComponent = connectToStores(
  FitmeTestBar,
  [
    //'OriginStore',
    //'DestinationStore',
    'PreferencesStore', 
    'FavouriteStore',
    'ViaPointStore',
    'PositionStore',
    'ClusterStore'
  ],
  ({ getStore }) => ({
    //origin: getStore('OriginStore').getOrigin(),
    //destination: getStore('DestinationStore').getDestination(),
    language: getStore('PreferencesStore').getLanguage(),
    showFavourites: getStore('FavouriteStore').getStatus() === 'has-data',
    viaPoints: getStore('ViaPointStore').getViaPoints(),
    locationState: getStore('PositionStore').getLocationState(),
    cluster: getStore('ClusterStore').getCluster(),
  }),
);

export { connectedComponent as default, FitmeTestBar as Component };
