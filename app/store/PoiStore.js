import Store from 'fluxible/addons/BaseStore';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }

  setPoiPoints(pois) {
    if (this.poiPoints.length > 0) {
      const temp = [];
      pois.forEach(poi=>{
        let isSame = false;
        this.poiPoints.every(oldpoi=>{
          if (oldpoi.lat === poi.lat && oldpoi.lon === poi.lon && oldpoi.address === poi.address) {
            isSame = true;
            return false; // break out from the loop.
          }
          return true; // continue with next poi
        });
        if (!isSame) {
          temp.push(poi);
        }
      });
      if (temp.length > 0) {
        this.poiPoints = this.poiPoints.concat(temp); //[...this.poiPoints, temp];
        console.log(['this.poiPoints + temp =',this.poiPoints]);
        console.log('NOW this.emitChange()');
        this.emitChange();
      } else {
        console.log('NO CHANGES TO POI STORAGE!');
      }
    } else {
      this.poiPoints = pois;
      console.log(['this.poiPoints=',this.poiPoints]);
      console.log('NOW this.emitChange()');
      this.emitChange();
    }
  }

  clearPoiPoints() {
    this.poiPoints = [];
  }

  getPoiPoints() {
    return this.poiPoints;
  }

  static handlers = {
    addPoiPoint: 'addPoiPoint',
    setPoiPoints: 'setPoiPoints',
    clearPoiPoints: 'clearPoiPoints',
  };
}

export default PoiStore;
