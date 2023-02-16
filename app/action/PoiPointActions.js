export function addPoiPoint(actionContext, val) {
  actionContext.dispatch('addPoiPoint', val);
}

export function setPoiPoints(actionContext, points) {
  actionContext.dispatch('setPoiPoints', points);
}
