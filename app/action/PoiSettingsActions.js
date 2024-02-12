// eslint-disable-next-line import/prefer-default-export
export function savePoiSettings(actionContext, settings) {
  actionContext.dispatch('savePoiSettings', settings);
}
