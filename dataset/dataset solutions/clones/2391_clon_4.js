const characterSetSize = 26;
const referenceCodePoint = 65; // ASCII code for 'A'

function processInputData(sourceSegments) {
  const rotationValue = Number(sourceSegments[0]);
  const textPayload = sourceSegments[1];

  const characterConversionTable = new Array(65536); // Pre-compute for all possible Unicode code points

  for (let currentCode = 0; currentCode < characterConversionTable.length; currentCode++) {
    // This formula directly replicates the original's character transformation logic
    let intermediateCalculation = (currentCode - referenceCodePoint + rotationValue);
    let finalCharacterCode = (intermediateCalculation % characterSetSize) + referenceCodePoint;
    characterConversionTable[currentCode] = finalCharacterCode;
  }

  // Use a functional approach with Array.from and reduce to build the output string
  const transformedSequence = Array.from(textPayload).reduce((accumulatorString, currentCharacterSymbol) => {
    const originalCodeValue = currentCharacterSymbol.codePointAt(0);
    const mappedCodeValue = characterConversionTable[originalCodeValue];
    return accumulatorString + String.fromCodePoint(mappedCodeValue);
  }, "");

  return transformedSequence;
}

const receivedData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
console.log(processInputData(receivedData));