import Store from 'fluxible/addons/BaseStore';

class PoiStore extends Store {
  static storeName = 'PoiStore';

  poiPoints = [];

  addPoiPoint(val) {
    this.poiPoints.push(val);
    this.emitChange();
  }

  setPoiPoints(poiPoints) {
    this.poiPoints = [...poiPoints];
    console.log(['this.poiPoints=',this.poiPoints]);
    console.log('NOW this.emitChange()');
    this.emitChange();
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
