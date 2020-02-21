#!/usr/local/bin/node

let Fs = require("fs");
var RequestPromise = require('request-promise');

const dataDir='../../data/';

////////////////////////////////////////

/*
async function main() {

  let speciesArray = JSON.parse(Fs.readFileSync(dataDir + 'species.json'));

  let count = speciesArray.reduce((count, o) => { return o['classification'] ? count+1 : count }, 0);
  console.log(`${count}/${speciesArray.length} classified`);

  for (let species of speciesArray) {

    if (species['classification']) {
      // already have classification for this one
      continue;
    }

    let name = species.name_botanical;
    console.log(name);

    name = name.replace(/ spp.$/, ''); // look up genus
    name = name.replace(/ \'.*\'$/, ''); // remove cultivars

    let params = {
      uri: `http://webservice.catalogueoflife.org/col/webservice?name=${encodeURI(name)}&format=json&response=full`,
      json: true
    };
    try {
      let response = await RequestPromise(params);
      let record = response.results[0];

      if (record['accepted_name']) {
        // this is a synonum
        record = record['accepted_name'];
      }

      let classificationObj = {};
      for (c of record.classification) {
        classificationObj[c.rank] = c.name;
      }
      if (Object.keys(classificationObj).length > 0) {
        species['classification'] = classificationObj;
        console.log(JSON.stringify(classificationObj, null, 2));
      }
      //console.log(JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      console.log(species.name_botanical + ': error');
    }
  }

  Fs.writeFileSync(dataDir + 'species.json', JSON.stringify(speciesArray, null, 2));
}
*/

async function main() {

  let speciesArray = JSON.parse(Fs.readFileSync(dataDir + 'species.json'));
  let synonymMap = JSON.parse(Fs.readFileSync(dataDir + 'synonym.json'));
  let correctionMap = JSON.parse(Fs.readFileSync(dataDir + 'correction.json'));

  for (let species of speciesArray) {

    let correction = correctionMap[species];
    if (correction) {
      //console.log(' corrected to ' + correction);
      species = correction;
    }

    species = species.replace(/ spp.$/, ''); // look up genus
    species = species.replace(/ \'.*\'$/, ''); // remove cultivars

    // TODO search first just removing 'ssp' or 'var'
    species = species.replace(/ ssp.*$/, ''); // remove subspecies
    species = species.replace(/ var\. .*$/, ''); // remove variety

    // console.log(synonymMap[species]);
    if (synonymMap[species] !== undefined) {
      continue;
    }

    console.log(species);
    let params = {
      uri: `http://webservice.catalogueoflife.org/col/webservice?name=${encodeURI(species)}&format=json&response=full`,
      json: true
    };
    try {
      let response = await RequestPromise(params);
      if (response.total_number_of_results == 0) {
        console.log(' no results');
        continue;
      }
      let record = response.results[0];

      if (record.name_status == 'accepted name') {
        // it's an accepted name
        synonymMap[species] = null;
      }
      else {
        // it's a synonym
        synonymMap[species] = record.accepted_name.name;
        console.log(` -> ${record.accepted_name.name}`);
      }
      Fs.writeFileSync(dataDir + 'synonym.json', JSON.stringify(synonymMap, null, 2));

      //console.log(JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      console.log(species + ': error');
    }
  }

  // sort
  let sortedMap = {};
  for (let k of Object.keys(synonymMap).sort()) {
    sortedMap[k] = synonymMap[k];
  }
  synonymMap = sortedMap;

  Fs.writeFileSync(dataDir + 'synonym.json', JSON.stringify(synonymMap, null, 2));
}


////////////////////////////////////////

(async function() { await main(); })();


