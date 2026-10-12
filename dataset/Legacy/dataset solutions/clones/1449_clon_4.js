const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.split('\n');

const firstCollection = contentLines[1].split(' ');
const secondCollection = contentLines[3].split(' ');

const uniqueElements = new Set(firstCollection);

const commonElementCount = secondCollection.filter(item => uniqueElements.has(item)).length;

console.log(commonElementCount);
