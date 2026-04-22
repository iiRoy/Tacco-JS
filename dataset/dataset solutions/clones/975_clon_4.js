const inputDetails = {
  sourcePath: '/dev/stdin',
  separator: '\n'
};

const fileHandler = require('fs');

const fileContents = fileHandler.readFileSync(inputDetails.sourcePath, 'ascii')
  .split(inputDetails.separator, 2);

const primaryString = fileContents[0];
const searchPattern = fileContents[1];

const patternRegex = new RegExp(searchPattern, 'g');

const occurrenceIndices = [];

const matchIterator = primaryString.matchAll(patternRegex);

for (const singleMatch of matchIterator) {
  occurrenceIndices.push(singleMatch.index);
}

console.log(occurrenceIndices.join('\n'));