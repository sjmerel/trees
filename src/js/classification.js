'use strict'

const Util = require('./util');

////////////////////////////////////////

class Classification {
  static parse(name, quiet) {
    try {
      return new Classification(name);
    }
    catch (error) {
      if (!quiet) {
        console.log(error);
      }
      return null;
    }
  }

  constructor(name) {
    // format:
    // [x] <genus> [x] <species> [subsp. <subspecies>] [var. <variety>] [form <form>] ['<cultivar>']
    // or 
    // <genus> <species> x <genus> <species> ...
    // or 
    // + <genus> <species> ...
    // 
    // all components should be lowercase, except genus (capitalized) and cultivar (arbitrary)

    function extractSpeciesComponent(obj, name, component, tags) {
      let i0 = -1;
      let taglen = 0;
      for (let tag of tags) {
        i0 = name.indexOf(tag + ' ');
        taglen = tag.length;
        if (i0 >= 0) break;
      }

      if (i0 >= 0) {
        let i1 = name.indexOf(' ', i0+taglen+1); // next space
        if (i1 < 0) {
          i1 = name.length;
        }
        obj[component] = name.slice(i0+taglen+1, i1+1).trim();
        return (name.substr(0, i0) + name.substr(i1+1)).trim();
      }
      else {
        return name;
      }
    }

    function extractSpeciesCultivar(obj, name) {
      let i0 = name.indexOf('\'') // first quote
      if (i0 >= 0) {
        let i1 = name.lastIndexOf('\''); // last quote
        if (i1 == i0) {
          i1 = name.length;
        }
        obj.cultivar = Util.startCase(name.slice(i0+1, i1).trim());
        return (name.substr(0, i0) + name.substr(i1+1)).trim();
      }
      else {
        return name;
      }
    }


    name = name.toLowerCase();
    name = name.replace(/ +/g,' '); // combine consecutive spaces
    name = name.replace(/`/g, "'");
    //name = name.replace(/`/g, "'");
    name = name.trim();

    name = extractSpeciesCultivar(this, name);

    name = extractSpeciesComponent(this, name, 'subspecies', ['ssp', 'ssp.', 'subsp.', 'subspecies']);
    name = extractSpeciesComponent(this, name, 'variety', ['var', 'var.', 'variety']);
    name = extractSpeciesComponent(this, name, 'form', ['f', 'f.', 'fo.', 'form', 'form.']);

    let words = name.split(' ');

    const hybridX = ['x', 'X', '×'];
    const speciesMarkers = ['spp.', 'spp', 'sp.', 'sp', 'species'];

    // graft chimera: "+ Genus species"
    if (words.length >= 1 && words[0] == '+') {
      this.graft_chimera = true;
      words.shift();
    }
    // hybrid genus: "x Genus species"
    if (words.length >= 1 && hybridX.includes(words[0])) {
      this.genus_hybrid = true;
      words.shift();
    }

    // hybrid species: "Genus x species"
    if (words.length >= 2 && hybridX.includes(words[1])) {
      this.species_hybrid = true;
      words.splice(1, 1);
    }

    if (words.length == 4 && hybridX.includes(words[2])) {
      // hybrid: "Genus species1 x species2"
      this.genus = Util.capitalize(words[0]);
      this.species = [words[1], words[3]];
    }
    else if (words.length == 5 && hybridX.includes(words[2])) {
      // hybrid: "Genus species1 x Genus species2"
      this.genus = Util.capitalize(words[0]);
      this.species = [words[1], words[4]];
    }
    else if (words.length <= 2) {
      this.genus = Util.capitalize(words[0]);
      if (words.length == 2 && !speciesMarkers.includes(words[1])) {
        this.species = words[1];
      }
    }
    else {
      throw new Error("couldn't parse species");
    }
  }

  unparse(options = {
    cultivar: true,
    infraspecies: true,
    infraspeciesMarkers: true,
    hybridMarker: 'x'
  }) {

    if (options.cultivar === undefined) { options.cultivar = true; }
    if (options.infraspecies === undefined) { options.infraspecies = true; }
    if (options.infraspeciesMarkers === undefined) { options.infraspeciesMarkers = true; }
    if (options.hybridMarker === undefined) { options.hybridMarker = 'x'; }

    let name = '';
    if (this.graft_chimera) {
      name += '+ ';
    }
    if (this.genus_hybrid) {
      name += options.hybridMarker + ' ';
    }
    name += this.genus;

    if (this.species_hybrid) {
      name += ' ' + options.hybridMarker;
    }
    if (this.species) {
      if (this.species instanceof Array) {
        name += ` ${this.species[0]} ${options.hybridMarker} ${this.species[1]}`;
      }
      else {
        name += ' ' + this.species;
      }
    }

    if (options.infraspecies) {
      if (options.infraspeciesMarkers) {
        if (this.subspecies) { name += ` subsp. ${this.subspecies}`; }
        if (this.variety) { name += ` var. ${this.variety}`; }
        if (this.form) { name += ` form. ${this.form}`; }
      }
      else {
        if (this.subspecies) { name += ` ${this.subspecies}`; }
        if (this.variety) { name += ` ${this.variety}`; }
        if (this.form) { name += ` ${this.form}`; }
      }
    }

    if (options.cultivar && this.cultivar) { name += ` '${this.cultivar}'`; }

    return name;
  }
}


////////////////////////////////////////

module.exports = Classification;


/*
async function main()
{
  let c = Classification.parse('Betula sp.');
  console.log(c);
}
(async function() { await main(); })();
*/
