const dataSource = require('fs');

const fullContent = dataSource.readFileSync('/dev/stdin', 'utf8');
const contentLines = fullContent.split('\n');

contentLines.shift();
const sourceCollectionString = contentLines.shift();
contentLines.shift();
const targetCollectionString = contentLines.shift();

const referenceElements = new Set(sourceCollectionString.split(' '));

const distinctTargetElements = [...new Set(targetCollectionString.split(' '))];

const intersectionCount = distinctTargetElements.filter(item => referenceElements.has(item)).length;

console.log(intersectionCount);