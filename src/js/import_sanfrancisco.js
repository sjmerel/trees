#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/sanfrancisco/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Street_Tree_List.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = o['qSpecies'];
  let latitude = Number(o['Latitude']);
  let longitude = Number(o['Longitude']);

  let [ name_botanical, name_common ] = species.split('::').map(o => o.trim());

  if (name_botanical == 'Tree(s)' ||
    name_botanical == 'Potential Site' ||
    name_botanical == 'Shrub' ||
    name_botanical == 'Private shrub') {
    if (!skipped[name_botanical]) {
      console.log('skipping: ' + name_botanical);
      skipped[name_botanical] = true;
    }
    continue;
  }

  // some sites are way out in the ocean for some reason
  if (longitude < -125 || longitude > -120) {
    console.log('skipping: ' + latitude + ',' + longitude + ' ' + name_botanical);
    continue;
  }

  // one site way south, surely a mistake
  if (latitude < 37.6) {
    console.log('skipping: ' + latitude + ',' + longitude + ' ' + name_botanical);
    continue;
  }

  if (name_botanical == 'Palm (unknown Genus)') {
    name_botanical = 'Palm'; // XXX not a genus
  }

  sites.push({
    latitude: latitude,
    longitude: longitude,
    name_botanical: name_botanical,
    name_common: name_common
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
