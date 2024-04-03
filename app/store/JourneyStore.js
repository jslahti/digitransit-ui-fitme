import Store from 'fluxible/addons/BaseStore';
//import distance from '@digitransit-search-util/digitransit-search-util-distance';

class JourneyStore extends Store {
  static storeName = 'JourneyStore';

  journey = {};

  setJourney(j) {
    this.journey = j;
    this.emitChange();
  }

  getJourney() {
    return this.journey;
  }

  static handlers = {
    setJourney: 'setJourney'
  };
}

export default JourneyStore;
