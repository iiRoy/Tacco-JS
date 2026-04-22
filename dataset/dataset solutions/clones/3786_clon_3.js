// This function serves as the core processing unit for handling numerical operations
// based on a given string input. Its primary goal is to identify the largest
// possible outcome from three fundamental arithmetic calculations: addition,
// subtraction, and multiplication, using two numbers parsed from the input.
function ProcessInputData(rawInputPayload) {
  // Defensive programming check: Ensure the input received is indeed a string.
  // This prevents potential runtime errors if an unexpected data type is provided.
  if (typeof rawInputPayload !== 'string') {
    console.error("Execution Aborted: The provided input payload must be a string type.");
    return; // Terminate execution gracefully or consider throwing an error.
  }

  // Stage 1: Pre-processing the raw input string.
  // Remove any leading or trailing whitespace characters to ensure clean parsing.
  const cleanedInputString = rawInputPayload.trim();

  // Stage 2: Decomposing the cleaned string.
  // Split the string into an array of substrings using a space as the delimiter.
  // This assumes the two numerical values are separated by a single space.
  const stringSegments = cleanedInputString.split(" ");

  // Stage 3: Input validation - Quantity check.
  // Verify that exactly two numerical segments were extracted from the input.
  // Incorrect segment count indicates malformed input, which is reported.
  if (stringSegments.length !== 2) {
    console.error("Input Parsing Error: Expected precisely two numbers separated by a space. Found: " + stringSegments.length + " segments.");
    return; // Halt further processing due to invalid input structure.
  }

  // Stage 4: Type conversion - String to Number.
  // Map each string segment to its numerical representation.
  // The `Number` constructor handles various string formats and returns `NaN` for invalid ones.
  const numericalOperands = stringSegments.map(Number);

  // Stage 5: Extracting and validating individual numeric values.
  // Assign the parsed numbers to distinct, clearly named variables.
  const firstNumericTerm = numericalOperands[0];
  const secondNumericTerm = numericalOperands[1];

  // Additional validation: Check if the conversion resulted in 'Not-a-Number'.
  // This catches cases where the string segments were not valid numerical representations.
  if (isNaN(firstNumericTerm) || isNaN(secondNumericTerm)) {
      console.error("Data Conversion Error: One or both input segments could not be converted into valid numbers.");
      return; // Prevent calculations with invalid numeric data.
  }

  // Stage 6: Performing the required arithmetic computations.
  // Calculate the sum of the two extracted numbers.
  const resultOfAddition = firstNumericTerm + secondNumericTerm;
  // Calculate the difference (first number minus the second).
  const resultOfSubtraction = firstNumericTerm - secondNumericTerm;
  // Calculate the product (multiplication) of the two numbers.
  const resultOfMultiplication = firstNumericTerm * secondNumericTerm;

  // Stage 7: Determining the ultimate maximum value.
  // Use the `Math.max` utility to find the largest among the three computed results.
  const finalMaximumOutcome = Math.max(resultOfAddition, resultOfSubtraction, resultOfMultiplication);

  // Note: An earlier version of this logic might have included a specific check
  // for the JavaScript quirk of `-0`. For this refined implementation,
  // we are omitting that explicit conversion, as `-0` generally behaves
  // identically to `0` in most arithmetic and comparison contexts.
  // For instance, `(-0 === 0)` evaluates to `true`.

  // Stage 8: Outputting the computed result.
  // Display the final maximum value to the standard output console.
  console.log(finalMaximumOutcome);
}

// --- Application Entry Point and Input Handling ---

// Define the standard path for reading input in typical Unix-like environments,
// frequently used in competitive programming platforms.
const standardInputSourcePath = "/dev/stdin";

// Utilize Node.js's built-in File System module (`fs`) to synchronously
// read the entire content of the specified standard input file.
// The content is assumed to be encoded in UTF-8.
const contentFromStandardInput = require("fs").readFileSync(standardInputSourcePath, "utf8");

// Initiate the primary processing function with the data obtained from standard input.
// This kicks off the entire logic flow defined above.
ProcessInputData(contentFromStandardInput);