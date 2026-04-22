const readInputContent = () => {
  try {
    // Attempt to retrieve data from standard input, ensuring UTF-8 encoding.
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
  } catch (dataAcquisitionError) {
    // Log any issues encountered during input retrieval.
    logErrorDetails(`Failed to read input: ${dataAcquisitionError.message}`);
    // Return an empty string or throw, depending on desired error handling.
    return "";
  }
};

const printFormattedOutput = (resultValue) => {
  // Present the final computed result to the user.
  process.stdout.write(`Solution: ${resultValue}\n`);
};

const logErrorDetails = (issueDescription) => {
  // Report non-critical or diagnostic information to the error stream.
  console.error(`[ERROR - ${new Date().toISOString()}]: ${issueDescription}`);
};

// Internal utility to convert an array of strings to numbers
const stringToNumberArray = (strArr) => strArr.map((item) => Number(item));

const parseAndTransformData = (inputString, processingType) => {
  // This function handles various input parsing requirements based on the specified type.
  // It's designed to be flexible for different data formats.

  if (processingType === 0) {
    // Type 0: Return input as-is, no modification.
    return inputString;
  } else if (processingType === 1) {
    // Type 1: Convert to a single integer.
    return parseInt(inputString, 10);
  } else if (processingType === 2) {
    // Type 2: Split by space, keep as strings.
    return inputString.split(" ");
  } else if (processingType === 3) {
    // Type 3: Split by newline, keep as strings.
    return inputString.split("\n");
  } else if (processingType === 4) {
    // Type 4: Split by space, then convert to an array of numbers.
    return stringToNumberArray(inputString.split(" "));
  } else if (processingType === 5) {
    // Type 5: Split by newline, then convert to an array of numbers. This is a common format.
    const lines = inputString.split("\n");
    return stringToNumberArray(lines);
  } else if (processingType === 6) {
    // Type 6: Split into individual characters as strings.
    return inputString.split("");
  } else if (processingType === 7) {
    // Type 7: Split into individual characters, then convert to an array of numbers.
    return stringToNumberArray(inputString.split(""));
  } else {
    // Default case: If an unsupported processing type is provided, log an error.
    logErrorDetails(`Invalid processing type specified: ${processingType}`);
    throw new Error("Unsupported data transformation mode.");
  }
};

const executeSequenceAnalysis = (rawInputText) => {
  try {
    // Parse the raw input text into a sequence of numeric values.
    let numericInputSequence = parseAndTransformData(rawInputText, 5);

    // The first element typically denotes the total count of relevant items.
    const sequenceSize = numericInputSequence[0];

    // Remove the count from the beginning of the array to process the actual data.
    const sequenceData = numericInputSequence.slice(1);

    // Append a sentinel value (0) to simplify boundary conditions in later loops.
    sequenceData.push(0);

    // Initial validation: The first actual data point must be zero for a valid sequence.
    // This often indicates a starting state or base condition.
    if (sequenceData.at(0) !== 0) {
      printFormattedOutput(-1);
      return;
    }

    // Initialize a difference array (often used in "imos method") to track changes across segments.
    // It's one element larger than sequenceSize to accommodate indices.
    const differenceTracker = new Array(sequenceSize + 1).fill(0);

    // Iterate backward through the sequence to apply segment adjustments.
    // This loop identifies necessary increments/decrements based on adjacent element relationships.
    for (let currentIdx = sequenceSize - 1; currentIdx >= 1; --currentIdx) {
      const currentElement = sequenceData[currentIdx];
      const nextElement = sequenceData[currentIdx + 1];

      // Critical validation: Check for large gaps between consecutive elements.
      // If the next element is more than one greater than the current, the sequence is invalid.
      if (nextElement > currentElement + 1) {
        printFormattedOutput(-1);
        return;
      }

      // Apply "imos" logic: If the current element is greater than or equal to the next,
      // it implies a required adjustment over a range.
      if (currentElement >= nextElement) {
        // Decrement the count at the position immediately following the current element.
        differenceTracker[currentIdx + 1] -= 1;

        // Calculate the starting point for an increment. This is derived from
        // the current element's value, indicating a span.
        const adjustmentStartPoint = currentIdx - (currentElement - 1);

        // Ensure the adjustment start point is within valid array bounds before applying.
        if (adjustmentStartPoint >= 0 && adjustmentStartPoint <= sequenceSize) {
          // Increment the count at the calculated starting point.
          differenceTracker[adjustmentStartPoint] += 1;
        } else {
          // Log a warning if the calculated index is out of expected bounds.
          logErrorDetails(`Calculated adjustmentStartPoint (${adjustmentStartPoint}) is out of bounds for currentIdx ${currentIdx}.`);
        }
      }
      // If nextElement is exactly currentElement + 1, no adjustment is needed for this pair.
      // The sequence is naturally progressing as expected.
      // else if (nextElement === currentElement + 1) { /* No operation needed, continue to next pair */ }
    }

    // Perform a prefix sum (cumulative sum) operation on the differenceTracker.
    // This converts the point-wise changes into actual values for each segment.
    for (let k = 0; k < sequenceSize; ++k) {
      differenceTracker[k + 1] += differenceTracker[k];
    }

    // Calculate the final sum by accumulating values from the transformed differenceTracker.
    // We sum up to `sequenceSize` elements, excluding the last sentinel element.
    const totalAccumulatedValue = differenceTracker
      .slice(0, sequenceSize) // Consider only the relevant parts of the tracker.
      .reduce((sum, val) => sum + val, 0); // Efficiently sum using reduce.

    // Output the final calculated result.
    printFormattedOutput(totalAccumulatedValue);
  } catch (processingError) {
    // Catch any unexpected errors during the analysis process and report them.
    logErrorDetails(`An unhandled error occurred during analysis: ${processingError.message}`);
    // Optionally, output a generic error code to the user.
    printFormattedOutput(-1);
  }
};

// Initiate the entire process: read input, then execute the main analysis function.
executeSequenceAnalysis(readInputContent());