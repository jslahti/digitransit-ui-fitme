import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import { getStopName } from '@digitransit-search-util/digitransit-search-util-helpers';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteStopContainer = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { stop, isTerminal }) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
    addFavourite: () => {
      const favouriteType = isTerminal ? 'station' : 'stop';
      let gid = `gtfs${stop.gtfsId
        .split(':')[0]
        .toLowerCase()}:${favouriteType}:GTFS:${stop.gtfsId}`;
      if (stop.code) {
        gid += `#${stop.code}`;
      }
      getJson(context.config.URL.PELIAS_PLACE, {
        ids: gid,
        lang: context.getStore('PreferencesStore').getLanguage(),
      }).then(res => {
        if (Array.isArray(res.features) && res.features.length > 0) {
          const stopOrStation = res.features[0];
          const { label, name } = stopOrStation.properties;
          context.executeAction(saveFavourite, {
            address: label,
            code: stop.code,
            gtfsId: stop.gtfsId,
            lat: stop.lat,
            lon: stop.lon,
            name: getStopName(name, stop.code),
            type: favouriteType,
          });
          addAnalyticsEvent({
            category: 'Stop',
            action: 'MarkStopAsFavourite',
            name: !context
              .getStore('FavouriteStore')
              .isFavourite(stop.gtfsId, favouriteType),
          });
        }
      });
    },
    deleteFavourite: () => {
      const stopToDelete = context
        .getStore('FavouriteStore')
        .getByGtfsId(stop.gtfsId, isTerminal ? 'station' : 'stop');
      context.executeAction(deleteFavourite, stopToDelete);
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
      });
    },
  }),
);

FavouriteStopContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default FavouriteStopContainer;
