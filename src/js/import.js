#!/usr/local/bin/node
'use strict'

const fs = require('fs');
const request = require('request-promise');
const assert = require('assert');

const Util = require('./util');
const Classification = require("./classification");
const Corrector = require("./corrector");

const ResolvedNameFinder = require("./resolved-name-finder");
const HierarchyFinder = require("./hierarchy-finder");
const CommonNameFinder = require("./common-name-finder");
const WikipediaFinder = require("./wikipedia-finder");


const dataDir='../../data/';
const datasets=[
'austin', 
'berkeley', 
'washingtondc', 
'denver',
'losangeles', 
'london', 
'montreal',
'newyorkcity', 
'oakland', 
'pasadena', 
'philadelphia', 
'sacramento', 
'seattle', 
'sanfrancisco', 
'sanjose', 
'santamonica', 
'westhollywood'];

// process:
// - read data.json
// - remove sites with empty names or locations
// - remove duplicate sites
// - for each site:
//   - correct (with cultivar) from data/src/code/correction.json, to fix problems that will prevent parsing.
//   - correct (without cultivar) from data/src/correction.json, to fix typos etc.
//   - resolve (without cultivar)
//     - look up in ITIS (cached in resolved_name_itis.json)
//     - look up in Catalogue of Life (cached in resolved_name_col.json)
//     - look up in resolved_name_manual.json
//     - if not found, add to resolved_name_manual.json as null
//   - find hierarchy (from genus up)
//   - find common names (with cultivar)
//     - look up in ITIS (cached in common_names_itis.json)
//     - look up in Catalogue of Life (cached in common_names_col.json)
//     - look up in common_names_manual.json
//     - if not found, add to common_names_manual.json as null
//   - if common name from data.json is not in the result, add it
//   - find wikipedia entry
//     - search by name
//     - reject if first result's page text does not contain 'Plantae'

// - run import.js 
// - if there are parsing failures (typically from missing infraspecific marker or missing quotes around cultivar)
//   - resolve in data/src/<code>/correction.json 
//   - run import again
// - if there are hierarchy failures (from incorrectly spelled genus)
//   - resolve in data/src/resolved_name_manual.json 
//   - run import again
// - look at data/src/resolved_name_manual.json
//   - google search
//     - if misspelling, correct spelling in global or local correction.json
//     - if wikipedia page, use their binomial name
//     - otherwise make a best guess
// - look at data/src/hierarchy_manual.json
//   - remove nulls and run again - should have been fixed in resolved_name_manual.json
// - look at data/src/common_name_manual.json
//   - remove nulls and weird foreign translations and run again
//   - what's left should be hybrids and obscure species; fix manually by googling


// TODO 
//  - move misspellings to global correction list
//  - get wikipedia page, check for "Plantae"?
//  - how to eliminate obvious foreign names from common_name_col.json?
//  - Palm is not a genus, but listed as such in LA data.json


////////////////////////////////////////

function interp(f, v0, v1) {
  return v0 + f * (v1 - v0);
}

////////////////////////////////////////

function hsvToRgb(h, s, v) {
  var r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r, g, b ];
}

////////////////////////////////////////

