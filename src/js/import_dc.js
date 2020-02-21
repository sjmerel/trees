#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/dc/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Urban_Forestry_Street_Trees.csv');

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

  let species = o['SCI_NM'];
  let commonName = o['CMMN_NM'];
  let latitude = o['Y'];
  let longitude = o['X'];

  if (species == 'Other (See Notes)' ||
    species == 'No Tree' ||
    species.length == 0) {
    continue;
  }
  if (commonName == 'Other (See Notes)') {
    commonName = '';
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

