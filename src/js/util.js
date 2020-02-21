'use strict'

function capitalize(word) {
  if (word == '') { return word; }
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}

function startCase(s) {
  if (s == '') { return s; }
  return s.toLowerCase().split(' ').map((o) => capitalize(o)).join(' ');
}

function sentenceCase(s) {
  return capitalize(s.toLowerCase());
}

////////////////////////////////////////

module.exports = {
  capitalize: capitalize,
  startCase: startCase,
  sentenceCase: sentenceCase
};
