'use strict'

const request = require('request-promise');
const assert = require('assert');

const DataFinder = require('./data-finder');
const MultiDataFinder = require('./multi-data-finder');
const Classification = require('./classification');
const Util = require('./util');

////////////////////////////////////////

async function findItis(name) {
  let response = await request({
    uri: `https://www.itis.gov/ITISWebService/jsonservice/searchByScientificName?srchKey=${encodeURI(name)}`,
    json: true
  });

  if (response.scientificNames[0] == null) {
    return null;
  }

  let result = response.scientificNames.find(o => o.combinedName == name);
  if (!result) {
    return null;
  }

  response = await request({
    uri: `https://www.itis.gov/ITISWebService/jsonservice/getCommonNamesFromTSN?tsn=${result.tsn}`,
    json: true
  });

  if (response.commonNames[0] == null) {
    return null; //[];
  }

  return response.commonNames
    .filter(o => o.language == 'English')
    .map(o => Util.startCase(o.commonName));
}

////////////////////////////////////////

async function findCol(name) {

  // remove markers ('var.', etc)
  name = Classification.parse(name).unparse({cultivar:false, infraspecies:true, infraspeciesMarkers:false});

  let response = await request({
    uri: `http://webservice.catalogueoflife.org/col/webservice?name=${encodeURI(name)}&format=json&response=full`,
    json: true
  });

  if (response.total_number_of_results == 0) {
    return null;
  }

  let result = response.results.find(o => o.name == name);
  if (!result) {
    return null;
  }

  if (!result.common_names) {
    return null;
  }

  return result.common_names
    .filter(o => o.language == null || o.language.includes('Eng'))
    .filter(o => o.country == null || o.country.includes('USA')) // TODO other countries?
    .map(o => Util.startCase(o.name));
}

////////////////////////////////////////

class CommonNameFinder extends MultiDataFinder {
  constructor(dir) {
    super([
     new DataFinder(`${dir}/common_name_itis.json`, findItis),
     new DataFinder(`${dir}/common_name_col.json`, findCol),
     new DataFinder(`${dir}/common_name_manual.json`, null),
    ]);
  }
}

////////////////////////////////////////

module.exports = CommonNameFinder;

