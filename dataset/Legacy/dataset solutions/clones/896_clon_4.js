const fileSystem = require('fs');
let processedText = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

const requiredPattern = "AADINNUY";
const substituteValue = "AIZUNYAN";
const segmentLength = 8;

const possibleStartIndices = Array.from(
  { length: Math.max(0, processedText.length - segmentLength + 1) },
  (_, index) => index
);

const firstMatchIndex = possibleStartIndices.findIndex(startPoint => {
  const currentSegment = processedText.substring(startPoint, startPoint + segmentLength);
  const sortedCurrentSegment = currentSegment.split('').sort().join('');
  return sortedCurrentSegment === requiredPattern;
});

if (firstMatchIndex !== -1) {
  processedText = processedText.slice(0, firstMatchIndex) + substituteValue + processedText.slice(firstMatchIndex + segmentLength);
}

console.log(processedText);
