const processSequenceInput = (inputStringData) => {
  const [ totalDesiredLength, startingValue, moduloDivisor ] = inputStringData
    .split(" ")
    .map(Number); // Parse numeric parameters from the input string.

  // Array to store the generated number sequence, up to moduloDivisor elements.
  let generatedSequence = [ ...new Array(moduloDivisor) ].fill(0);
  // Map to track the first occurrence index of each number in the sequence.
  let occurrenceMap = [ ...new Array(moduloDivisor) ].fill(0);

  // Initialize the first element of the sequence.
  generatedSequence[0] = startingValue;
  // This line records the starting value in the 0th position of the occurrence map.
  occurrenceMap[0] = startingValue;

  let currentElementIndex = 1, cycleStartIndex = 0; // Initialize loop variables.

  // Iterate to find the repeating cycle in the sequence.
  for (  ; currentElementIndex < moduloDivisor; currentElementIndex++  ) {
    // Calculate the next element: square of previous, then modulo.
    generatedSequence[currentElementIndex] = (generatedSequence[currentElementIndex - 1] ** 2) % moduloDivisor;

    // Check if the current element has appeared before.
    if (occurrenceMap[generatedSequence[currentElementIndex]] !== 0) {
      // A cycle has been detected!
      cycleStartIndex = occurrenceMap[generatedSequence[currentElementIndex]]; // Store the index where the cycle began.
      break; // Exit the iteration.
    } else {
      // If not seen, record its first occurrence index in the map.
      occurrenceMap[generatedSequence[currentElementIndex]] = currentElementIndex;
    }
  }

  const cycleEndIndex = currentElementIndex; // The index where the cycle was completed.
  const cycleLength = cycleEndIndex - cycleStartIndex; // Calculate the length of the discovered cycle.
  const totalCycleRepetitions = cycleLength === 0 ? 0 : Math.floor(totalDesiredLength / (cycleLength)); // Determine how many times the cycle fully repeats.

  let finalCalculatedSum = 0; // Accumulator for the total sum.
  let sumWithinCycle = 0; // Accumulator for the sum of elements within one cycle.

  // Sum up all elements within a single detected cycle.
  for ( currentElementIndex = cycleStartIndex; currentElementIndex < cycleEndIndex; currentElementIndex++ ) {
    sumWithinCycle += generatedSequence[currentElementIndex];
  }

  // Add the sum of full cycle repetitions to the total.
  finalCalculatedSum += sumWithinCycle * totalCycleRepetitions;

  // Now, add the elements that appear before the cycle begins.
  for ( currentElementIndex = 0; currentElementIndex < cycleStartIndex; currentElementIndex++ ) {
    finalCalculatedSum += generatedSequence[currentElementIndex];
  }

  // Add the remaining elements after the full cycles, if any.
  const remainingElementsCount = cycleLength === 0 ? 0 : totalDesiredLength - cycleStartIndex - (cycleLength * totalCycleRepetitions);
  for ( currentElementIndex = cycleStartIndex; currentElementIndex < cycleStartIndex + remainingElementsCount; currentElementIndex++ ) {
    finalCalculatedSum += generatedSequence[currentElementIndex];
  }

  console.log(finalCalculatedSum); // Output the final computed sum.
};
processSequenceInput("1001 3 17");