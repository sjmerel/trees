'use strict'

const request = require('request-promise');
const assert = require('assert');

const DataFinder = require('./data-finder');
const MultiDataFinder = require('./multi-data-finder');
const Classification = require('./classification');
const Util = require('./util');

////////////////////////////////////////

async function find(name) {
  // name = Classification.parse(name).unparse({cultivar:false, infraspecies:false, infraspeciesMarkers:false});

  let response = await request({
    uri: `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srprop=redirecttitle&utf8=&format=json&srsearch=${name}`,
    json: true
  });

  let results = response.query.search;
  if (results.length == 0) {
    return null;
  }
  let match = results.find(o => o.title == name || o.redirecttitle == name);
  if (!match) {
    match = results[0];
  }
  let title = match.title;

  // check for Plantae taxonomy template
  response = await request({
    uri: `https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&pageid=${results[0].pageid}`,
    json: true
  });

  if (!response.parse.text['*'].includes('Plantae')) {
    console.log(' rejected');
    return null;
  }

  return encodeURI(title.replace(/ /g, '_'));
}

async function findWithoutCache(name) {
  let value = await find(name);
  if (!value) {
    return undefined;
  }
}

////////////////////////////////////////

class WikipediaFinder extends MultiDataFinder {
  constructor(dir) {
    super([
     new DataFinder(`${dir}/wikipedia_override.json`, undefined),
     new DataFinder(`${dir}/wikipedia.json`, find),
     new DataFinder(`${dir}/wikipedia_manual.json`, null),
    ]);
  }
}

////////////////////////////////////////

module.exports = WikipediaFinder;

// (async function() { console.log(await find('callistemon citrinus')); })();
