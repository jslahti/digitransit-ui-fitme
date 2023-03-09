export function addPoiPoint(actionContext, val) {
  //console.log(['addPoiPoint called actionContext=',actionContext,' val=',val]);
  actionContext.dispatch('addPoiPoint', val);
  //console.log('dispatch done');
}

export function setPoiPoints(actionContext, points) {
  //console.log(['setPoiPoints call actionContext=',actionContext,' points=',points]);
  actionContext.dispatch('setPoiPoints', points);
  //console.log('dispatch done');
}

export function lockPoiPoint(actionContext, poi) {
  actionContext.dispatch('lockPoiPoint', poi);
}

export function unlockPoiPoint(actionContext, poi) {
  actionContext.dispatch('unlockPoiPoint', poi);
}
