function ProcessDataStream(sourceText) {
  // Divide the incoming string into lines.
  sourceText = sourceText.split('\n');

  // The first line indicates the number of elements.
  let problemSize = sourceText[0];

  // Parse the second line into a numeric array.
  const sequenceAlpha = sourceText[1].split(' ').map(parseFloat);

  // Parse the third line into a numeric array.
  const sequenceBeta = sourceText[2].split(' ').map(parseFloat);

  // Parse the fourth line into a numeric array.
  const sequenceGamma = sourceText[3].split(' ').map(parseFloat);

  // Helper function to aggregate numbers in an array.
  const calculateTotal = function(valueArray) {
    let currentTotal = 0.0;
    for (let k = 0; k < valueArray.length; ++k) {
      currentTotal += valueArray[k];
    }
    return currentTotal;
  };

  // Initialize the running total with the sum of the beta sequence.
  let grandTotal = calculateTotal(sequenceBeta);

  // Iterate through the sequences to apply conditional adjustments.
  for (let idx = 0; idx < problemSize - 1; ++idx) {
    // Check for a specific pattern in the alpha sequence.
    if (sequenceAlpha[idx] === sequenceAlpha[idx + 1] - 1) {
      // Apply an additional value from the gamma sequence if the condition is met.
      grandTotal += sequenceGamma[idx];
    }
  }
  // Display the final computed aggregate.
  console.info(grandTotal);
}

// Execute the main processing logic by reading from standard input.
ProcessDataStream(require('node:fs').readFileSync('/dev/stdin', 'utf8'));