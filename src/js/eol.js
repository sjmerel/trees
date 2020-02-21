#!/usr/local/bin/node

let Fs = require("fs");
var RequestPromise = require('request-promise');

////////////////////////////////////////

async function main() {

  let speciesArray = JSON.parse(Fs.readFileSync('../../data/species.json'));
  for (let species of speciesArray) {
    let params = {
      //uri: `https://eol.org/api/search/1.0.json?q=${encodeURI(species.name_botanical)}`,
      //uri: `https://eol.org/api/pages/1.0/${species.eol_id}.json?taxonomy=true&details=true&common_names=true&synonyms=true&subjects=all`,
      //uri: `https://eol.org/api/search/1.0.json?q=Lophostemon%20confertus`,
      uri: `https://eol.org/api/pages/1.0/2508670.json?taxonomy=true&details=true&common_names=true&synonyms=true&subjects=all`,
      // uri: `https://eol.org/api/pages/1.0/47286320.json?taxonomy=true&details=true&common_names=true&synonyms=true&subjects=all`,
      json: true
    };
    console.log(params.uri);
    try {
      let response = await RequestPromise(params);
      /*
    let eolName = response.taxonConcept.scientificName;
    if (!eolName.startsWith(sp.name_botanical)) {
      console.log(`${species.name_botanical} -> ${eolName}`);
    }
    */
      console.log(JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      console.log(species.name_botanical + ': error');
    }
    return;
  }
}


////////////////////////////////////////

(async function() { await main(); })();
