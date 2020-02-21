#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/berkeley/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'City_Trees.csv');

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

  let species = o['SPECIES'];
  let commonName = o['Common_Nam'];
  let latitude = o['Latitude'];
  let longitude = o['Longitude'];

  if (species == 'Planting Site' ||
    species == 'Stump' ||
    species.startsWith('Broadleaf') ||
    species.startsWith('Conifer') ||
    species.length == 0) {
    continue;
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

