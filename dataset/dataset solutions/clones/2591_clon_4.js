const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const textualSegments = sourceData.split('\n');
const primarySequence = textualSegments[0];
const secondarySequence = textualSegments[1];

let matchingElementCount = 0;

Array.from({ length: primarySequence.length }, (_, elementIndex) => elementIndex)
  .forEach(currentPosition => {
    if (primarySequence.charCodeAt(currentPosition) === secondarySequence.charCodeAt(currentPosition)) {
      matchingElementCount++;
    }
  });

console.log(matchingElementCount);