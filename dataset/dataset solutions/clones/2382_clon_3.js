function analyzeMeasurementData(inputStringContent) {
  // Split the entire input string into individual lines for sequential processing.
  // Each line is expected to contain space-separated numerical parameters.
  const dataLines = inputStringContent.split("\n");

  // A preliminary check to ensure the fundamental structure of the input is present.
  // This guards against malformed input that doesn't provide enough data lines.
  if (dataLines.length < 3) {
    // If the input structure is incomplete, log an error message and terminate processing.
    // This maintains the output channel (console.log) consistent with the rest of the program.
    console.log("Input_Structure_Error");
    return;
  }

  // --- Parameter Parsing Section ---

  // Parse the first line, which contains time-related components.
  // Convert string tokens directly to numbers using `map(Number)`.
  const timeVectorComponents = dataLines[0].split(" ").map(Number);
  const startTimeValue = timeVectorComponents[0]; // Represents T0 in original
  const endTimeValue = timeVectorComponents[1];   // Represents T1 in original

  // Parse the second line, containing parameters for entity 'A'.
  const paramAGroup = dataLines[1].split(" ").map(Number);
  const paramA_Component1 = paramAGroup[0]; // Represents A0 in original
  const paramA_Component2 = paramAGroup[1]; // Represents A1 in original

  // Parse the third line, containing parameters for entity 'B'.
  const paramBGroup = dataLines[2].split(" ").map(Number);
  const paramB_Component1 = paramBGroup[0]; // Represents B0 in original
  const paramB_Component2 = paramBGroup[1]; // Represents B1 in original

  // --- Core Calculation Section ---

  // Calculate the primary difference factor (analogous to 'Ma').
  // This factor is derived from the starting time and the difference between A's and B's first components.
  let primaryDifferenceFactor = startTimeValue * (paramA_Component1 - paramB_Component1);

  // Calculate the secondary difference factor (analogous to 'Mb').
  // This involves the ending time, second components of A and B, and the primary difference factor.
  let secondaryDifferenceFactor = (endTimeValue * paramA_Component2 + primaryDifferenceFactor) - (endTimeValue * paramB_Component2);

  // --- Decision Logic and Result Output ---

  // Determine the signs of both calculated factors for conditional branching.
  const signOfPrimary = Math.sign(primaryDifferenceFactor);
  const signOfSecondary = Math.sign(secondaryDifferenceFactor);

  let finalCalculatedResult; // Variable to store the computed outcome.

  // First condition: If the signs of both factors are identical (or both are zero).
  if (signOfPrimary === signOfSecondary) {
    finalCalculatedResult = 0;
  }
  // Second condition: If the secondary difference factor is exactly zero.
  // This case is distinct if the signs were not identical (i.e., one was zero and the other non-zero, or different signs).
  else if (secondaryDifferenceFactor === 0) {
    finalCalculatedResult = "infinity";
  }
  // Default case: Signs are different, and the secondary factor is non-zero.
  else {
    // Work with absolute values for the final calculation.
    let absolutePrimary = Math.abs(primaryDifferenceFactor);
    let absoluteSecondary = Math.abs(secondaryDifferenceFactor);

    // Check if the absolute primary factor is perfectly divisible by the absolute secondary factor.
    // Using `Number.isInteger` for a more explicit check than the modulo operator for division results.
    if (Number.isInteger(absolutePrimary / absoluteSecondary)) {
      finalCalculatedResult = (absolutePrimary / absoluteSecondary) * 2;
    } else {
      // If not perfectly divisible, apply a ceiling function and a specific formula.
      finalCalculatedResult = Math.ceil(absolutePrimary / absoluteSecondary) * 2 - 1;
    }
  }

  // Print the final result to the console.
  console.log(finalCalculatedResult);
}

// --- Script Execution Entry Point ---

// This self-invoking anonymous function serves as the main entry point for the script.
// It handles reading input from the standard input stream and delegates to the analysis function.
(function executeAnalysisOnStandardInput() {
  // Dynamically load the Node.js file system module.
  const fileSystemUtility = require("fs");
  // Define the standard input file path, common in Unix-like environments.
  const standardInputFile = "/dev/stdin";
  let receivedInputContent = ""; // Initialize a variable to hold the input content.

  try {
    // Attempt to read the entire content of the standard input file synchronously.
    // Specify 'utf8' encoding to correctly interpret text data.
    receivedInputContent = fileSystemUtility.readFileSync(standardInputFile, "utf8");
  } catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log an error message and exit the script gracefully without further processing.
    console.log(`Input_Read_Error: ${readError.message}`); // Use console.log for consistent output channel
    return; // Halt execution.
  }

  // Once input is successfully read, pass it to the main analysis function.
  analyzeMeasurementData(receivedInputContent);
})();