(function(rawInputData) {
  const NEGATIVE_INFINITY_VALUE = Number.NEGATIVE_INFINITY;

  // Helper function to process the raw string input into an array of numbers.
  const prepareNumericSequence = (dataString) => {
    const cleanedString = dataString.replace(/\n$/, '');
    const lines = cleanedString.split('\n');
    const convertedNumbers = lines.map(item => Number(item));
    return convertedNumbers;
  };

  let numericSequence = prepareNumericSequence(rawInputData);

  while (true) {
    let elementsToProcess = numericSequence.shift();

    if (elementsToProcess === 0) {
      break; // Exit condition for the main processing loop
    }

    // Initialize variables for tracking maximum subarray sum for the current sequence
    let currentMaxEndingHere = NEGATIVE_INFINITY_VALUE;
    let overallMaxSum = NEGATIVE_INFINITY_VALUE;

    for (let loopIndex = 0; loopIndex < elementsToProcess; loopIndex++) {
      let elementValue = numericSequence.shift();

      // Calculate the sum if the current element extends the previous subarray
      let potentialExtendedSum = currentMaxEndingHere + elementValue;

      // Decide whether to extend the current subarray or start a new one with the current element
      currentMaxEndingHere = Math.max(elementValue, potentialExtendedSum);

      // Update the global maximum sum found so far
      overallMaxSum = Math.max(overallMaxSum, currentMaxEndingHere);
    }
    console.log(overallMaxSum);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
