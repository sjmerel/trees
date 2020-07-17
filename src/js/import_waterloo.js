#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/waterloo/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Street_Tree_Inventory.csv');

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

  let species = o['LATIN_NAME'];
  let latitude = o['Y'];
  let longitude = o['X'];
  let common = o['COM_NAME'];

  species = species.replace('"', "'");

  if (species.endsWith(', var')) { species = species.substr(0, species.length-5); }
  if (species.endsWith('var')) { species = species.substr(0, species.length-3); }
  if (species.endsWith('var.')) { species = species.substr(0, species.length-4); }
  if (common.endsWith(', var')) { common = common.substr(0, common.length-5); }
  if (common.endsWith('var.')) { common = common.substr(0, common.length-4); }

  if (latitude <= 0) { continue; }

  // remove uninteresting sites
  if (species == 'Unknown' ||
      species == 'Not applicable' ||
      species == 'uknown') {
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  sites.push({
    latitude: Number(latitude),
    longitude: Number(longitude),
    name_botanical: species,
    name_common: common
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));





