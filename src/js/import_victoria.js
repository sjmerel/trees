#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/victoria/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Tree_Species.kml.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = o['Species'];
  let latitude = o['Y'];
  let longitude = o['X'];

  // remove uninteresting sites
  if (species == 'Wildlife snag'
    || species == 'Other'
    || species == 'Unknown'
    || species.startsWith('Broadleaf ')
    || species.startsWith('Conifer ')
    || species.startsWith('Deciduous ')) {
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
    name_common: o['CommonName']
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
