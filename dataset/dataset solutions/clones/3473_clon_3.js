// Function to safely convert a string value to an integer.
// This utility includes a specified radix for robustness and basic validation.
const convertStringToInteger = (inputValue) => {
  // Ensure the input is treated as a string before attempting to parse it.
  const stringRepresentation = String(inputValue).trim();
  const numericalResult = parseInt(stringRepresentation, 10); // Always use radix 10

  // Guard clause: if parsing results in a non-numeric or non-finite value,
  // return a default (e.g., 0) or handle as an error. For this context, 0 is a safe fallback.
  if (Number.isNaN(numericalResult) || !Number.isFinite(numericalResult)) {
    // In a production environment, one might throw an error here:
    // throw new Error(`Invalid number format detected: "${inputValue}"`);
    return 0; // Returning 0 for invalid inputs maintains predictable behavior.
  }
  return numericalResult;
};

// Calculates the cumulative sum of absolute differences between each adjacent pair
// of numbers within a given numeric sequence. This metric can indicate the 'volatility'
// or 'spread' of values in the sequence.
const computeTotalAdjacentAbsoluteDifference = (numericSequence) => {
  // Guard clause: A sequence requires at least two elements to have adjacent differences.
  if (!Array.isArray(numericSequence) || numericSequence.length < 2) {
    return 0; // No differences can be computed for empty or single-element arrays.
  }

  // Employ Array.prototype.reduce for a concise and functional calculation.
  const cumulativeDifference = numericSequence.reduce((accumulator, currentValue, currentIndex, array) => {
    // Only proceed if there is a subsequent element to compare with.
    if (currentIndex < array.length - 1) {
      const nextValueInSequence = array[currentIndex + 1];
      accumulator += Math.abs(currentValue - nextValueInSequence);
    }
    return accumulator;
  }, 0); // The accumulator is initialized to zero.

  return cumulativeDifference;
};

// --- NOTE: The 'arrangeForMaximizedDifferenceSequence' function below is a Type III clone
// --- of the original 'makeBucket' function. It is provided here as per the cloning
// --- requirements but is NOT utilized by the 'executeNumericalAnalysis' function.
// --- This mirrors the behavior of the original code where 'makeBucket' was defined but unused.
// --- Its purpose is to construct a sequence from a source array, aiming to maximize
// --- the sum of adjacent differences using a specific greedy strategy.

// Utility to safely remove and return an element from either end of an array.
const extractElement = (sourceArr, extractionStrategy) => {
  if (sourceArr.length === 0) return undefined; // No elements to extract.
  return (extractionStrategy === 'from_front') ? sourceArr.shift() : sourceArr.pop();
};

// Utility to add an element to either the beginning or end of an array.
const insertElement = (targetArr, valueToInsert, insertionPoint) => {
  if (insertionPoint === 'at_start') {
    targetArr.unshift(valueToInsert);
  } else { // Defaults to 'at_end'
    targetArr.push(valueToInsert);
  }
};

const arrangeForMaximizedDifferenceSequence = (initialStrategy, sourceArray, desiredLength) => {
  // Robust input validation for the source array.
  if (!Array.isArray(sourceArray) || sourceArray.some(val => typeof val !== 'number' || !Number.isFinite(val))) {
    console.error("Error: 'sourceArray' must be a valid array of finite numbers.");
    return [];
  }
  // Validation for the desired length parameter.
  if (typeof desiredLength !== 'number' || !Number.isInteger(desiredLength) || desiredLength <= 0) {
    console.error("Error: 'desiredLength' must be a positive integer value.");
    return [];
  }

  // Create a mutable copy to prevent altering the original source array.
  const remainingNumbers = [...sourceArray];
  let constructedSequence = [];
  let currentArrangementStrategy = initialStrategy; // e.g., 'from_front' or 'from_back'

  // Adjust desiredLength if it is greater than the number of available elements.
  if (desiredLength > remainingNumbers.length) {
    console.warn(`Warning: The requested length (${desiredLength}) exceeds the available numbers (${remainingNumbers.length}). Adjusting.`);
    desiredLength = remainingNumbers.length;
  }

  // Loop until the constructed sequence reaches the desired length.
  while (constructedSequence.length < desiredLength) {
    let primaryCandidateValue = extractElement(remainingNumbers, currentArrangementStrategy);

    // If no more numbers are available, terminate the construction process.
    if (primaryCandidateValue === undefined) {
      break;
    }

    if (constructedSequence.length === 0) {
      // For an empty sequence, simply add the first candidate value.
      constructedSequence.push(primaryCandidateValue);
    } else {
      // When the sequence is not empty, decide where to place the candidate
      // to maximize the absolute difference with existing end elements.
      const currentFirstElement = constructedSequence[0];
      const currentLastElement = constructedSequence[constructedSequence.length - 1];

      const differenceToStart = Math.abs(currentFirstElement - primaryCandidateValue);
      const differenceToEnd = Math.abs(currentLastElement - primaryCandidateValue);

      let primaryPlacementPoint; // Indicates where the first candidate was placed.
      let secondaryPlacementPoint; // Indicates where a potential second candidate would be placed.

      if (differenceToStart > differenceToEnd) {
        // Place the primary candidate at the start if it creates a larger difference.
        insertElement(constructedSequence, primaryCandidateValue, 'at_start');
        primaryPlacementPoint = 'at_start';
        secondaryPlacementPoint = 'at_end'; // If another element is taken, it goes to the opposite end.
      } else {
        // Otherwise, place it at the end.
        insertElement(constructedSequence, primaryCandidateValue, 'at_end');
        primaryPlacementPoint = 'at_end';
        secondaryPlacementPoint = 'at_start'; // If another element is taken, it goes to the opposite end.
      }

      // After placing the first candidate, check if there's still room and available numbers
      // to immediately place a second candidate in this same step.
      if (constructedSequence.length < desiredLength && remainingNumbers.length > 0) {
        // Take the second candidate from the *same end* as the primary candidate.
        let secondaryCandidateValue = extractElement(remainingNumbers, currentArrangementStrategy);

        if (secondaryCandidateValue !== undefined) {
          // Place the secondary candidate at the *opposite end* from where the primary was placed.
          insertElement(constructedSequence, secondaryCandidateValue, secondaryPlacementPoint);
        } else {
          // If a second element was expected but none were available, break the loop.
          break;
        }
      }
    }

    // Alternate the strategy for drawing elements for the next iteration.
    currentArrangementStrategy = (currentArrangementStrategy === 'from_front') ? 'from_back' : 'from_front';
  }

  return constructedSequence;
};

