const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceData.trim().split("\n");
const firstCount = Number(lineSegments[0]);
const targetNumbers = lineSegments[1].split(" ").map(Number);
const queryValues = lineSegments[3].split(" ").map(Number);

const searchSet = new Set(targetNumbers);

const checkPresence = (itemToFind) => searchSet.has(itemToFind) ? 1 : 0;

const totalOccurrences = queryValues.reduce((accumulator, currentValue) => {
  return accumulator + checkPresence(currentValue);
}, 0);

console.log(totalOccurrences);
