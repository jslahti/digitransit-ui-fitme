//import isString from 'lodash/isString';
//import sortedUniq from 'lodash/sortedUniq';
import xor from 'lodash/xor';
import isEqual from 'lodash/isEqual';
//import inside from 'point-in-polygon';
import { getPoiSettings } from '../store/localStorage';
//import { isInBoundingBox } from './geo-utils';
import { addAnalyticsEvent } from './analyticsUtils';
//import { ExtendedRouteTypes, TransportMode } from '../constants';

/*export const isCitybikeSeasonActive = season => {
  if (!season) {
    return true;
  }
  const currentDate = new Date();

  if (
    currentDate.getTime() <= season.end.getTime() &&
    currentDate.getTime() >= season.start.getTime()
  ) {
    return true;
  }
  return false;
};*/

/*export const isCitybikePreSeasonActive = season => {
  if (!season || !season.preSeasonStart) {
    return false;
  }
  const currentDate = new Date();

  if (
    currentDate.getTime() <= season.start.getTime() &&
    currentDate.getTime() >= season.preSeasonStart.getTime()
  ) {
    return true;
  }
  return false;
};*/

/*export const showCitybikeNetwork = network => {
  return (
    network?.enabled &&
    (isCitybikeSeasonActive(network?.season) ||
      isCitybikePreSeasonActive(network?.season))
  );
};*/

/*export const citybikeRoutingIsActive = network => {
  return network?.enabled && isCitybikeSeasonActive(network?.season);
};*/

/*export const networkIsActive = (config, networkName) => {
  const networks = config?.cityBike?.networks;

  return citybikeRoutingIsActive(networks[networkName]);
};*/

/*export const useCitybikes = networks => {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(network =>
    citybikeRoutingIsActive(network),
  );
};*/

/*export const showCityBikes = networks => {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(network => showCitybikeNetwork(network));
};*/

/*export const getNearYouModes = config => {
  if (!config.cityBike || !config.cityBike.networks) {
    return config.nearYouModes;
  }
  if (!useCitybikes(config.cityBike.networks)) {
    return config.nearYouModes.filter(mode => mode !== 'citybike');
  }
  return config.nearYouModes;
};*/

export const getPOISources = config => {
  /*if (
    config.cityBike &&
    config.cityBike.networks &&
    !useCitybikes(config.cityBike.networks)
  ) {
    return {
      ...config.transportModes,
      ...{ citybike: { availableForSelection: false } },
    };
  }
  return config.transportModes || {};*/
  return config.poiSources || {};
};
/*export const getRouteMode = route => {
  switch (route.type) {
    case ExtendedRouteTypes.BusExpress:
      return 'bus-express';
    case ExtendedRouteTypes.BusLocal:
      return 'bus-local';
    default:
      return route.mode?.toLowerCase();
  }
};*/

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailablePOISourceConfigs = config => {
  const poiSources = getPOISources(config);
  return poiSources
    ? Object.keys(poiSources)
        .filter(poi => poiSources[poi].availableForSelection)
        .map(poi => ({ ...poiSources[poi], name: poi.toUpperCase() }))
    : [];
};

export const getDefaultPOISources = config =>
  getAvailablePOISourceConfigs(config)
    .filter(poi => poi.defaultValue)
    .map(poi => poi.name);

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * Only the name of each transport mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailablePOISources = config =>
  getAvailablePOISourceConfigs(config).map(poi => poi.name);

/**
 * Retrieves the related OTP mode from the given configuration, if available.
 * This will return undefined if the given mode cannot be mapped.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to map
 * @returns The mapped mode, or undefined
 */
/*export const getOTPMode = (config, mode) => {
  if (!isString(mode)) {
    return undefined;
  }
  const otpMode = config.modeToOTP[mode.toLowerCase()];
  return otpMode ? otpMode.toUpperCase() : undefined;
};*/

/**
 * Checks if the given mode has been configured as availableForSelection or is WALK.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 */
/*export const isModeAvailable = (config, mode) =>
  ['WALK', ...getAvailablePOITypes(config)].includes(mode.toUpperCase());*/

/**
 * Checks if the given transport mode has been configured as availableForSelection.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 */
export const isPOISourceAvailable = (config, source) =>
  getAvailablePOISources(config).includes(source.toUpperCase());

/**
 * Checks if mode does not exist in config's modePolygons or
 * at least one of the given coordinates is inside any of the polygons defined for a mode
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 * @param {*} places
 */
