const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const rawEntries = dataSource.split('\n').filter(Boolean);

let grandTotal = 0;
let secondarySum = 0;
let entryCount = 0;

for (let j = 0; j < rawEntries.length; ++j) {
    const entryString = rawEntries[j];
    
    const components = entryString.split(',');
    const componentOne = parseInt(components[0], 10);
    const componentTwo = parseInt(components[1], 10);

    grandTotal += componentOne * componentTwo;
    secondarySum += componentTwo;
    entryCount++;
}

const secondaryAverage = Math.round(secondarySum / entryCount);

console.log(grandTotal, secondaryAverage);