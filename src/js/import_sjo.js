#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/sjo/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Trees__Special_Districts.csv');

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

  let species = o['NAMESCIENTIFIC'];
  let latitude = o['Y'];
  let longitude = o['X'];

  // remove uninteresting sites
  if (
    species == 'Vacant site' ||
    species == 'Stump' ||
    species == 'Unknown' ||
    species == 'Other' 
  ){
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
    name_common: ''
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));



