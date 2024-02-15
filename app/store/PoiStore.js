import Store from 'fluxible/addons/BaseStore';
//import distance from '@digitransit-search-util/digitransit-search-util-distance';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  isEqual(a_new, an_old) {
    let isSame = true;
    a_new.every(poi=>{
      let found = false;
      an_old.every(oldpoi=>{
        if (oldpoi.lat === poi.lat && oldpoi.lon === poi.lon && oldpoi.index === poi.index) {
          found = true;
          return false; // break out from the every loop.
        }
        return true; // continue with next oldpoi
      });
      if (!found) {
        isSame = false;
        return false; // break out from the every loop.
      }
      return true; // continue with next poi
    });
    return isSame;
  }

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }

  // po is an object with two arrays mapped as {poi: poi_array, via: viapoint_array }
  setPoiPoints(po) {
    const pois = po.poi;
    const viapoints = po.via;
    const newpois = [];
    let isSame = false;
    console.log(['setPoiPoints pois=',pois,' viapoints=',viapoints]);
    // Check if the POI SETS are same
    if (pois.length > 0 && this.poiPoints.length > 0) {
      if (this.isEqual(pois, this.poiPoints)) {
        isSame = true;
      }
    }
    if (isSame) {
      console.log('=== PoiStore is NOT changed! ==='); 
    } else {
      if (pois.length > 0) {
        pois.forEach(poi=>{
          newpois.push(poi);
        });
      }
      this.poiPoints = newpois;
      console.log(['CHANGES TO Store this.poiPoints=',this.poiPoints,'and EMIT CHANGE!']);
      this.emitChange();
    }
  }

  getPoiPoints() {
    return this.poiPoints;
  }

  static handlers = {
    addPoiPoint: 'addPoiPoint',
    setPoiPoints: 'setPoiPoints',
  };
}

export default PoiStore;