// Helper function to perform a Fisher-Yates shuffle directly on an array (in-place modification).
const performFisherYatesShuffle = (arrayToShuffle) => {
  let currentElementIndex = arrayToShuffle.length;
  let temporaryHolder, randomSelectedIdx;

  // Continue shuffling until all elements have been considered.
  while (currentElementIndex !== 0) {
    // Select a random index from the remaining unshuffled portion.
    randomSelectedIdx = Math.floor(Math.random() * currentElementIndex);
    currentElementIndex--;

    // Swap the current element with the randomly selected element.
    temporaryHolder = arrayToShuffle[currentElementIndex];
    arrayToShuffle[currentElementIndex] = arrayToShuffle[randomSelectedIdx];
    arrayToShuffle[randomSelectedIdx] = temporaryHolder;
  }
  // This function modifies the array directly; no return value is strictly necessary.
};


// Main execution function responsible for processing raw input,
// conducting multiple randomized shuffles, and identifying the maximum
// total adjacent absolute difference found across all trials.
const executeNumericalAnalysis = (rawDataString) => {
  // Input validation: Ensure the raw data is a non-empty string.
  if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Critical Error: Provided raw data string is empty or invalid.");
    return; // Terminate execution if input is invalid.
  }

  // Parse each line of the input string into an array of integers.
  const parsedInputLines = rawDataString.split(/\r?\n/).map(convertStringToInteger);

  // The first element of the input data specifies the count of numbers to consider (N).
  const countOfElementsToProcess = parsedInputLines[0];

  // Basic validation for the count of elements.
  if (countOfElementsToProcess === 0 || !Number.isInteger(countOfElementsToProcess) || countOfElementsToProcess < 0) {
    console.warn("Warning: The specified count of elements (N) is zero, negative, or not an integer. Processing with available valid data.");
    // In this specific cloning scenario, if N is invalid, the slice might yield an empty array,
    // which is handled by subsequent checks.
  }

  // Extract the actual numerical data, starting from the second line (index 1)
  // up to the `countOfElementsToProcess` specified.
  const initialNumbersForAnalysis = parsedInputLines.slice(1, countOfElementsToProcess + 1);

  // Guard clause: If there are fewer than two numbers, no adjacent differences can be calculated.
  if (initialNumbersForAnalysis.length < 2) {
    console.log(0); // Output 0 as there's no difference to compute.
    return;
  }

  let overallMaxDifferenceFound = 0; // Variable to keep track of the highest difference observed.

  // Define the constant number of randomized trials to perform.
  const NUMBER_OF_SHUFFLE_TRIALS = 10000;

  // Create a mutable copy of the initial numbers array. This array will be shuffled
  // in place repeatedly across all trials, mimicking the original code's behavior.
  let mutableNumbersForShuffling = [...initialNumbersForAnalysis];

  // Conduct multiple randomized trials to explore different arrangements
  // and find the permutation that yields the maximum adjacent difference.
  for (let trialIteration = 0; trialIteration < NUMBER_OF_SHUFFLE_TRIALS; trialIteration++) {
    // Perform an in-place Fisher-Yates shuffle on the mutable array.
    performFisherYatesShuffle(mutableNumbersForShuffling);

    // Calculate the total adjacent absolute difference for the current shuffled sequence.
    const currentSequenceDifference = computeTotalAdjacentAbsoluteDifference(mutableNumbersForShuffling);

    // Update the overall maximum difference if the current trial's result is higher.
    overallMaxDifferenceFound = Math.max(overallMaxDifferenceFound, currentSequenceDifference);
  }

  // Output the final maximum difference discovered after all trials.
  console.log(overallMaxDifferenceFound);
};

// Entry point for script execution: Reads input from standard input
// and passes it to the main analysis function.
executeNumericalAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));