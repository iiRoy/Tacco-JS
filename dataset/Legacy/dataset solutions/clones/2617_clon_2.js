function processInputData(rawText) {
  // Remove leading/trailing whitespace from the input string.
  rawText = rawText.trim();

  // Split the first line of input to get arrayLength and factorVal.
  const firstLineParts = rawText.split(" ");
  const arrayLength = parseInt(firstLineParts[0], 10);
  const factorVal = parseInt(firstLineParts[1], 10);

  // Parse the second line of input into an array of integers.
  const numericSequence = rawText.split('\n')[1].split(' ').map((strNum) => parseInt(strNum, 10));

  // Initialize arrays to store intermediate counts.
  const partialCounts = []; // Stores counts of elements smaller than numericSequence[outerIndex] from outerIndex to end.
  const globalCounts = [];  // Stores counts of elements smaller than numericSequence[outerIndex] from start to end.

  // Initialize the variable to accumulate the final result.
  let cumulativeSum = 0;

  // Define a constant for the modulo operation.
  const MODULO_VAL = 1000000007;

  // First main loop: Calculate partialCounts and globalCounts for each element.
  for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
    let currentPartialCount = 0; // Counter for elements smaller than numericSequence[outerIndex] in the forward slice.
    // Inner loop for partialCounts: Iterate from current outerIndex to the end of the array.
    for (let innerIndexForward = outerIndex; innerIndexForward < arrayLength; innerIndexForward++) {
      if (numericSequence[outerIndex] > numericSequence[innerIndexForward]) {
        currentPartialCount++;
      }
    }
    partialCounts.push(currentPartialCount); // Store the calculated partial count.

    let currentGlobalCount = 0; // Counter for elements smaller than numericSequence[outerIndex] in the entire array.
    // Inner loop for globalCounts: Iterate through the entire array.
    for (let innerIndexGlobal = 0; innerIndexGlobal < arrayLength; innerIndexGlobal++) {
      if (numericSequence[outerIndex] > numericSequence[innerIndexGlobal]) {
        currentGlobalCount++;
      }
    }
    globalCounts.push(currentGlobalCount); // Store the calculated global count.
  }

  // Second main loop: Calculate the final cumulative sum using the pre-calculated counts.
  for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
    // Calculate the first part of the term: (partialCounts[outerIndex] * factorVal) % MODULO_VAL
    const firstTermPart = (partialCounts[outerIndex] * factorVal) % MODULO_VAL;

    // Calculate the second part of the term: (globalCounts[outerIndex] * factorVal * (factorVal - 1) * 0.5) % MODULO_VAL
    // Note: factorVal * (factorVal - 1) * 0.5 is equivalent to factorVal * (factorVal - 1) / 2
    const secondTermPart = (globalCounts[outerIndex] * factorVal * (factorVal - 1) * 0.5) % MODULO_VAL;

    // Sum the two parts and apply modulo.
    const termValue = (firstTermPart + secondTermPart) % MODULO_VAL;

    // Add the current termValue to the cumulative sum and apply modulo.
    cumulativeSum = (cumulativeSum + termValue) % MODULO_VAL;
  }

  // Output the final calculated cumulative sum, ensuring it's within the modulo range.
  console.log(cumulativeSum % MODULO_VAL);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
