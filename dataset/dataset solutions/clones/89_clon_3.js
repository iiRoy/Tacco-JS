(function(rawData) {
  const parseNumericInput = (textData) => {
    const cleanedText = textData.replace(/\n$/, '');
    const lines = cleanedText.split('\n');
    const numericValues = lines.map(Number);
    return numericValues;
  };

  let numericSequence = parseNumericInput(rawData);

  let currentBlockSum;
  let maximumSubarraySum;

  while (true) {
    let blockElementCount = numericSequence.shift();

    if (blockElementCount === 0) {
      break;
    }

    currentBlockSum = -Infinity;
    maximumSubarraySum = -Infinity;

    for (let blockIndex = 0; blockIndex < blockElementCount; blockIndex++) {
      let elementValue = numericSequence.shift();

      let sumIncludingCurrent = currentBlockSum + elementValue;
      currentBlockSum = Math.max(elementValue, sumIncludingCurrent);

      maximumSubarraySum = Math.max(maximumSubarraySum, currentBlockSum);
    }
    console.log(maximumSubarraySum);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
