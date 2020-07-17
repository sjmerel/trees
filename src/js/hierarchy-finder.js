'use strict'

const request = require('request-promise');
const assert = require('assert');

const DataFinder = require('./data-finder');
const MultiDataFinder = require('./multi-data-finder');
const Classification = require('./classification');

////////////////////////////////////////

async function findItis(name) {
  let response = await request({
    uri: `https://www.itis.gov/ITISWebService/jsonservice/searchByScientificName?srchKey=${encodeURI(name)}`,
    json: true
  });

  if (response.scientificNames[0] == null) {
    return null;
  }

  let result = response.scientificNames.find(o => o.combinedName == name && o.kingdom == 'Plantae');
  if (!result) {
    return null;
  }

  response = await request({
    uri: `https://www.itis.gov/ITISWebService/jsonservice/getFullHierarchyFromTSN?tsn=${result.tsn}`,
    json: true
  });

  let hierarchy = {};
  for (let h of response.hierarchyList) {
    if (h.rankName == 'Kingdom' ||
      h.rankName == 'Division' ||
      h.rankName == 'Class' ||
      h.rankName == 'Order' ||
      h.rankName == 'Family' ||
      h.rankName == 'Phylum') {
      let rankName = h.rankName;
      if (rankName == 'Division') { rankName = 'Phylum'; }
      hierarchy[rankName.toLowerCase()] = h.taxonName;
    }
  }

  return hierarchy;
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

  let results = response.results.filter(o => o.name == name);
  if (results.length == 0) {
    return null;
  }

  for (let result of results) {
    let hierarchy = {};
    for (let h of result.classification) {
      hierarchy[h.rank.toLowerCase()] = h.name;
    }
    if (hierarchy.kingdom == 'Plantae') {
      return hierarchy;
    }
  }

  return null;
}


////////////////////////////////////////

class HierarchyFinder extends MultiDataFinder {
  constructor(dir) {
    super([
     new DataFinder(`${dir}/hierarchy_override.json`, undefined),
     new DataFinder(`${dir}/hierarchy_itis.json`, findItis),
     new DataFinder(`${dir}/hierarchy_col.json`, findCol),
     new DataFinder(`${dir}/hierarchy_manual.json`, null),
    ]);
  }
}

////////////////////////////////////////

module.exports = HierarchyFinder;

/*
async function main()
{
  let n = new DataFinder('', findItis);
  let nn = await n.find('Olea europaea');
  console.log(nn);
}
(async function() { await main(); })();
*/
