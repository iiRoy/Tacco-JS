function processInput (sourceString) {
  let occurrenceCounter = 0;
  const TARGET_SEQUENCE = 'ABC';
  const REPLACEMENT_SEQUENCE = 'BCA';

  let currentSearchIndex;

  while ((currentSearchIndex = sourceString.indexOf(TARGET_SEQUENCE)) !== -1) {
    let intermediateModifiedString = sourceString.replace(TARGET_SEQUENCE, REPLACEMENT_SEQUENCE);
    occurrenceCounter++;
    sourceString = intermediateModifiedString.slice(currentSearchIndex);
  }

  console.log(occurrenceCounter);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

processInput(fileSystemModule.readFileSync(standardInputPath, encodingFormat));
