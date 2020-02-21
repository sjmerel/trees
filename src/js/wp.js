#!/usr/local/bin/node

let Fs = require("fs");
var RequestPromise = require('request-promise');

////////////////////////////////////////

async function main() {
  let file = './species.json';
  let speciesArray = JSON.parse(Fs.readFileSync(file));
  for (let species of speciesArray) {
    let params = {
      uri: `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srsearch=${species.name_botanical}&utf8=&format=json`,
      json: true
    };
    try {
      let response = await RequestPromise(params);
      let title = null;
      if (response.query.search.length > 0) {
        title = encodeURIComponent(response.query.search[0].title);
      }
      if (title === species.name_botanical) {
        // exact match
        species.wp_title = title;
      }
      else if (species.name_botanical.startsWith(title)) {
        // partial match at start, e.g. Lagerstroemia indica 'Purple' => Lagerstroemia indica
        console.log(` partial: ${species.name_botanical} => ${title}`);
        species.wp_title_partial = title;
      }
      else {
        console.log(`${species.name_botanical} => ${title}`);
        species.wp_title_fix = title;
      }
    } catch (err) {
      console.log(err);
      console.log(species.name_botanical + ': error');
    }
  }

  Fs.writeFileSync(file, JSON.stringify(speciesArray, null, 2));
}

////////////////////////////////////////

(async function() { await main(); })();

