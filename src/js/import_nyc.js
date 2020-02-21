#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/nyc/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + '2015StreetTreesCensus_TREES.csv');

// remove BOM
csvData = csvData.slice(3); 

/*
let line = 1;
const lines_per = 100000;
for (;;) {
  console.log('parsing data');
  let data = CsvParse(csvData, {
    columns: true,
    //skip_empty_lines: true,
    from_line: line,
    to_line: line + lines_per
  });
  line += lines_per;
  }
  */

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  if (!o) { continue; }

  let species = o['spc_latin'];
  let commonName = o['spc_common'];
  let latitude = o['Latitude'];
  let longitude = o['longitude'];

  if (!species.length) {
    continue;
  }

  sites.push({
    longitude: Number(longitude),
    latitude: Number(latitude),
    name_botanical: species,
    name_common: commonName
  });
}
console.log(sites.length);

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));


