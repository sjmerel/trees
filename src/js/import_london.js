#!/usr/local/bin/node
'use strict'

const Fs = require('fs');
const CsvParse = require('csv-parse/lib/sync')
const Classification = require("./classification");

const srcDataDir='../../data/src/london/';

console.log('reading data');
let csvData = Fs.readFileSync(srcDataDir + 'london_street_trees_gla_20180214.csv', 'utf8');

// fix bad quotes
csvData = csvData.replace(/"queen elizabeth"/g, "'queen elizabeth'");
csvData = csvData.replace(/"italica"/g, "'italica'");
csvData = csvData.replace(/"jacqueline hillier"/g, "'jacqueline hillier'");
csvData = csvData.replace(/"nanum"/g, "'nanum'");
csvData = csvData.replace(/"streetwise"/g, "'streetwise'");
csvData = csvData.replace(/"prin. gold"/g, "'prin. gold'");
csvData = csvData.replace(/"sunset boulevard"/g, "'sunset boulevard'");
csvData = csvData.replace(/" bessoniana"/g, "'bessoniana'");
csvData = csvData.replace(/"marginata"/g, "'marginata'");
csvData = csvData.replace(/"camperdownii"/g, "'camperdownii'");
csvData = csvData.replace(/"new horizon"/g, "'new horizon'");
csvData = csvData.replace(/"skyline"/g, "'skyline'");
csvData = csvData.replace(/Upright "Norway Maple/g, "Norway Maple");
csvData = csvData.replace(/john downie""/g, "'john downie'");
csvData = csvData.replace(/""/g, "");

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

  let species = o['species_name'].trim();
  let longitude = o['longitude'];
  let latitude = o['latitude'];

  let commonName = o['display_name'];
  if (commonName == '' || commonName == 'Other') {
    commonName = o['common_name'];
  }
  if (commonName == 'Other') {
    commonName = '';
  }

  if (!species.length) {
    continue;
  }

  if (species == 'Private tree' || 
    species == 'Stump' ||
    species == 'Capped tree pit [#]' ||
    species == 'Capped tree pit' ||
    species == 'Gone (tree removed)' ||
    species == 'No tree at this location!!!' ||
    species == 'Ad-hoc gristwood & toms works' ||
    species == 'Unk species' ||
    species == 'Asent' ||
    species == 'Potential new planting site' ||
    species == 'Tree removed - stump still remaining' ||
    species == "'Failed planting site'" ||
    species == "'Unknown conifer'" ||
    species == 'Conifer unknown' ||
    species == 'Shrub' ||
    species == 'Shrub sp.' ||
    species == 'Bush' ||
    species == 'Shrubberies' ||
    species == 'Coniferae' ||
    species == 'Coniferae species' ||
    species == 'Woodland' ||
    species == 'Woodland edge' ||
    species == 'Woodland group' ||
    species == 'Deciduous' ||
    species == 'Deciduous unknown' ||
    species == 'Footpath' ||
    species == 'Other conifer species' ||
    species == 'Other broadleaved species' ||
    species == 'Whole site woodland safety zon' ||
    species == 'Willus youfindus bogus-taxus' ||
    species.startsWith('Zz ') ||
    species.startsWith("'Vacant") ||
    species.startsWith('Vacant') ||
    species.startsWith('Various') ||
    species.startsWith('Unknown') ||
    species.startsWith("'Mix ") ||
    species.startsWith('Mixed ') ||
    species.startsWith('Group ') ||
    species == "'New tree site" ||
    species == 'New tree site' ||
    species == "'Unlisted" ||
    species == 'No code allocated' ||
    species == 'Not applicable') {
    if (!skipped[species]) {
      // console.log('skipping: ' + species);
      skipped[species] = true;
    }
    continue;
  }

  species = species.replace(" unidentified", "");
  species = species.replace(" unidentifed species", "");
  species = species.replace(" unidentified species", "");
  species = species.replace(" inidentified species", "");
  species = species.replace(" unident species", "");
  species = species.replace(" uniden", "");
  species = species.replace(" unidentified variety", "");
  species = species.replace(" unidentified hybrid", "");
  species = species.replace(" 'unidentified variety'", "");
  species = species.replace(" 'unidentified v", "");
  species = species.replace(" 'unidentified", "");
  species = species.replace(" 'unidenti", "");
  species = species.replace(" 'uniden", "");
  species = species.replace(" 'unid", "");
  species = species.replace(" unk species", "");
  species = species.replace(" unk hybrid", "");
  species = species.replace(" unknown species", "");
  species = species.replace(" unknown hybrid", "");
  species = species.replace(" unknown var", "");
  species = species.replace(" unkown var.", "");
  species = species.replace(" unknown", "");
  species = species.replace(" 'unknown vari", "");
  species = species.replace(" 'ukn variety", "");
  species = species.replace(" 'unk variety'", "");
  species = species.replace(" 'unknown variety'", "");

  species = species.replace(" (unknown)", "");
  species = species.replace(" - cultivar unknown", "");
  species = species.replace("Sp. ", "");
  species = species.replace("Pru'", "Prunus");
  species = species.replace("Sor'", "Sorbus");
  species = species.replace("`", "'");
  species = species.replace("  ", " ");
  species = species.replace("�", " ");

  species = species.replace(/ - cultivar$/, "");
  species = species.replace(/ cultivar$/, "");
  species = species.replace(/ unk$/, "");
  species = species.replace(/ variety$/, "");
  species = species.replace(/ group$/, "");
  species = species.replace(/ (group)$/, "");
  species = species.replace(/ species$/, "");
  species = species.replace(/ spp.$/, "");
  species = species.replace(/ sp.$/, "");
  species = species.replace(/ spp$/, "");
  species = species.replace(/ type$/, "");
  species = species.replace(/ ,.*$/, "");

  species = species.replace(/^Acer plat /, "Acer platanoides");
  species = species.replace(/^Acer pseudo /, "Acer pseudoplatanus");
  species = species.replace(/^Carpinus bet. /, "Carpinus betulus");

  if (latitude < 51 || latitude > 53 || longitude < -1 || longitude > 1) {
    console.log('skipping: ' + latitude + ',' + longitude + ' ' + species);
    continue;
  }

  // console.log(species);

  if (!Classification.parse(species, true)) {
  //  console.log(species);
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




