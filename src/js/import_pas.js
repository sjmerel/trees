#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/pas/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Street_ROW_Trees.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = (o['Genus'] + ' ' + o['Species']).trim();
  let commonName = o['Common_Name'].trim();
  let longitude = o['Longitude'];
  let latitude = o['Latitude'];

  if (!species.length) {
    continue;
  }

  if (species.startsWith('NO ROOM') || 
    species.startsWith('UNDER PROCESS') ||
    species.startsWith('PLANTING SITE') ||
    species.startsWith('STUMP') ||
    species.startsWith('INSUFFICIENT') ||
    species.startsWith('ON GAS LINE') ||
    species.startsWith('Z ADD') ||
    species.startsWith('ZADD') ||
    species.startsWith('OTHER') ||
    species.startsWith('HOMEOWNER') ||
    species.startsWith('_PRIVATE') ||
    species.startsWith('PRIVATE')) {
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  sites.push({
    longitude: Number(longitude),
    latitude: Number(latitude),
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));



