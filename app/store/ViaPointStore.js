import Store from 'fluxible/addons/BaseStore';

class ViaPointStore extends Store {
  static storeName = 'ViaPointStore';

  viaPoints = [];

  addViaPoint(val) {
    console.log(['ViaPointStore addViaPoint val=',val]);
    this.viaPoints.push(val);
    this.emitChange();
  }

  setViaPoints(viaPoints) {
    console.log(['ViaPointStore setViaPoints viaPoints=',viaPoints]);
    this.viaPoints = [...viaPoints];
    this.emitChange();
  }

  getViaPoints() {
    console.log(['ViaPointStore getViaPoints viaPoints=',this.viaPoints]);
    return this.viaPoints;
  }

  static handlers = {
    addViaPoint: 'addViaPoint',
    setViaPoints: 'setViaPoints',
  };
}

export default ViaPointStore;
