#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')
const Classification = require("./classification");

const srcDataDir='../../data/src/montreal/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'arbres-publics.csv', 'utf8');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  quote: '"',
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let species = o['Essence_latin'].trim();
  let longitude = o['Longitude'];
  let latitude = o['Latitude'];

  let commonName = o['ESSENCE_ANG'];
  if (commonName == '' || commonName == 'Other') {
    commonName = o['common_name'];
  }
  if (commonName == 'Other') {
    commonName = '';
  }

  if (!species.length) {
    continue;
  }

  if (species == 'Divers' ||
      species == 'Unknown' ||
      species == 'Other') {
    if (!skipped[species]) {
      // console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  if (latitude < 44 || latitude > 46 || longitude < -74 || longitude > -72) {
    console.log('skipping: ' + latitude + ',' + longitude + ' ' + species);
    continue;
  }

  // species = species.replace(" unidentified", "");
  species = species.replace("Glen's", "Glen’s");
  species = species.replace("'''", "'");
  species = species.replace("''", "'");
  species = species.replace("''", "'");
  species = species.replace(/ \(.*TM\)/, "");

  // console.log(species);

  if (!Classification.parse(species, true)) {
    //console.log(species);
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




