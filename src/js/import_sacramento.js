#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/sacramento/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'City_Maintained_Trees.csv');

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

  let species = o['BOTANICAL'];
  let cultivar = o['CULTIVAR'];
  let latitude = o['Y'];
  let longitude = o['X'];

  // remove uninteresting sites
  if (
    species == 'Vacant site' ||
    species == 'Stump' ||
    species == 'Unknown species' ||
    species == 'Unknown spp' ||
    species == 'Other spp' ||
    species == 'unplantable site'
  ){
    if (!skipped[species]) {
      console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  let name = species;
  if (cultivar) {
    name += ` '${cultivar}'`;
  }

  let commonName = o['SPECIES'];
  if (commonName.includes(', ')) {
    let s = commonName.split(', ');
    commonName = s[1] + ' ' + s[0];
  }

  sites.push({
    latitude: Number(latitude),
    longitude: Number(longitude),
    //name_botanical: name,
    name_botanical: species,
    name_common: commonName
  });
}

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));

