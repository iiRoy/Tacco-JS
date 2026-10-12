var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = sourceData.trim().split("\n");
var primaryValues = lineSegments[1].split(" ").map(Number);
var secondaryValues = lineSegments[3].split(" ").map(Number);
var primarySet = new Set(primaryValues);
var matchCount = secondaryValues.reduce((accumulator, currentVal) => accumulator + (primarySet.has(currentVal) ? 1 : 0), 0);
console.log(matchCount);
