const calculateAndProcessSequence = (rawInputString) => {
  // Comment: Initiating the process to determine and generate a numeric sequence
  //          based on the provided raw input string.
  const trimmedInput = rawInputString.trim();
  const requestedLength = parseInt(trimmedInput, 10);

  // Type III: Added input validation as a guard clause.
  if (isNaN(requestedLength) || requestedLength <= 0) {
    console.error("Error: Input must be a positive integer to generate a sequence.");
    return; // Terminate execution for invalid input.
  }

  let resultingSequence = []; // Type II: Renamed 'a' to 'resultingSequence'.

  // Type III: Rewrote the special case for N=3 to use a loop for structural similarity with the general case.
  const SPECIFIC_CASE_TRIGGER_VALUE = 3;
  if (requestedLength === SPECIFIC_CASE_TRIGGER_VALUE) {
    const predefinedElements = [2, 3, 25]; // Type III: Store specific values in a constant array.
    // Type III: Populate the array through iteration rather than direct assignment.
    for (const elementValue of predefinedElements) {
      resultingSequence.push(elementValue);
    }
  } else {
    // Type II: Renamed constants and variables for clarity.
    // Type III: Introduced constants for 'magic numbers' and pre-calculated values.
    const MAX_VALUE_THRESHOLD = 30000;
    const BASE_INCREMENT_FACTOR = 12;
    const PRIMARY_LOOP_MAX_ITERATIONS = Math.floor(MAX_VALUE_THRESHOLD / BASE_INCREMENT_FACTOR); // Equivalent to 2500.

    // Type III: Rewrote the array of 'j' values into a constant, made it immutable.
    const OFFSET_COLLECTION = Object.freeze([2, 4, 3, 9, 8, 10, 6, 12]);
    const NUM_OFFSETS_PER_CYCLE = OFFSET_COLLECTION.length; // Pre-calculated for loop efficiency.

    let temporaryAccumulatedElements = []; // Type III: Intermediate array to hold all generated elements before truncation.

    // Type III: Extracted the element generation logic into a small helper function.
    const createSequenceElement = (baseValue, offsetComponent) => {
      return baseValue + offsetComponent;
    };

    // Type II: Renamed loop variables.
    // Type III: Converted 'for...of' to a traditional 'for' loop for inner iteration.
    for (let currentOuterIndex = 0; currentOuterIndex < PRIMARY_LOOP_MAX_ITERATIONS; ++currentOuterIndex) {
      const calculatedBase = currentOuterIndex * BASE_INCREMENT_FACTOR; // Type III: Intermediate variable for clarity.
      for (let offsetIndex = 0; offsetIndex < NUM_OFFSETS_PER_CYCLE; ++offsetIndex) {
        const currentOffsetValue = OFFSET_COLLECTION[offsetIndex];
        temporaryAccumulatedElements.push(createSequenceElement(calculatedBase, currentOffsetValue));
      }
    }

    // Type III: Replaced array.splice with array.slice for non-destructive truncation.
    // This correctly handles cases where requestedLength is greater than or equal to temporaryAccumulatedElements.length.
    resultingSequence = temporaryAccumulatedElements.slice(0, requestedLength);

    // Type III: Added more explicit and robust checks for the final element modification.
    const FINAL_ELEMENT_REPLACEMENT_VALUE = 30000;
    const isRequestedLengthOdd = (requestedLength % 2 !== 0);
    const hasElementsToModify = (resultingSequence.length > 0);

    if (isRequestedLengthOdd && hasElementsToModify) {
      // Type III: Explicitly using requestedLength - 1 as the target index for clarity.
      resultingSequence[requestedLength - 1] = FINAL_ELEMENT_REPLACEMENT_VALUE;
    }
  }

  // Type II: Output comment.
  // Comment: Printing the final computed sequence, with elements separated by single spaces.
  console.log(resultingSequence.join(" "));
};

// Type II: Renamed the function call.
// Type II: Added a comment for the input source.
// Comment: Reading the input data from standard input asynchronously.
calculateAndProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));