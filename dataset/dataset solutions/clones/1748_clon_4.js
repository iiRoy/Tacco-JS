const convertValueToCustomBase = (currentNumber) => {
  if (currentNumber === 0n) {
    return "";
  }

  const remainderDigit = currentNumber % 26n;
  const nextValueForConversion = currentNumber / 26n;

  let characterRepresentation;
  if (remainderDigit === 0n) {
    characterRepresentation = String.fromCharCode(48); // ASCII for '0'
  } else {
    // ASCII for 'a' is 97, 'b' is 98, etc.
    // So for digit '1' ('a'), it's 96 + 1. For digit '25' ('y'), it's 96 + 25.
    characterRepresentation = String.fromCharCode(96 + Number(remainderDigit));
  }

  // Recursively process the next value and append the current character
  return convertValueToCustomBase(nextValueForConversion) + characterRepresentation;
};

const processExternalData = (dataStream) => {
  const numericInput = BigInt(dataStream.trim());
  const finalSequence = convertValueToCustomBase(numericInput);
  console.log(finalSequence);
};

process.env.MYTESTINGENV ? executeTestRoutine() : processExternalData(require('fs').readFileSync('/dev/stdin', 'utf8'));