function assignColors(speciesMap) {
  // first build a map of family -> genus -> species
  // (ignoring infraspecific taxons and cultivars...?)
  let colorMap = {};
  for (let o of Object.values(speciesMap)) {
    let family = o.hierarchy.family
    let genus = o.hierarchy.genus
    let species = o.hierarchy.species

    let familyObj = colorMap[family];
    if (!familyObj) {
      familyObj = {};
      colorMap[family] = familyObj;
    }

    let genusObj = familyObj[genus];
    if (!genusObj) {
      genusObj = {};
      familyObj[genus] = genusObj;
    }

    let speciesKey = '';
    if (species) {
      speciesKey = species.toString(); // in case of array
    }
    let speciesArray = genusObj[speciesKey];
    if (!speciesArray) {
      speciesArray = [];
      genusObj[speciesKey] = speciesArray;
    }

    speciesArray.push(o);
  }

  const h0 = 0/360;
  const h1 = 360/360;
  const s0 = 0.5;
  const s1 = 1.0;
  const b0 = 0.4;
  const b1 = 0.9;

  let familyKeys = Object.keys(colorMap).sort();
  // console.log('families:' + familyKeys.length);
  for (let familyIndex = 0; familyIndex < familyKeys.length; ++familyIndex) {
    let familyKey = familyKeys[familyIndex];
    let familyObj = colorMap[familyKey];
    let h = interp(familyIndex/familyKeys.length, h0, h1);

    let genusKeys = Object.keys(familyObj).sort();
    // console.log(`${familyKey}: ${genusKeys.length}`);

    for (let genusIndex = 0; genusIndex < genusKeys.length; ++genusIndex) {
      let genusKey = genusKeys[genusIndex];
      let genusObj = familyObj[genusKey];

      let s = interp(genusIndex/(genusKeys.length+1), s0, s1);
      let speciesKeys = Object.keys(genusObj).sort();
      // console.log(`    ${genusKey}: ${speciesKeys.length}`);

      for (let speciesIndex = 0; speciesIndex < speciesKeys.length; ++speciesIndex) {
        let b = interp(speciesIndex/(speciesKeys.length+1), b0, b1);
        let speciesKey = speciesKeys[speciesIndex];
        let speciesArray = genusObj[speciesKey];
        let rgb = hsvToRgb(h, s, b);
        for (let o of speciesArray) {
          o.color = rgb;
        }
        // console.log(`        ${rgb} ${speciesArray}`);
      }
    }
  }
}

////////////////////////////////////////

function updateSiteCount(numberOfSites, code) {
  const path = `${dataDir}/datasets.json`;
  let datasets = JSON.parse(fs.readFileSync(path));
  let dataset = datasets.find(o => o.code == code);
  dataset.numberOfSites = numberOfSites;
  fs.writeFileSync(path, JSON.stringify(datasets, null, 2));
}

////////////////////////////////////////

function writeUint16(value, file) {
  let buf = Buffer.alloc(2);
  buf.writeUInt16LE(value);
  file.write(buf);
}

function writeFloat(value, file) {
  let buf = Buffer.alloc(4);
  buf.writeFloatLE(value);
  file.write(buf);
}
function writeDouble(value, file) {
  let buf = Buffer.alloc(8);
  buf.writeDoubleLE(value);
  file.write(buf);
}

function writeBinarySites(sites, code) {
  let minLatitude = 360;
  let maxLatitude = -360;
  let minLongitude = 360;
  let maxLongitude = -360;

  for (let site of sites) {
    minLatitude = Math.min(minLatitude, site.latitude);
    maxLatitude = Math.max(maxLatitude, site.latitude);
    minLongitude = Math.min(minLongitude, site.longitude);
    maxLongitude = Math.max(maxLongitude, site.longitude);
  }

  let siteFile = fs.createWriteStream(`${dataDir}/${code}/site.bin`);

  writeDouble(minLatitude, siteFile);
  writeDouble(maxLatitude, siteFile);
  writeDouble(minLongitude, siteFile);
  writeDouble(maxLongitude, siteFile);

  for (let site of sites) {
    writeUint16(site.species, siteFile);

    let latitudeDelta = site.latitude - minLatitude;
    writeFloat(latitudeDelta, siteFile);

    let longitudeDelta = site.longitude - minLongitude;
    writeFloat(longitudeDelta, siteFile);
  }
  siteFile.end();
}

////////////////////////////////////////

function removeDuplicateSites(sites) {
  let sitesOut = [];
  let siteMap = {};
  let duplicates = 0;
  for (let site of sites) {
    // remove duplicate sites
    let siteKey = `${site.latitude},${site.longitude}`;
    if (siteMap[siteKey]) {
      ++duplicates;
    }
    else {
      siteMap[siteKey] = site;
      sitesOut.push(site);
    }
  }
  console.log('duplicates: ' + duplicates);
  return sitesOut;
}

////////////////////////////////////////

