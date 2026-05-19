var fs = require('fs');
var rawData = fs.readFileSync('/dev/stdin', 'utf8');

var lines = rawData.trim().split("\n");

var mainString = lines.shift();
var checkCount = Number(lines.shift());

const FOUND_VALUE = 1;
const NOT_FOUND_VALUE = 0;

for (let idx = 0; idx < checkCount; idx++) {
   let currentSearchTerm = lines[idx];
   let isTermPresent = mainString.includes(currentSearchTerm);
   console.log(isTermPresent ? FOUND_VALUE : NOT_FOUND_VALUE);
}
