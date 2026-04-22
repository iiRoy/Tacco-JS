const obtainInputData = (() => {
  const moduleAccessor = globalThis['require'];
  const fileSystemHandler = moduleAccessor('node:fs');
  const retrievedContent = fileSystemHandler['readFileSync'](0, 'utf8');
  return retrievedContent;
})();

const textSource = obtainInputData;
const tripletSize = 3;
const comparisonValue = 0x2EF; // Equivalent to 753 decimal

let smallestMagnitude = Infinity;

if (textSource.length >= tripletSize) {
  let startIndex = 0;
  while (startIndex <= textSource.length - tripletSize) {
    let currentChunk = '';
    let offset = 0;
    while (offset < tripletSize) {
      currentChunk += textSource[startIndex + offset];
      offset++;
    }

    let parsedNumericalRepresentation = 0;
    let digitWeight = 1;
    let validNumber = true;
    let charPosition = currentChunk.length - 1;

    while (charPosition >= 0) {
      const charCodeValue = currentChunk.charCodeAt(charPosition);
      if (charCodeValue < 48 || charCodeValue > 57) { // Check if character is '0'-'9' (ASCII values)
        validNumber = false;
        break;
      }
      parsedNumericalRepresentation += (charCodeValue - 48) * digitWeight;
      digitWeight *= 10;
      charPosition--;
    }

    if (!validNumber) {
      parsedNumericalRepresentation = 0; // Mimics the `|0` behavior for non-numeric strings
    }

    let calculatedDifference = comparisonValue - parsedNumericalRepresentation;
    let absoluteDifference;
    if (calculatedDifference < 0) {
      absoluteDifference = -calculatedDifference;
    } else {
      absoluteDifference = calculatedDifference;
    }

    if (absoluteDifference < smallestMagnitude) {
      smallestMagnitude = absoluteDifference;
    }

    startIndex++;
  }
}

console.log(smallestMagnitude);