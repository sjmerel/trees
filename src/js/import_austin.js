#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/austin/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Downtown_Tree_Inventory_2013.csv');

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
  let commonName = o['COM_NAME'];
  let geom = o['the_geom'];
  let start = geom.indexOf('(');
  let end = geom.indexOf(')');
  let pos = geom.slice(start+1, end).split(' ');
  let latitude = pos[1];
  let longitude = pos[0];

  if (species == 'Other Tree' ||
    species == 'Stump' || 
    species.startsWith('Vacant Planting Site') ||
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


