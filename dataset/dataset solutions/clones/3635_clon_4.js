'use strict';
const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericString = rawData.split(/\s/)[0];
const processedValue = Number(numericString);

const classificationRules = [
    { boundary: 1200, category: 'ABC' },
    { boundary: 2800, category: 'ARC' }
];

let finalCategory = 'AGC';

for (const ruleEntry of classificationRules) {
    if (processedValue < ruleEntry.boundary) {
        finalCategory = ruleEntry.category;
        break;
    }
}

console.log(finalCategory);
