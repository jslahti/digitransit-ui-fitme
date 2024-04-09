import Store from 'fluxible/addons/BaseStore';
//import distance from '@digitransit-search-util/digitransit-search-util-distance';

class ClusterStore extends Store {
  static storeName = 'ClusterStore';

  cluster = {};

  setCluster(c) {
    this.cluster = c;
    this.emitChange();
  }

  getCluster() {
    return this.cluster;
  }

  static handlers = {
    setCluster: 'setCluster'
  };
}

export default ClusterStore;
