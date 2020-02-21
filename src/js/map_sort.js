#!/usr/local/bin/node
'use strict'

const fs = require('fs');
const path = require('path');

let inPath = process.argv[2];
let outPath = process.argv[3];
if (!inPath || !outPath) {
  console.log(`usage: ${path.basename(process.argv[1])} <in> <out>`);
  return;
}

let map = JSON.parse(fs.readFileSync(inPath));
let entries = Object.entries(map).sort();

let sortedMap = {};
for (let e of entries) {
  sortedMap[e[0]] = e[1];
}

fs.writeFileSync(outPath, JSON.stringify(sortedMap, null, 2));
