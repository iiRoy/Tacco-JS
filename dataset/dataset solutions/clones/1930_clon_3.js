function processNumericalSequence(rawSequenceData)
{
  // Validate the initial input string to ensure it's not null, undefined, or empty.
  if (typeof rawSequenceData !== 'string' || rawSequenceData.trim().length === 0) {
    console.error("Error: Input data for sequence processing is invalid or missing.");
    return;
  }

  // Convert the space-separated string values into an array of integers.
  const parsedNumericalValues = rawSequenceData
    .split(' ')
    .map(numericText => Number.parseInt(numericText, 10));

  // Extract the two primary numerical parameters from the parsed array.
  const sequenceLengthParameter = parsedNumericalValues[0];
  const desiredOutputCount = parsedNumericalValues[1];

  // Perform basic validation on the extracted numerical parameters.
  if (isNaN(sequenceLengthParameter) || isNaN(desiredOutputCount) || sequenceLengthParameter <= 0 || desiredOutputCount <= 0) {
    console.error("Error: Both sequence length and output count must be positive integers.");
    return;
  }

  // Initialize a mutable array to store the generated string pairs.
  let computedPairCollection = [];

  // Determine if the sequence length is an odd number.
  const isLengthOdd = (sequenceLengthParameter % 2 !== 0);

  // Branch execution based on the parity of the sequence length parameter.
  if (isLengthOdd)
  {
    // For odd sequence lengths, generate symmetrical pairs from both ends.
    for (let currentLeftIndex = 1, currentRightIndex = sequenceLengthParameter - 1;
         currentLeftIndex < currentRightIndex;
         currentLeftIndex += 1, currentRightIndex -= 1)
    {
      const formattedPairString = `${currentLeftIndex} ${currentRightIndex}`;
      computedPairCollection.push(formattedPairString);
    }
  }
  else // The sequence length parameter is an even number.
  {
    let specialAdjustmentTriggered = false; // A boolean flag to manage a unique modification.
    const halfOfSequenceLength = sequenceLengthParameter / 2; // Pre-calculate for repeated use.

    // Generate pairs for even sequence lengths, with a conditional adjustment.
    for (let currentLeftIndex = 1, currentRightIndex = sequenceLengthParameter - 1;
         currentLeftIndex < currentRightIndex;
         currentLeftIndex += 1, currentRightIndex -= 1)
    {
      // This conditional block is for structural variation and does not alter logic.
      if (true) {
        // Check if the specific adjustment condition is met and hasn't been triggered yet.
        if ((specialAdjustmentTriggered === false) && ((currentRightIndex - currentLeftIndex) <= halfOfSequenceLength))
        {
          currentRightIndex = currentRightIndex - 1; // Apply the unique decrement to the right index.
          specialAdjustmentTriggered = true;         // Set the flag to prevent further adjustments.
        }
      }

      const formattedPairString = `${currentLeftIndex} ${currentRightIndex}`;
      computedPairCollection.push(formattedPairString);
    }
  }

  // Determine the actual number of pairs to output, not exceeding the generated count.
  const numberOfPairsToDisplay = Math.min(desiredOutputCount, computedPairCollection.length);

  // Iterate and print the required number of generated pairs to the console.
  for (let displayIterator = 1; displayIterator <= numberOfPairsToDisplay; displayIterator += 1)
  {
    const pairToOutput = computedPairCollection[displayIterator - 1];
    console.log(pairToOutput);
  }
}

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));