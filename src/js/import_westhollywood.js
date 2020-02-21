#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/westhollywood/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'City_Tree_Inventory.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = o['BotanicalName'].trim(); // has leading space
  let commonName = o['CommonName'].trim(); // has leading space

  if (!species.length) {
    continue;
  }

  if (species.startsWith('Vacant') || 
    species.startsWith('Stump') ||
    species.startsWith('WCA ')) {
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  // parse lat/lng from address
  let location = o['Location'];
  let latitudeStart = location.lastIndexOf('(') + 1;
  let longitudeEnd = location.lastIndexOf(')');
  let latitudeEnd = location.indexOf(',', latitudeStart);
  let longitudeStart = location.lastIndexOf(' ', longitudeEnd) + 1;
  let latitude = location.slice(latitudeStart, latitudeEnd);
  let longitude = location.slice(longitudeStart, longitudeEnd);

  sites.push({
    longitude: Number(longitude),
    latitude: Number(latitude),
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));


