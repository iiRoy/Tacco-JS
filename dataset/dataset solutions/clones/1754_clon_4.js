(function(sourceData) {
  const allExtractedNumbers = sourceData.match(/\d+/g).map(Number);
  const firstValue = allExtractedNumbers.shift(); // The 'N' value, not strictly needed for logic
  const numericSequence = allExtractedNumbers;

  const totalXorAccumulator = numericSequence.reduce((currentXor, nextVal) => currentXor ^ nextVal, 0);

  const finalResultString = numericSequence.reduce((outputString, currentNumber, indexPos) => {
    const transformedValue = currentNumber ^ totalXorAccumulator;
    return outputString + (indexPos === 0 ? '' : ' ') + transformedValue;
  }, '');

  return finalResultString;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));