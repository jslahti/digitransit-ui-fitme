import Store from 'fluxible/addons/BaseStore';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }

  setPoiPoints(poiPoints) {
    if (this.poiPoints.length > 0) {
      const temp = [];
      poiPoints.forEach(poi=>{
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
        this.poiPoints = [...this.poiPoints, temp];
        console.log(['this.poiPoints + temp =',this.poiPoints]);
        console.log('NOW this.emitChange()');
        this.emitChange();
      } else {
        console.log('NO CHANGES TO POI STORAGE!');
      }
    } else {
      this.poiPoints = [...poiPoints];
      console.log(['this.poiPoints=',this.poiPoints]);
      console.log('NOW this.emitChange()');
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
