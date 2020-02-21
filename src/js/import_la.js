#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/la/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'Trees_Bureau_of_Street_Services.csv');

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

  // parse botanical name from tooltip
  let tooltip = o['TOOLTIP'];
  let speciesStart = tooltip.indexOf('Botanical Name: ') + 16;
  let speciesEnd = tooltip.indexOf('\\nTree Position: ');
  let species = tooltip.slice(speciesStart, speciesEnd);
  let commonName = o['Common'];

  if (!species.length) {
    continue;
  }

  let lowerSpecies = species.toLowerCase();
  if (lowerSpecies.startsWith('vacant')
    || lowerSpecies.startsWith('other')
    || lowerSpecies.startsWith('dead ')
    || lowerSpecies.startsWith('stump')) {
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  // some are mislabeled with this common name
  if (commonName.toLowerCase() == 'abyssinian banana' && species.toLowerCase() != 'ensete ventricosum') {
    commonName = '';
  }

  sites.push({
    longitude: Number(o['X']),
    latitude: Number(o['Y']),
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
