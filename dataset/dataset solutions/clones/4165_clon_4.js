"use strict";

var processInput = function processInput(sourceText) {
  var digitMatches = sourceText.match(/1/g);
  var tally = digitMatches ? digitMatches.length : 0;
  console.log(tally);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
