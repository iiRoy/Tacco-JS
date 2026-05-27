const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedInput = rawInput.trim();

const pattern = /(J+)(O+)(I+)/g;

const maxOSequenceLength = Array.from(processedInput.matchAll(pattern))
  .filter(matchResult => {
    const jGroup = matchResult[1];
    const oGroup = matchResult[2];
    const iGroup = matchResult[3];
    return jGroup.length >= oGroup.length && iGroup.length >= oGroup.length;
  })
  .map(filteredMatch => filteredMatch[2].length)
  .reduce((currentMax, oLength) => Math.max(currentMax, oLength), -Infinity);

console.log(maxOSequenceLength);
