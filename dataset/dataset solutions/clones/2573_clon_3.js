const ProcessInputData = (rawData) => {
  // Validate the initial input to ensure it's a non-empty string.
  if (typeof rawData !== 'string' || rawData.trim() === '') {
    console.error("Error: Input data is either empty or not a valid string.");
    return; // Exit if input is invalid.
  }
  
  // Split the raw input into individual lines for further processing.
  const inputLines = rawData.split('\n');

  // The first line typically indicates a size, though its direct use might vary.
  // We parse it for completeness but often rely on array lengths for iteration bounds.
  const datasetSizeIndicator = Number(inputLines[0]); 

  // Parse the subsequent lines into arrays of numbers.
  // Each line is split by space and then mapped to its numerical equivalent.
  const primarySequence = inputLines[1].split(' ').map(Number);
  const baseValues = inputLines[2].split(' ').map(Number);
  const supplementaryBonuses = inputLines[3].split(' ').map(Number);

  // A reusable utility function to compute the sum of all numeric elements in an array.
  // Utilizes the 'reduce' method for concise aggregation.
  const computeArraySum = (numericalArray) => {
    // Basic validation for the array passed to the sum function.
    if (!Array.isArray(numericalArray) || numericalArray.some(isNaN)) {
      console.warn("Warning: Attempted to sum an invalid or non-numeric array. Returning 0.");
      return 0;
    }
    return numericalArray.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
  };

  // Initialize the grand total with the sum of the base values.
  let grandTotalScore = computeArraySum(baseValues);

  // Determine the effective upper bound for the loop to prevent out-of-bounds access.
  // We need to access `primarySequence[currentIdx + 1]`, so the loop must end one element earlier.
  const loopUpperBound = primarySequence.length - 1;

  // Iterate through the primary sequence to apply conditional adjustments to the total score.
  for (let currentIdx = 0; currentIdx < loopUpperBound; currentIdx++) {
    const currentPrimaryValue = primarySequence[currentIdx];
    const nextPrimaryValue = primarySequence[currentIdx + 1];

    // Check if the current and subsequent values in the primary sequence form a consecutive pair.
    // That is, if the next value is exactly one greater than the current value.
    const areValuesConsecutive = (currentPrimaryValue + 1 === nextPrimaryValue);

    // If the condition for consecutive values is met, add a bonus.
    if (areValuesConsecutive) {
      // Ensure that a corresponding bonus value exists at the current index.
      if (currentIdx < supplementaryBonuses.length) {
        grandTotalScore += supplementaryBonuses[currentIdx];
      } 
      // Optional: Add a log here if a bonus is expected but missing, for debugging.
      // else {
      //   console.debug(`Debug: No supplementary bonus found at index ${currentIdx}.`);
      // }
    }
  }

  // Output the final calculated total score to the console.
  console.log(grandTotalScore);
};

// Standard execution boilerplate for Node.js environments:
// Reads all data from standard input, decodes it as UTF-8, and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));