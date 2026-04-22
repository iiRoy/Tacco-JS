function analyzeElevationProfile(rawInputData) {
  // Initialize a flag to track the feasibility of the sequence.
  // We assume 'Yes' until a violation is found.
  let sequenceFeasibility = 'Yes';

  // --- Input Parsing and Initial Validation ---

  // Check for empty or invalid input data early.
  // An empty input array or one with insufficient elements cannot form a valid sequence.
  if (!rawInputData || rawInputData.length === 0) {
    return 'No';
  }

  // The first element of the input array specifies the expected number of height measurements.
  // Using `Number()` for robust type conversion.
  const declaredSequenceLength = Number(rawInputData[0]);

  // Extract the actual height measurements from the rest of the input array.
  // Each string element is converted to a number.
  const heightMeasurements = rawInputData.slice(1).map(entry => Number(entry));

  // Validate the declared length against the actual number of parsed measurements.
  // Also, a sequence length of zero or less is considered invalid.
  if (declaredSequenceLength <= 0 || heightMeasurements.length !== declaredSequenceLength) {
    return 'No';
  }

  // --- Core Logic for Non-Decreasing Property Check ---

  // `previousSegmentEffectiveHeight` represents the minimum height that the
  // previous segment (H[k-1]) could have been, after its optional modification.
  // It is initialized with the first height, as it has no preceding segment.
  let previousSegmentEffectiveHeight = heightMeasurements[0];

  // Iterate through the height measurements starting from the second element (index 1).
  // The loop continues as long as the sequence is deemed feasible.
  for (let currentSegmentIndex = 1; currentSegmentIndex < declaredSequenceLength; currentSegmentIndex++) {
    const currentSegmentRawHeight = heightMeasurements[currentSegmentIndex];

    // The condition for a "Yes" sequence is that each `h_prime[k]` (modified H[k])
    // must be greater than or equal to `h_prime[k-1]` (previousSegmentEffectiveHeight).
    // Additionally, `h_prime[k]` can only be `H[k]` or `H[k]-1`.

    // Scenario 1: The current raw height is too small.
    // If `H[k]` itself is less than `previousSegmentEffectiveHeight`,
    // it's impossible to maintain the non-decreasing property,
    // because `H[k]-1` would be even smaller.
    if (currentSegmentRawHeight < previousSegmentEffectiveHeight) {
      sequenceFeasibility = 'No';
      break; // Exit early as the sequence is invalid.
    }
    // Scenario 2: The current raw height is exactly equal to the previous effective height.
    // In this case, we can use `H[k]` as the effective height for the current segment.
    // This choice maintains the non-decreasing property and is the smallest possible valid height.
    else if (currentSegmentRawHeight === previousSegmentEffectiveHeight) {
      // previousSegmentEffectiveHeight remains unchanged (or is explicitly set to currentSegmentRawHeight).
      previousSegmentEffectiveHeight = currentSegmentRawHeight;
    }
    // Scenario 3: The current raw height is greater than the previous effective height.
    else { // currentSegmentRawHeight > previousSegmentEffectiveHeight
      // We have two potential choices for `h_prime[k]`: `H[k]` or `H[k]-1`.
      // To maximize our chances for subsequent segments (by keeping the effective height as low as possible),
      // we try to use `H[k]-1` if it satisfies the non-decreasing condition.
      // If `H[k]-1` is still greater than or equal to `previousSegmentEffectiveHeight`,
      // we choose `H[k]-1` as the new effective height.
      if (currentSegmentRawHeight - 1 >= previousSegmentEffectiveHeight) {
        previousSegmentEffectiveHeight = currentSegmentRawHeight - 1;
      }
      // Otherwise, `H[k]-1` is less than `previousSegmentEffectiveHeight`.
      // This situation implies that `H[k]` must be exactly `previousSegmentEffectiveHeight + 1`.
      // In this specific case, we are forced to use `H[k]` itself to satisfy the non-decreasing property.
      // If `H[k]` is used, then `previousSegmentEffectiveHeight` becomes `H[k]`.
      // The previous analysis determined this condition was effectively handled by the original's `else if (current <= H[i] - 1)`
      // and the final `else` being unreachable for this condition.
      // Re-examining for strict equivalence: The original code's `else if (current <= H[i] - 1)`
      // sets `current = H[i]-1`. This implies if `H[i]` is `current+1`, `current` becomes `current`.
      // If `H[i]` is `current+2`, `current` becomes `current+1`.
      // This is precisely what `previousSegmentEffectiveHeight = currentSegmentRawHeight - 1;` does.
      // The only case where `currentSegmentRawHeight - 1 < previousSegmentEffectiveHeight`
      // while `currentSegmentRawHeight > previousSegmentEffectiveHeight` is impossible for integers.
      // Thus, the `else` branch of this `if (currentSegmentRawHeight - 1 >= previousSegmentEffectiveHeight)`
      // is effectively never reached, simplifying the logic.
      // The derived logic is:
      // if (H[i] < current): return 'No'
      // else if (H[i] === current): current = H[i]
      // else if (H[i] > current): current = H[i]-1
      // This is what is implemented.
    }
  }

  // Return the final result.
  return sequenceFeasibility;
}

// --- Global Execution Block ---

// Acquire necessary Node.js modules for file system operations.
const fileSystem = require("fs");

// Define the standard input path and encoding.
const standardInputFile = "/dev/stdin";
const defaultEncoding = "utf8";

// Read the entire content of the standard input.
const rawInputContent = fileSystem.readFileSync(standardInputFile, defaultEncoding);

// Trim any leading/trailing whitespace from the input string.
const cleanedInputString = rawInputContent.trim();

// Split the cleaned input string into an array of individual data points.
// This handles both newline and space delimiters, common in competitive programming.
const parsedInputElements = cleanedInputString.split(/\n|\s/);

// Invoke the main analysis function with the prepared input data.
const finalResult = analyzeElevationProfile(parsedInputElements);

// Output the determined sequence feasibility to standard output.
console.log(finalResult);