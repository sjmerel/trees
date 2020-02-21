#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/santamonica/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Trees_Inventory.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = o['Name Botanical'];
  let latitude = o['Latitude'];
  let longitude = o['Longitude'];

  // remove uninteresting sites
  if (species.startsWith('Stump') 
    || species == 'Other tree'
    || species == 'No Replant'
    || species == 'Asphalted well'
    || species == 'Unidentified spp.'
    || species == 'Vacant site'
    || species == 'Unsuitable site') {
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
    name_common: o['Name Common']
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
