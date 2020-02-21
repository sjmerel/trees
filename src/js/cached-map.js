'use strict';

const fs = require('fs');

class CachedMap extends Map {
  constructor(path, ignoreCase = false) {
    if (path && fs.existsSync(path)) {
      let obj = JSON.parse(fs.readFileSync(path));
      let entries = Object.entries(obj);
      if (ignoreCase) {
        for (let e of entries) {
          e[0] = e[0].toLowerCase();
        }
      }
      super(entries);
    }
    else {
      super();
    }
    this.path = path;
    this.ignoreCase = ignoreCase;
  }

  get(key) {
    if (this.ignoreCase) {
      key = key.toLowerCase();
    }
    return super.get(key);
  }

  set(key, value) {
    if (this.ignoreCase) {
      key = key.toLowerCase();
    }
    return super.set(key, value);
  }

  save() {
    if (this.path) {
      let obj = {};
      for (let [k,v] of this) {
        obj[k] = v;
      }
      fs.writeFileSync(this.path, JSON.stringify(obj, null, 2));
    }
  }
}


////////////////////////////////////////

module.exports = CachedMap;

