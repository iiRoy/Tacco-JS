const fileModule = require('fs');
const collectedText = fileModule.readFileSync('/dev/stdin', 'utf8');

const contentSegments = collectedText.split('\n');

const initialElements = contentSegments[1].split(' ');
const checkElements = contentSegments[3].split(' ');

const uniqueSourceItems = new Set(initialElements);

const matchedQuantity = checkElements.filter(candidate => uniqueSourceItems.has(candidate)).length;

console.log(matchedQuantity);