'use strict';

const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let strVal = dataLines[0];
let resultString = "Yes";

for (let idx = 0; idx < strVal.length; idx++) {
  // Check characters at odd positions (0-indexed)
  if (idx % 2 !== 0) {
    if (strVal[idx] === "R") {
      resultString = "No";
      break;
    }
  } else {
    // Check characters at even positions (0-indexed)
    if (strVal[idx] === "L") {
      resultString = "No";
      break;
    }
  }
}

console.log(resultString);
