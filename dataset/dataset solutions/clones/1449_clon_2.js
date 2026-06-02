let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let dataRows = rawData.split('\n');

const sourceArray = dataRows[1].split(' ');
const targetArray = dataRows[3].split(' ');

let lookupMap = {};

sourceArray.forEach(function(itemValue) {
    lookupMap[itemValue] = true;
});

let matchCount = 0;

targetArray.forEach(function(targetItem) {
    if (lookupMap[targetItem]) {
        matchCount++;
    }
});

console.log(matchCount);