async function importDataset(code) {

  let corrector = new Corrector(`${dataDir}/src/${code}/correction.json`);
  let globalCorrector = new Corrector(`${dataDir}/src/correction.json`);
  let resolvedNameFinder = new ResolvedNameFinder(`${dataDir}/src`);
  let hierarchyFinder = new HierarchyFinder(`${dataDir}/src`);
  let commonNameFinder = new CommonNameFinder(`${dataDir}/src`);
  let wikipediaFinder = new WikipediaFinder(`${dataDir}/src`);

  console.log('importing ' + code);
  let sitesIn = JSON.parse(fs.readFileSync(`${dataDir}/src/${code}/data.json`));

  // remove sites with bogus locations
  // lucky we're not at the equator!
  sitesIn = sitesIn.filter((o) => (o.latitude != 0 || o.longitude != 0));

  // remove sites with empty names
  sitesIn = sitesIn.filter((o) => (o.name_botanical.length > 0));

  // remove duplicate sites (same lat/long)
  sitesIn = removeDuplicateSites(sitesIn);

  let speciesMap = {}; // resolved name to species
  let cacheMap = {}; // original name to species
  let speciesId = 0;

  let sitesOut = [];

  /*
  let lens = {};
  for (let site of sitesIn) {
    let len = site.name_botanical.length;
    let key = len.toString();
    let value = lens[key];
    if (value === undefined) {
      lens[key] = 1;
    }
    else {
      lens[key] = value + 1;
    }
  }
  console.log(lens);
  return;
  */

  let i = 0;
  for (let site of sitesIn) {
    ++i;
    let name = site.name_botanical;

    let species = cacheMap[name];
    if (!species) {

      console.log('');
      console.log(`${i}/${sitesIn.length}: ${name}`);
      console.log('  original:   ' + name);

      name = corrector.correct(name);
      console.log('  corrected:  ' + name);

      let classification = Classification.parse(name);
      if (!classification) {
        console.log('parse FAILED');
        throw new Error('parse failed');
      }
      console.log('  parsed:     ' + JSON.stringify(classification));

      // get name without cultivar for resolution
      let cultivar = classification.cultivar;
      let speciesName = classification.unparse({cultivar:false, infraspecies:true, infraspeciesMarkers:true, hybridMarker:'x'});
      speciesName = globalCorrector.correct(speciesName);
      name = await resolvedNameFinder.find(speciesName);

      if (!name) {
        console.log('resolve FAILED');
        name = speciesName; // use unresolved name
      }
      classification = Classification.parse(name);

      // re-add cultivar
      classification.cultivar = cultivar;

      console.log('  resolved:   ' + JSON.stringify(classification));

      let hier = await hierarchyFinder.find(classification.genus); // || {};
      if (!hier) {
        throw new Error('hierarchy failed');
      }
      hier = Object.assign({}, hier); // clone so we won't modify cache
      hier.genus = classification.genus;
      hier.species = classification.unparse({hybridMarker:'×', cultivar: false, infraspecies: false});
      hier.subspecies = classification.subspecies;
      hier.variety = classification.variety;
      hier.form = classification.form;
      console.log('  hierarchy:  ' + JSON.stringify(hier));

      let commonNames = await commonNameFinder.find(name) || [];
      commonNames = commonNames.slice(0); // clone so we won't modify cache!
      commonNames = commonNames.map(o => Util.startCase(o));
      let origCommonName = Util.startCase(site.name_common);
      if (origCommonName && commonNames.length == 0) {
        commonNames.unshift(origCommonName);
      }
      console.log('  common:     ' + commonNames);

      let wpLink = await wikipediaFinder.find(name);
      console.log('  wikipedia:  ' + wpLink);

      hier.kingdom_wp = await wikipediaFinder.find(hier.kingdom);
      hier.phylum_wp = await wikipediaFinder.find(hier.phylum);
      hier.class_wp = await wikipediaFinder.find(hier.class);
      hier.order_wp = await wikipediaFinder.find(hier.order);
      hier.family_wp = await wikipediaFinder.find(hier.family);
      hier.genus_wp = await wikipediaFinder.find(hier.genus);
      hier.species_wp = wpLink;

      name = classification.unparse({hybridMarker:'×'});
      console.log('  final name: ' + name);

      species = speciesMap[name];
      if (!species) {
        species = {};
        species.id = speciesId++;
        species.hierarchy = hier;
        species.count = 0;

        species.name_common = commonNames;
        species.name_botanical = name;
        species.wp_link = wpLink;
        console.log('wp: ' + wpLink);

        speciesMap[name] = species;
      }
      cacheMap[site.name_botanical] = species;
    }
    ++species.count;

    sitesOut.push({
      latitude: site.latitude,
      longitude: site.longitude,
      species: species.id
    });
  }

  // assign colors
  assignColors(speciesMap);

  // write sites
  //fs.writeFileSync(`${dataDir}/${code}/site.json`, JSON.stringify(sitesOut, null, 2));

  // write binary sites
  console.log('writing binary sites file');
  writeBinarySites(sitesOut, code);

  updateSiteCount(sitesOut.length, code);

  let speciesOut = Object.values(speciesMap);

  // sort species list by hierarchy
  speciesOut.sort((lhs, rhs) => {
    let lhsHier = lhs.hierarchy;
    let rhsHier = rhs.hierarchy;
    return lhsHier.kingdom.localeCompare(rhsHier.kingdom) ||
           lhsHier.phylum.localeCompare(rhsHier.phylum) ||
           lhsHier.class.localeCompare(rhsHier.class) ||
           lhsHier.order.localeCompare(rhsHier.order) ||
           lhsHier.family.localeCompare(rhsHier.family) ||
           lhsHier.genus.localeCompare(rhsHier.genus) ||
           lhs.name_botanical.localeCompare(rhs.name_botanical);
  });

  // write species
  fs.writeFileSync(`${dataDir}/${code}/species.json`, JSON.stringify(speciesOut, null, 2));
}

