const rawContent = require('node:fs').readFileSync(0, 'utf8');

let productTotal = 0;
let secondValueTotal = 0;
let entryTally = 0;

const processedContent = rawContent.trim();
const individualRecords = processedContent.split(/\r?\n/);

for (const recordText of individualRecords) {
    const components = recordText.split(',');

    const firstElement = parseInt(components[0], 10);
    const secondElement = parseInt(components[1], 10);

    productTotal += firstElement * secondElement;
    secondValueTotal += secondElement;
    entryTally++;
}

console.log(productTotal);
console.log(Math.round(secondValueTotal / entryTally));