#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')

const srcDataDir='../../data/src/laco/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'LACO-Park-Trees-Phase-3.csv');

console.log('parsing data');
let data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

console.log('processing data');
let sites = [];
let skipped = {};
for (let o of data) {

  let name_botanical = o['BOTANICAL'];
  let name_common = o['COMMON'];
  let latitude = o['LATITUDE'];
  let longitude = o['LONGITUDE'];

  sites.push({
    latitude: Number(latitude),
    longitude: Number(longitude),
    name_botanical: name_botanical,
    name_common: name_common,
  });
}

console.log('reading data');
csvData = Fs.readFileSync(srcDataDir + 'LACO-Park-Trees-Phases-1-and-2.csv');

console.log('parsing data');
data = CsvParse(csvData, {
  columns: true,
  skip_empty_lines: true
});

/*
console.log('processing data');
for (let o of data) {

  let name_botanical = o['Type'];
  let name_common = '';
  let northing = Number(o['Northing']);
  let easting = Number(o['Easting']);

  const k0 = 0.9996;
  const E0 = 500; // km
  const a = 6378.137; 
  const f = 1 / 298.257223563;
  const N0 = 0;
  
  let n = f/(2-f);
  let A = (a/(1+n))*(1 + n*n/4 + n*n*n*n/64);

  let xi = (northing-N0)/(k0*A);
  let eta = (easting-E0)/(k0*A);
  let xii = 



  sites.push({
    latitude: latitude,
    longitude: longitude,
    name_botanical: name_botanical,
    name_common: name_common,
  });
}
*/

console.log('writing data');
Fs.writeFileSync(srcDataDir + 'data.json', JSON.stringify(sites, null, 2));
