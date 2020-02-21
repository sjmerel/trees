#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/denver/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'tree_inventory.csv');

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
for (let o of data) {

  let species = o['SPECIES_BOTANIC'].trim();
  let latitude = o['Y_LAT'];
  let longitude = o['X_LONG'];

  // remove uninteresting sites
  if (
    !species ||
    species == 'Vacant site' ||
    species == 'Stump' ||
    species == 'Other' ||
    species == 'N/A' ||
    species == 'unknown' ||
    species == 'Unknown species' ||
    species == 'Broadleaf Deciduous Small Other' ||
    species == 'Conifer Evergreen Large Other' ||
    species == 'ddigs tree'
  ){
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  let commonName = o['SPECIES_COMMON'];
  if (commonName.includes(', ')) {
    let s = commonName.split(', ');
    commonName = s[1] + ' ' + s[0];
  }

  sites.push({
    latitude: Number(latitude),
    longitude: Number(longitude),
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));


