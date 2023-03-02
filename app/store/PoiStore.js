import Store from 'fluxible/addons/BaseStore';
import distance from '@digitransit-search-util/digitransit-search-util-distance';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }
  /*
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
  }*/
  
  setPoiPoints(pois) {
    const oldlen = this.poiPoints.length;
    if (pois.length > 0){
      if (oldlen > 0) {
        // Store has old POIs and a new set is being added.
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
        if (news.length > 0 || keeps.length < oldlen) {
          // new ones to store or old ones removed
          this.poiPoints = keeps.concat(news);
          console.log(['keeps + news =',this.poiPoints]);
          console.log('NOW this.emitChange()');
          this.emitChange();
        } else { // NEW POIs is the same as old POIs
          console.log('NO CHANGES TO POI STORAGE!');
          console.log(['this.poiPoints=',this.poiPoints]);
        }
      } else {
        // Store has NO old POIs and a new set is being added.
        this.poiPoints = pois;
        console.log(['this.poiPoints=',this.poiPoints]);
        console.log('NOW this.emitChange()');
        this.emitChange();
      }
    } else {
      // No new POIs => check if there is any old POIs.
      if (oldlen > 0) {
        this.poiPoints = [];
        console.log('NO NEW POIs => THROW OLD POIs away!');
        console.log('NOW this.emitChange()');
        this.emitChange();
      } else {
        // No new POIs NO OLD POIs.
        //this.poiPoints = [];
        console.log('NO NEW POIs and NO OLD POIs!');
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
