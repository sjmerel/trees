'use strict';

const CachedMap = require('./cached-map');

////////////////////////////////////////

class DataFinder {
  constructor(path, findFunc) {
    this.map = new CachedMap(path);
    this.findFunc = findFunc;
  }

  async find(key) {
    let value = this.map.get(key);
    if (value === undefined) { // not cached
      value = this.findFunc ? await this.findFunc(key) : this.findFunc;
      if (value !== undefined) {
        this.map.set(key, value);
        this.map.save();
      }
    }
    return value;
  }

  save() {
    this.map.save();
  }
}


////////////////////////////////////////

module.exports = DataFinder;


