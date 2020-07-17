#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/cambridge/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'ENVIRONMENTAL_StreetTrees.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let scientific = o['Scientific'];
  let cultivar = o['Cultivar'];
  let common = o['CommonName'];
  let point = o['the_geom'];

  point = point.replace('POINT (', '');
  point = point.replace(')', '');
  let xy = point.split(' ');
  let latitude = xy[1];
  let longitude = xy[0];

  if (!scientific) { continue; }

  /*
  // remove uninteresting sites
  if (species.startsWith('Stump') 
    || species == 'Other tree'
    || species == 'No Replant'
    || species == 'Asphalted well'
    || species == 'Unidentified spp.'
    || species == 'Vacant site'
    || species == 'Unsuitable site') {
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }
  */
  let botanical = scientific;
  if (cultivar) {
    botanical += ` '${cultivar}'`;
  }

  sites.push({
    latitude: Number(latitude),
    longitude: Number(longitude),
    name_botanical: botanical,
    name_common: common
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));

