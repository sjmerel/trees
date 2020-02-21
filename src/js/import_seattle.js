#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/seattle/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Trees.csv');

// remove BOM
csvData = csvData.slice(3); 

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
let truncated = {};
for (let o of data) {

  let species = o['SCIENTIFIC_NAME'];
  let commonName = o['COMMON_NAME'];
  let longitude = o['X'];
  let latitude = o['Y'];

  if (!species.length) {
    continue;
  }

  if (species == 'Unknown' || species == 'Planting Site') {
    continue;
  }
  if (species.length > 30) {
    throw 'too long!';
  }
  // if (species.length == 30) {
    // truncated[species] = null;
  // }
  if (species.length < 30 && species.replace(/`/g, "'").split("'").length == 2) {
    truncated[species] = null;
  }

  species = species.replace(/`/g, "'");
  commonName = commonName.replace(/`/g, "'");

  sites.push({
    longitude: Number(longitude),
    latitude: Number(latitude),
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));

console.log('possibly truncated:');
for (let e of Object.entries(truncated)) {
  console.log(e[0]);
}




