#!/usr/local/bin/node

let Fs = require("fs");
var RequestPromise = require('request-promise');

const dataDir='../../data/';

////////////////////////////////////////

async function main() {

  let speciesArray = JSON.parse(Fs.readFileSync(dataDir + 'species.json'));
  for (let species of speciesArray) {
    let params = {
      uri: `http://www.itis.gov/ITISWebService/jsonservice/searchByScientificName?srchKey=${encodeURI(species.name_botanical)}`,
      json: true
    };
    try {
      let response = await RequestPromise(params);
      let record = response.scientificNames[0];
      console.log(`${species.name_botanical} -> ${record.combinedName}`);
      let tsn = record.tsn;
      //console.log(JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      console.log(species.name_botanical + ': error');
    }
  }
}


////////////////////////////////////////

(async function() { await main(); })();

