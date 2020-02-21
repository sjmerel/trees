'use strict'

const assert = require('assert');

const CachedMap = require('./cached-map');

////////////////////////////////////////

class Corrector {
  constructor(path) {
    this.map = new CachedMap(path, true);
  }

  correct(name) {
    assert(name);
    return this.map.get(name) || name;
  }
}

////////////////////////////////////////

module.exports = Corrector;
