function processInputData(sourceText){
  // Split the entire input string by newline characters into an array of lines.
  sourceText = sourceText.split("\n");
  let currentLinePointer = 0; // Initialize a pointer to track the current line being processed.

  // Main processing loop; continues indefinitely until an explicit break condition.
  while (true) {
    // For each iteration, split the current line by spaces to get individual values.
    sourceText[currentLinePointer] = sourceText[currentLinePointer].split(" ");

    // Parse the first number on the line as the count for the first dimension.
    let countDimA = parseInt(sourceText[currentLinePointer][0], 10);
    // Parse the second number on the line as the count for the second dimension,
    // and then increment the line pointer.
    let countDimB = parseInt(sourceText[currentLinePointer++][1], 10);

    // Check for the termination condition: both counts are zero.
    if (countDimA === 0 && countDimB === 0) {
      break; // Exit the loop if the termination condition is met.
    }

    // Initialize arrays to store prefix sums of lengths for each dimension.
    // `cumulativeLengthsA` for the first dimension, `cumulativeLengthsB` for the second.
    let cumulativeLengthsA = [];
    let cumulativeLengthsB = [];

    // Set the initial prefix sum to zero for both dimensions.
    cumulativeLengthsA[0] = 0;
    cumulativeLengthsB[0] = 0;

    // Calculate prefix sums for the first dimension's segments.
    // Each segment length is read from a new line.
    for (let i = 1; i <= countDimA; i++) {
      cumulativeLengthsA[i] = parseInt(sourceText[currentLinePointer++], 10) + cumulativeLengthsA[i - 1];
    }

    // Calculate prefix sums for the second dimension's segments.
    // Each segment length is read from a new line.
    for (let j = 1; j <= countDimB; j++) {
      cumulativeLengthsB[j] = parseInt(sourceText[currentLinePointer++], 10) + cumulativeLengthsB[j - 1];
    }

    // Initialize frequency maps to store counts of all possible segment lengths for each dimension.
    let dimensionAFrequencies = [];
    let dimensionBFrequencies = [];

    // Determine the maximum possible length that can be formed from either dimension.
    // This sets the upper bound for our frequency maps.
    let overallMaxLength = cumulativeLengthsA[countDimA] > cumulativeLengthsB[countDimB] ? cumulativeLengthsA[countDimA] : cumulativeLengthsB[countDimB];

    // Initialize all entries in the frequency maps to zero up to the maximum possible length.
    for (let k = 0; k <= overallMaxLength; k++) {
      dimensionAFrequencies[k] = dimensionBFrequencies[k] = 0;
    }

    // Populate the frequency map for the first dimension (A).
    // Iterate through all possible start and end points to find all unique segment lengths.
    for (let startPointA = 0; startPointA <= countDimA; startPointA++) {
      for (let endPointA = startPointA + 1; endPointA <= countDimA; endPointA++) {
        // Calculate the length of the segment and increment its count in the frequency map.
        dimensionAFrequencies[cumulativeLengthsA[endPointA] - cumulativeLengthsA[startPointA]]++;
      }
    }

    // Populate the frequency map for the second dimension (B).
    // Iterate through all possible start and end points to find all unique segment lengths.
    for (let startPointB = 0; startPointB <= countDimB; startPointB++) {
      for (let endPointB = startPointB + 1; endPointB <= countDimB; endPointB++) {
        // Calculate the length of the segment and increment its count in the frequency map.
        dimensionBFrequencies[cumulativeLengthsB[endPointB] - cumulativeLengthsB[startPointB]]++;
      }
    }

    let matchingSegmentsTotal = 0; // Initialize a variable to store the final count of matching pairs.

    // Iterate through all possible lengths from 1 up to the overall maximum length.
    // For each length, multiply the frequencies from both dimensions and add to the total.
    for (let currentLength = 1; currentLength <= overallMaxLength; currentLength++) {
      matchingSegmentsTotal += dimensionAFrequencies[currentLength] * dimensionBFrequencies[currentLength];
    }

    // Output the final calculated total for the current test case.
    console.log(matchingSegmentsTotal);
  }
}

// Invoke the main processing function with data read from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));