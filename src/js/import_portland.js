#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/portland/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Street_Trees.csv');

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

  let species = o['Scientific'];
  let latitude = o['Y'];
  let longitude = o['X'];

  species = species.replace('‘', '\'').replace('’', '\'');

  // remove uninteresting sites
  if (species == 'unknown') {
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
    name_common: o['Common']
  });
}
console.log(sites.length);

////////////////////////////////////////

console.log('reading data');
csvData = Fs.readFileSync(srcDataDir + 'Heritage_Trees.csv');

// remove BOM
csvData = csvData.slice(3); 

console.log('parsing data');
data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
for (let o of data) {

  let species = o['SCIENTIFIC'];
  let latitude = o['Y'];
  let longitude = o['X'];

  species = species.replace('‘', '\'').replace('’', '\'');

  // remove uninteresting sites
  if (species == 'unknown') {
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
    name_common: o['COMMON']
  });
}
console.log(sites.length);

////////////////////////////////////////

console.log('reading data');
csvData = Fs.readFileSync(srcDataDir + 'Parks_Tree_Inventory.csv');

// remove BOM
csvData = csvData.slice(3); 

console.log('parsing data');
data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
for (let o of data) {

  let [species, common] = o['Species'].split(', ');
  let latitude = o['Y'];
  let longitude = o['X'];

  species = species.replace('‘', '\'').replace('’', '\'');
  let synIndex = species.indexOf('syn.');
  if (synIndex >= 0) { species = species.substring(0, synIndex); }

  // remove uninteresting sites
  if (species == 'unknown' || species == 'Unknown (dead)') {
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
    name_common: common || ''
  });
}
console.log(sites.length);

////////////////////////////////////////
console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
