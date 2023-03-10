import Store from 'fluxible/addons/BaseStore';
import distance from '@digitransit-search-util/digitransit-search-util-distance';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }
  
  lockPoiPoint(poi) {
    console.log(['lockPoiPoint poi.lat=',poi.lat,' poi.lon=',poi.lon]);
    this.poiPoints.every(p=>{
      if (p.lat === poi.lat && p.lon === poi.lon) {
        p.lock = true;
        console.log(['poiPoint is now LOCKED! p=',p]);
        return false; // break out from the loop.
      }
      return true; // continue with next p
    });
  }
  
  unlockPoiPoint(poi) {
    console.log(['unlockPoiPoint poi.lat=',poi.lat,' poi.lon=',poi.lon]);
    this.poiPoints.every(p=>{
      if (p.lat === poi.lat && p.lon === poi.lon) {
        p.lock = false;
        console.log(['poiPoint is now UNLOCKED! p=',p]);
        return false; // break out from the loop.
      }
      return true; // continue with next p
    });
  }
  
  /*
    poiPoints that has an "lock"-flag true, don't get removed.
    They are kept as long as flag exist.
  */
  setPoiPoints(pois) {
    const oldlen = this.poiPoints.length;
    const keeps = [];
    const news = [];
    if (oldlen > 0) {
      // Store has old POIs and a new set is being added.
      // If POI has "lock" => keep it.
      this.poiPoints.forEach(oldpoi=>{
        if (oldpoi.lock) {
          // If POIs exist => we go through the list and check which ones to keep.
          keeps.push(oldpoi);
        }
      });
      if (pois.length > 0) {
        pois.forEach(poi=>{
          let op = 1; // new poi by default
          this.poiPoints.every(oldpoi=>{
            if (oldpoi.lock) {
              op = 2; // ignore this, it is already in keeps-array.
            } else if (distance(oldpoi,poi) < 30) { // 30 m
              op = 0; // match found (=same as old poi)
              keeps.push(oldpoi);
              return false; // break out from the every loop.
            }
            return true; // continue with next oldpoi
          });
          if (op === 1) {
            news.push(poi);
          }
        });
        if (news.length > 0 || keeps.length < oldlen) {
          // new ones to store or old ones removed
          this.poiPoints = keeps.concat(news);
          console.log(['keeps=',keeps,' news=',news,' this.poiPoints=',this.poiPoints,' NOW this.emitChange()']);
          this.emitChange();
        } else { // NEW POIs is the same as old POIs
          console.log(['NO CHANGES TO POI STORAGE! this.poiPoints=',this.poiPoints]);
        }
      } else { // There were oldpois but new set is empty!
        this.poiPoints = [];
        console.log('NOW this.emitChange()');
        this.emitChange();
      }
    } else {
      // Store has NO old POIs and a new set is being added.
      if (pois.length > 0) {
        this.poiPoints = pois;
        console.log(['this.poiPoints=',this.poiPoints,' NOW this.emitChange()']);
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
