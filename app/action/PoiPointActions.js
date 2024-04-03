export function addPoiPoint(actionContext, val) {
  actionContext.dispatch('addPoiPoint', val);
}

export function setPoiPoints(actionContext, po) {
  actionContext.dispatch('setPoiPoints', po);
}
