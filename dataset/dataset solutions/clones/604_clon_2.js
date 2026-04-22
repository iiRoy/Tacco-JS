let sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let numberSequence = (sourceData.trim()).split("\n").map(Number);
let minimumGroupOne = Math.min(numberSequence[0], numberSequence[1], numberSequence[2]);
let minimumGroupTwo = Math.min(numberSequence[3], numberSequence[4]);
console.log(minimumGroupOne + minimumGroupTwo - 50);