/*export const isModeAvailableInsidePolygons = (config, mode, places) => {
  if (mode in config.modePolygons && places.length > 0) {
    for (let i = 0; i < places.length; i++) {
      const { lat, lon } = places[i];
      for (let j = 0; j < config.modeBoundingBoxes[mode].length; j++) {
        const boundingBox = config.modeBoundingBoxes[mode][j];
        if (
          isInBoundingBox(boundingBox, lat, lon) &&
          inside([lon, lat], config.modePolygons[mode][j])
        ) {
          return true;
        }
      }
    }
    return false;
  }
  return true;
};*/

/**
 * Maps the given modes (either a string array or a comma-separated string of values)
 * to their OTP counterparts. Any modes with no counterpart available will be dropped
 * from the output.
 *
 * @param {*} config The configuration for the software installation
 * @param {String[]|String} modes The modes to filter
 * @returns The filtered modes, or an empty string
 */
/*export const filterModes = (config, modes, from, to, intermediatePlaces) => {
  if (!modes) {
    return [];
  }
  const modesStr = modes instanceof Array ? modes.join(',') : modes;
  if (!isString(modesStr)) {
    return [];
  }
  return sortedUniq(
    modesStr
      .split(',')
      .filter(mode => isModeAvailable(config, mode))
      .filter(mode =>
        isModeAvailableInsidePolygons(config, mode, [
          from,
          to,
          ...intermediatePlaces,
        ]),
      )
      .map(mode => getOTPMode(config, mode))
      .filter(mode => !!mode)
      .sort(),
  );
};*/

/**
 * Retrieves all transport modes that are both available and marked as default,
 * and additionally WALK mode.
 *
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of modes
 */
export const getDefaultSources = config => {
  return getDefaultPOISources(config);
};

/**
 * Giving user an option to change mode settings when there are no
 * alternative options does not makse sense. This function checks
 * if there are at least two available transport modes
 *
 * @param {*} config
 * @returns {Boolean} True if mode settings should be shown to users
 */
export const showSourceSettings = config =>
  getAvailablePOISources(config).length > 1;

/**
 * Retrieves all transport modes and returns the currently available
 * modes together with WALK mode. If user has no ability to change
 * mode settings, always use default modes.
 *
 * @param {*} config The configuration for the software
 * @returns {String[]} returns user set modes or default modes
 */
export const getSources = config => {
  const { sources } = getPoiSettings();
  console.log(['======CUSTOMIZED SETTINGS getSources sources=',sources]);
  if (showSourceSettings(config) && Array.isArray(sources) && sources.length > 0) {
    const poisources = sources.filter(source =>
      isPOISourceAvailable(config, source),
    );
    return poisources;
  }
  return getDefaultSources(config);
};

/**
 * Checks if user has changed the transport or street modes
 *
 * @param {*} config The configuration for the software installation
 * @returns {Boolean} True if current modes differ from the default ones
 */
export const userHasChangedSources = config => {
  return !isEqual(getDefaultSources(config).sort(), getSources(config).sort());
};

/**
 * Updates the localStorage to reflect the selected transport mode.
 *
 * @param {*} poiSource The POI source to select
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of currently selected sources
 */
export function togglePOISource(poiSource, config) {
  console.log(['togglePOISource poiSource=',poiSource,' config=',config]);
  let actionName;
  if (getSources(config).includes(poiSource.toUpperCase())) {
    actionName = 'SettingsDisablePOISource'; // SettingsDisableTransportMode
  } else {
    actionName = 'SettingsEnablePOISource'; // SettingsEnableTransportMode
  }
  console.log(['actionName=',actionName]);
  addAnalyticsEvent({
    action: actionName,
    category: 'ItinerarySettings',
    name: poiSource,
  });
  const sources = xor(getSources(config), [poiSource.toUpperCase()]);
  console.log(['sources=',sources]);
  return sources;
}

/**
 * Filters away modes that do not allow bicycle boarding.
 *
 * @param {*} config The configuration for the software installation
 * @param {String[]} modes modes to filter from
 * @returns {String[]} result of filtering
 */
/*export const getBicycleCompatibleModes = (config, modes) =>
  modes.filter(mode => !config.modesWithNoBike.includes(mode));*/

/**
 * Transforms array of mode strings into modern format OTP mode objects
 *
 * @param {String[]} modes modes to filter from
 * @returns {Object[]} array of objects of format
 * {mode: <uppercase mode name>}, qualifier: <optional qualifier>}
 */
/*export const modesAsOTPModes = modes =>
  modes
    .map(mode => mode.split('_'))
    .map(modeAndQualifier =>
      modeAndQualifier.length > 1
        ? { mode: modeAndQualifier[0], qualifier: modeAndQualifier[1] }
        : { mode: modeAndQualifier[0] },
    );*/
