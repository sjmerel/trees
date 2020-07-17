#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/vancouver/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'street-trees.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  delimiter: ';',
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let geomStr = o['Geom'];
  if (!geomStr) continue;
  let geom = JSON.parse(geomStr);

  let latitude = geom.coordinates[1];
  let longitude = geom.coordinates[0];

  let genus = o['GENUS_NAME'].trim();
  let species = o['SPECIES_NAME'].trim();
  let cultivar = o['CULTIVAR_NAME'].trim();
  let commonName = o['COMMON_NAME'].trim();

  if (species == 'XX') { species = '' };

  let botanicalName = `${genus} ${species}`;
  if (species.endsWith(' X')) {
    botanicalName = `${genus} x ${species.replace(' X','').trim()}`;
  }
  if (cultivar && cultivar != 'XX') {
    botanicalName += ` '${cultivar}'`;
  }

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

  sites.push({
    latitude: latitude,
    longitude: longitude,
    name_botanical: botanicalName,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));

