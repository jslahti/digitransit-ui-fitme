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
    const oldlen = this.poiPoints.length;
    if (oldlen > 0) {
      const keeps = [];
      const news = [];
      // If POIs exist => we go through the list and check which ones to keep.
      pois.forEach(poi=>{
        let isSame = false;
        this.poiPoints.every(oldpoi=>{
          if (distance(oldpoi,poi) < 30) { // 30 m
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
      if (news.length > 0 || keeps.length < oldlen) { // new ones to store or old ones removed
        this.poiPoints = keeps.concat(news);
        console.log(['keeps + news =',this.poiPoints]);
        console.log('NOW this.emitChange()');
        this.emitChange();
      } else {
        console.log('NO CHANGES TO POI STORAGE!');
      }
    } else if (pois.length === 0){
      this.poiPoints = [];
      console.log('NO OLD POIs and NO NEW POIs!');
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