async function main() {
  if (process.argv.length == 3) {
    importDataset(process.argv[2]);
  }
  else {
    for (let dataset of datasets) {
      await importDataset(dataset);
    }
  }
}

(async function() { await main(); })();

////////////////////////////////////////

/*

async function importDataset(dataset) {
  let sitesInput = JSON.parse(fs.readFileSync(`${dataDir}/src/${dataset}/site.json`));

  console.log(`${sitesInput.length} sites`);

  // TODO:
  // resolve misspellings, synonyms, etc (e.g. "Lagerstroemia indica 'Red'" and "Lagerstroemia i. 'Red'")
  // get wikipedia title
  // get common name
  // get family name
  // generate color
  let speciesMap = {};
  let count = 0;
  for (let o of sitesInput) {
    let speciesKey = o.name_botanical
    let species = speciesMap[speciesKey];
    if (!species) {
      species = { 
        id: count++,
        name_botanical: o.name_botanical,
        color: [1.0, 0.0, 0.0]
      };
      speciesMap[speciesKey] = species;
    }
  }

  let species = Object.values(speciesMap);

  // sort to make it easier for humans to scan through
  species = species.sort((lhs, rhs) => { return lhs.name_botanical.localeCompare(rhs.name_botanical); });

  console.log(`${species.length} species`);

  let sites = [];
  let siteMap = {};
  let duplicates = 0;
  for (let site of sitesInput) {
    // remove duplicate sites
    let siteKey = `${site.latitude},${site.longitude}`;
    if (siteMap[siteKey]) {
      ++duplicates;
    }
    else {
      siteMap[siteKey] = site.name_botanical;
      sites.push({ 
        species: Number(speciesMap[site.name_botanical].id),
        latitude: Number(site.latitude),
        longitude: Number(site.longitude)
      });
    }
  }
  console.log('duplicates: ' + duplicates);

  // write files
  //fs.writeFileSync(dataDir + 'species.json', JSON.stringify(species, null, 2));
  fs.writeFileSync(dataDir + 'species.json', JSON.stringify(species));
  fs.writeFileSync(dataDir + 'site.json', JSON.stringify(sites, null, 2));

  let siteFile = fs.createWriteStream(dataDir + 'site.bin');
  for (let site of sites) {
    let buf = Buffer.alloc(2);
    buf.writeUInt16LE(site.species);
    siteFile.write(buf);

    buf = Buffer.alloc(8);
    buf.writeDoubleLE(site.latitude);
    siteFile.write(buf);

    buf = Buffer.alloc(8);
    buf.writeDoubleLE(site.longitude);
    siteFile.write(buf);
  }
  siteFile.end();
}
  */

