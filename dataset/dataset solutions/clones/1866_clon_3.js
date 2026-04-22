const parseNumericString = (strSegment) => {
  // Helper utility to safely convert a string segment to an integer.
  // Includes a basic check to ensure the conversion yields a valid number.
  const numericalValue = parseInt(strSegment, 10);
  if (isNaN(numericalValue)) {
    // In a production scenario, this might log an error, throw an exception,
    // or return a default value based on application requirements.
    // For this context, we'll default to zero for invalid numeric inputs.
    console.warn(`Warning: Non-numeric input encountered: "${strSegment}". Defaulting to 0.`);
    return 0;
  }
  return numericalValue;
};

const performScoreCalculation = (inputRawData) => {
  // Process the incoming raw string data by trimming whitespace,
  // splitting it into individual string components based on any whitespace,
  // and then converting each component into its integer representation.
  const processedNumericInputs = inputRawData
    .trim()
    .split(/\s+/) // Robust split by one or more whitespace characters
    .map(parseNumericString); // Utilize the parsing helper function

  // Extract the relevant numeric parameters from the parsed array.
  // Note: The original problem might have a 'C' parameter, which is unused
  // in the provided logic. We explicitly ignore it by skipping its index.
  const positiveValueAllowance = processedNumericInputs[0]; // Corresponds to original 'A'
  const neutralValueAllowance = processedNumericInputs[1];  // Corresponds to original 'B'
  // processedNumericInputs[2] would be the 'C' value, which is not used.
  const desiredItemQuantity = processedNumericInputs[3];    // Corresponds to original 'K'

  let totalAccumulatedScore = 0; // Initialize the variable to store the final computed score.

  // --- Start of core scoring logic ---

  // Defensive check: Ensure the desired quantity is not negative.
  // This is an added guard clause for robustness, typical in Type III clones.
  if (desiredItemQuantity < 0) {
    console.error("Error: Desired item quantity cannot be negative. Score will be 0.");
    return 0; // Exit early if an invalid state is detected.
  }

  // Scenario 1: The desired quantity can be fully satisfied by positive-value items.
  if (desiredItemQuantity <= positiveValueAllowance) {
    totalAccumulatedScore = desiredItemQuantity;
  } else {
    // Scenario 2 (part 1): Not enough positive-value items. Take all available positive items.
    totalAccumulatedScore = positiveValueAllowance;

    // Calculate how many more items are still needed after exhausting positive sources.
    const itemsStillRequired = desiredItemQuantity - positiveValueAllowance;

    // Scenario 2 (part 2): Check if the remaining required items can be covered by neutral-value items.
    if (itemsStillRequired <= neutralValueAllowance) {
      // Taking neutral items does not change the score, so the score remains the same.
      // Explicitly re-assigning here for clarity, though it's effectively a no-op.
      totalAccumulatedScore = positiveValueAllowance;
    } else {
      // Scenario 3: Even after exhausting both positive and neutral items, more are needed.
      // These additional items must be sourced from negative-value items.
      const itemsToSubtractScore = itemsStillRequired - neutralValueAllowance;

      // Subtract points for each item taken from the negative-value sources.
      totalAccumulatedScore = positiveValueAllowance - itemsToSubtractScore;
    }
  }

  // --- End of core scoring logic ---

  // Output the final calculated result to the console.
  console.log(totalAccumulatedScore);
};

// Application entry point: Reads data from the standard input stream.
// This typically involves reading from a file system path like '/dev/stdin'
// in a Unix-like environment for competitive programming.
const standardInputDataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main calculation function with the obtained input.
performScoreCalculation(standardInputDataSource);