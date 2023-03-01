import Store from 'fluxible/addons/BaseStore';
import distance from '@digitransit-search-util/digitransit-search-util-distance';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }

  setPoiPoints(pois) {
    if (this.poiPoints.length > 0) {
      const keeps = [];
      const news = [];
      // If POIs exist => we go through the list and check which ones to keep.
      pois.forEach(poi=>{
        let isSame = false;
        this.poiPoints.every(oldpoi=>{
          if (distance(oldpoi,poi) < 100) { // 100 m
            isSame = true;
            keeps.push(oldpoi);
            return false; // break out from the loop.
          }
          return true; // continue with next poi
        });
        if (!isSame) {
          news.push(poi);
        }
      });
      if (news.length > 0) {
        this.poiPoints = keeps.concat(news);//this.poiPoints.concat(temp); //[...this.poiPoints, temp];
        console.log(['keeps + news =',this.poiPoints]);
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
  
  getPoiPoints() {
    return this.poiPoints;
  }

  static handlers = {
    addPoiPoint: 'addPoiPoint',
    setPoiPoints: 'setPoiPoints',
  };
}

export default PoiStore;
