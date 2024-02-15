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
    if (this.poiPoints.length > 0) {
      // Store has old POIs and viapoints are defined
      // If POI is included in viapoints array => keep it.
      if (viapoints.length > 0) {
        viapoints.forEach(vp=>{
          this.poiPoints.every(oldpoi=>{
            // If POIs exist => we go through the list and check which ones to keep.
            // NOTE: viapoints do NOT have index, only address, lat and lon
            if (vp.lat === oldpoi.lat && vp.lon === oldpoi.lon) {
              newpois.push(oldpoi);
              return false; // break out from the .every loop
            }
            return true; // continue with next oldpoi
          });
        });
      }
      if (pois.length > 0) {
        if (this.isEqual(pois, this.poiPoints)) {
          isSame = true;
        } else {
          pois.forEach(poi=>{
            newpois.push(poi);
          });
        }
      }
    }
    if (isSame) {
      console.log('=== PoiStore is NOT changed! ==='); 
    } else {
      if (newpois > 0) {
        this.poiPoints = newpois;
        console.log(['CHANGES TO Store this.poiPoints=',this.poiPoints,'and EMIT CHANGE!']);
        this.emitChange();
      } else {
        this.poiPoints = [];
        console.log('=== EMPTY the Store and EMIT change! ===');
        this.emitChange();
      }
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
