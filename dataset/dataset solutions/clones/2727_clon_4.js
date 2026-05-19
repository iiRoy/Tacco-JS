'use strict';

function processInput(rawInput) {
  const val = Number(rawInput);
  
  console.log(val * (val + val + val));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
