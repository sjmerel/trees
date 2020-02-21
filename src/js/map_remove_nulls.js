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

for (let e of Object.entries(map)) {
  if (e[1] === null) {
    delete map[e[0]];
  }
}

fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
