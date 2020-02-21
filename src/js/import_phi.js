#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/phi/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'tree_export_6z9Kpu2.csv');

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

  if (!o) { continue; }

  let genus = o['Genus'];
  let species = o['Species'];
  let cultivar = o['Cultivar'];
  let commonName = o['Common Name'];
  let latitude = o['Point Y'];
  let longitude = o['Point X'];

  if (!genus.length) {
    continue;
  }

  let botanicalName = `${genus} ${species}`;
  if (cultivar) {
    botanicalName += ` '${cultivar}'`;
  }

  if (latitude < 39.5 || latitude > 40.34 || longitude < -75.55 || longitude > -74.8) {
    console.log('skipping: ' + latitude + ',' + longitude + ' ' + botanicalName);
    continue;
  }

  sites.push({
    longitude: Number(longitude),
    latitude: Number(latitude),
    name_botanical: botanicalName,
    name_common: commonName
  });
}
console.log(sites.length);

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));


