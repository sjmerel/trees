'use strict'

const request = require('request-promise');
const assert = require('assert');

const DataFinder = require('./data-finder');
const MultiDataFinder = require('./multi-data-finder');
const Classification = require('./classification');

////////////////////////////////////////

async function findItis(name) {
  // use x for hybrid marker
  name = name.replace('×', 'X');

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

  let resolvedName = result.combinedName;

  response = await request({
    uri: `https://www.itis.gov/ITISWebService/jsonservice/getAcceptedNamesFromTSN?tsn=${result.tsn}`,
    json: true
  });

  if (response.acceptedNames[0] != null) {
    resolvedName = response.acceptedNames[0].acceptedName;
  }

  return resolvedName;
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

  let acceptedResult = null;
  if (result.name_status == 'accepted name') {
    acceptedResult = result;
  }
  else if (result.accepted_name) {
    acceptedResult = result.accepted_name;
  }

  if (!acceptedResult) {
    return null;
  }

  if (acceptedResult.rank == 'Species' || acceptedResult.rank == 'Infraspecies') {
    let resolvedName = `${acceptedResult.genus} ${acceptedResult.species}`;
    if (acceptedResult.infraspecies) {
      resolvedName += ` ${acceptedResult.infraspecies_marker} ${acceptedResult.infraspecies}`;
    }
    return resolvedName;
  }
  else if (acceptedResult.rank == 'Genus') {
    return acceptedResult.name;
  }
  else {
    return null;
  }
}

////////////////////////////////////////

class ResolvedNameFinder  {
  constructor(dir) {
    this.finders = [
     new DataFinder(`${dir}/resolved_name_itis.json`, findItis),
     new DataFinder(`${dir}/resolved_name_col.json`, findCol),
    ];
    this.manualFinder = new DataFinder(`${dir}/resolved_name_manual.json`, null);
  }

  async find(key) {
    // first check raw name
    for (let finder of this.finders) {
      let value = await finder.find(key);
      if (value) { 
        return value;
      }
    }

    // check swapped name (for london really)
    let newClassification = Classification.parse(key);
    let genus = newClassification.genus;
    newClassification.genus = newClassification.species;
    newClassification.species = genus;
    let newKey = newClassification.unparse();
    console.log(`${key} -> ${newKey}`);
    for (let finder of this.finders) {
      let value = await finder.find(newKey);
      if (value) { 
        return value;
      }
    }

    // if of the format "genus x species", try without hybrid marker (i.e. "genus species")
    let classification = Classification.parse(key);
    if (classification.species_hybrid && typeof classification.species == 'string') {
      let newKey = key.replace(' × ', ' ');
      for (let finder of this.finders) {
        let value = await finder.find(newKey);
        if (value) { 
          return value;
        }
      }
    }

    // finally use manual finder
    let value = await this.manualFinder.find(key);
    if (value) { 
      return value;
    }

    return null;
  }
}

////////////////////////////////////////

module.exports = ResolvedNameFinder;

/*
async function main()
{
  let finder = new ResolvedNameFinder('../../data/src', findItis);
  let name = await finder.find('Citrus x paradisi');
  console.log(name);
}
(async function() { await main(); })();
*/
