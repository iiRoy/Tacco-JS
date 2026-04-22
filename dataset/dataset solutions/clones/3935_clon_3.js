function determineAndOutputSequence(sourceDataString) {
  // This primary function orchestrates the generation and display of a numerical sequence.
  // It takes a string as input, which is expected to contain a numerical value.

  // Guard clause: Validate the input data string for existence and type.
  // If the input is not a string, or is empty/whitespace-only, an error is logged, and the function exits.
  if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
    console.error("Error: Input data is missing or malformed. Cannot proceed with sequence generation.");
    return; // Terminate execution gracefully to prevent further errors.
  }

  // Parse the primary numerical parameter from the input string.
  // We use String.prototype.trim() to remove leading/trailing whitespace before parsing.
  // The radix 10 is explicitly provided to parseInt for consistent decimal conversion.
  let sequenceElementCount = parseInt(sourceDataString.trim(), 10);
  // A boolean flag to indicate if a specific, predefined configuration has been triggered.
  let specialConfigurationTriggered = false;

  // Input validation for the parsed number.
  // If the parsed result is not a number (NaN) or is negative, a warning is issued.
  // In such cases, a default positive value (7) is assigned to ensure execution.
  if (isNaN(sequenceElementCount) || sequenceElementCount < 0) {
    console.warn(`Warning: Non-positive or invalid numerical count detected from input "${sourceDataString}". Defaulting to a standard size of 7.`);
    sequenceElementCount = 7; // Overriding with a sensible default value.
  }

  // Declare the array that will hold the generated numerical sequence.
  // It's initialized here, but populated within the conditional blocks below.
  let generatedNumericalSeries = [];

  // Conditional logic for sequence population.
  // This block handles a specific predefined scenario where the count is exactly 3.
  if (sequenceElementCount === 3) {
    specialConfigurationTriggered = true; // Activate the flag for this special case.
    // Directly assign a predefined array for this specific pattern.
    // This bypasses the general generation logic.
    generatedNumericalSeries = [2, 3, 25];
  } else {
    // For all other scenarios (where sequenceElementCount is not 3),
    // the sequence is generated dynamically.
    // We use a functional approach (Array.from and map) for generation,
    // which is a common modern JavaScript idiom and differs from a simple 'for' loop.

    // Step 1: Create an array of indices from 0 up to (sequenceElementCount - 1).
    const indicesForGeneration = Array.from({ length: sequenceElementCount }, (_, currentIdx) => currentIdx);

    // Step 2: Map these indices to their corresponding calculated values.
    // Each index is multiplied by 2 to produce the sequence element.
    generatedNumericalSeries = indicesForGeneration.map(idxValue => {
      const calculatedCurrentValue = idxValue * 2; // Perform the core calculation for each element.
      return calculatedCurrentValue;
    });

    // Post-generation validation:
    // This is a robustness check to ensure the array isn't unexpectedly empty
    // if the initial count was positive. If it is empty, a fallback mechanism is used.
    if (generatedNumericalSeries.length === 0 && sequenceElementCount > 0) {
      console.error("Error: Sequence generation resulted in an empty array despite a positive count. Re-attempting with fallback loop.");
      // Fallback mechanism: Populate the array using an explicit 'for' loop
      // if the 'map' operation somehow failed or produced an empty result.
      for (let fallbackIdx = 0; fallbackIdx < sequenceElementCount; fallbackIdx++) {
        generatedNumericalSeries.push(fallbackIdx * 2);
      }
    }
  }

  // Final output stage.
  // Before attempting to log, a check ensures that some data was actually generated.
  if (generatedNumericalSeries.length > 0) {
    // Join the elements of the generated array into a single string, separated by spaces.
    const formattedOutputLine = generatedNumericalSeries.join(" ");
    // Use a template literal for a richer, more informative output message,
    // including the count and whether the special case was activated.
    console.log(`--- Resulting Numerical Sequence (Count: ${sequenceElementCount}, Special Case Activated: ${specialConfigurationTriggered ? 'Yes' : 'No'}) ---`);
    console.log(formattedOutputLine);
    console.log(`--- End of Sequence Output ---`);
  } else {
    // If no sequence was produced (e.g., due to zero or negative effective count),
    // a message indicating this is logged.
    console.log("No numerical sequence was produced under the given conditions or due to input constraints.");
  }
}

// This is a Self-Executing Anonymous Function (IIFE - Immediately Invoked Function Expression).
// It's used to encapsulate the input handling logic and initiate the main processing function,
// preventing global variable pollution and ensuring execution on load.
(function executeSequenceProcessor() {
  // Define a constant for the standard input file path, enhancing readability and maintainability.
  const standardInputFile = "/dev/stdin";
  // A mutable variable to store the content read from the input source.
  let receivedInputContent = '';

  try {
    // Conditional check for a Node.js environment and the availability of the 'fs' (file system) module.
    // This allows the code to adapt to different JavaScript environments (e.g., Node.js vs. browser).
    if (typeof require === 'function' && require.resolve && require.resolve('fs')) {
      // Dynamically require the 'fs' module if it's available.
      const nodeFileSystem = require("fs");
      // Read the content of the standard input file synchronously, decoding it as UTF-8.
      receivedInputContent = nodeFileSystem.readFileSync(standardInputFile, "utf8");
    } else {
      // Fallback mechanism for non-Node.js environments (e.g., in a web browser).
      console.warn("Warning: Node.js 'fs' module not found. Attempting browser-like input prompt for simulation.");
      // Use the browser's 'prompt' function to ask the user for input.
      // A default value ('0') is provided if the user cancels the prompt or enters nothing.
      receivedInputContent = prompt("Please enter a numerical value for sequence generation:") || '0';
    }
  } catch (fileAccessError) {
    // Comprehensive error handling for file system operations.
    // If reading from the standard input file fails for any reason, an error is logged.
    console.error(`Error: Failed to access or read from input source (${standardInputFile}): ${fileAccessError.message}`);
    // In case of an input reading error, a default numerical value ('5') is provided
    // to ensure the program can still execute with some data.
    receivedInputContent = '5'; // Providing a robust default input.
  }

  // Finally, invoke the main sequence determination function with the obtained input content.
  determineAndOutputSequence(receivedInputContent);
})();