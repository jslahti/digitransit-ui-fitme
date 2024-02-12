import Store from 'fluxible/addons/BaseStore';
import {
  getPOISettings,
  setPOISettings,
} from './localStorage';

class PoiSettingsStore extends Store {
  static storeName = 'PoiSettingsStore';

  // eslint-disable-next-line class-methods-use-this
  getPoiSettings() {
    let settings = getPOISettings();

    if (!settings) {
      settings = {};
      setPOISettings(settings);
    }
    return settings;
  }

  savePoiSettings(changedSettings) {
    console.log(['changedSettings=',changedSettings]);
    const oldSettings = this.getPoiSettings();
    const newSettings = { ...oldSettings, ...changedSettings };
    setPOISettings(newSettings);
    this.emitChange(changedSettings);
  }

  static handlers = {
    savePoiSettings: 'savePoiSettings',
    getPoiSettings: 'getPoiSettings',
  };
}

export default PoiSettingsStore;
