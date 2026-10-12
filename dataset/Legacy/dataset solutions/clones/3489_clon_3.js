const parseNumericString = (strValue) => Number(strValue);

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputContent.split('\n');

const firstLineData = allInputLines.shift().split(' ');

const numberOfItems = parseNumericString(firstLineData[0]);
const timeConstraint = parseNumericString(firstLineData[1]);

let minimumCost = 1000;
let hasFeasibleItem = false;

for (let itemIdx = 0; itemIdx < numberOfItems; itemIdx++) {
    const itemDataParts = allInputLines[itemIdx].split(' ');

    const currentCostValue = parseNumericString(itemDataParts[0]);
    const currentTimeValue = parseNumericString(itemDataParts[1]);

    if (currentTimeValue > timeConstraint) {
        continue;
    }

    const isCostEligible = minimumCost >= currentCostValue;

    if (isCostEligible) {
        minimumCost = currentCostValue;
        hasFeasibleItem = true;
    }
}

if (hasFeasibleItem) {
    console.log(minimumCost);
} else {
    console.log('TLE');
}
