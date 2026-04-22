const fileSystemAccess = require('fs');
const standardInputLocation = '/dev/stdin';
const fetchedData = fileSystemAccess.readFileSync(standardInputLocation, 'utf8');

function characterSequenceInverter(initialSequence) {
  return [...initialSequence].reduceRight((accumulatedResult, singleChar) => {
    return accumulatedResult + singleChar;
  }, '');
}

global.process.stdout.write(characterSequenceInverter(fetchedData) + '\n');