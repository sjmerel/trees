'use strict';

////////////////////////////////////////

class MultiDataFinder {
  constructor(finders) {
    this.finders = finders;
  }

  async find(key) {
    for (let finder of this.finders) {
      let value = await finder.find(key);
      if (value) { 
        return value;
      }
    }
    return null;
  }
}


////////////////////////////////////////

module.exports = MultiDataFinder;



