// This script processes numerical input from standard input to perform specific calculations.
// It's designed to read a single line containing two space-separated numbers,
// then compute their product and the perimeter of a rectangle with those dimensions.

// A dynamic array to accumulate all incoming lines from the input stream.
const receivedInputLines = [];

// Configuration object for the readline interface.
// Note: 'output' stream is not strictly necessary for input-only tasks,
// but often included for completeness or interactive prompts. Here, we omit it
// to demonstrate a minor structural change.
const streamConfiguration = {
  input: process.stdin,
  // output: process.stdout // Omitted as it's not essential for this specific input processing task.
};

// Initialize the line-by-line input handler using the 'readline' module.
const inputLineProcessor = require('readline').createInterface(streamConfiguration);

// Event handler for each line of text received from standard input.
inputLineProcessor.on('line', (currentInputSegment) => {
  // Sanitize the input line by trimming leading/trailing whitespace.
  const cleanedLine = currentInputSegment.trim();

  // Only store non-empty lines to prevent processing spurious blank entries.
  if (cleanedLine.length > 0) {
    receivedInputLines.push(cleanedLine);
  } else {
    // A potential logging point for debug purposes, indicating an empty line was skipped.
    // console.warn("Debug: An empty line was encountered and skipped.");
  }
});

// Event handler triggered when the input stream has completely ended.
inputLineProcessor.on('close', () => {
  // Once all input has been collected, invoke the core processing routine.
  performCoreCalculations(receivedInputLines);
});

/**
 * Executes the primary computational logic using the aggregated input data.
 * @param {string[]} gatheredDataSegments - An array of strings, each representing a line of input.
 */
function performCoreCalculations(gatheredDataSegments) {
  // Implement a guard clause to ensure input data is available.
  if (!gatheredDataSegments || gatheredDataSegments.length === 0) {
    console.error("Error: No valid input data was supplied for the computation.");
    return; // Terminate execution if no data.
  }

  // Define a constant for the expected delimiter within the input line.
  const valueSeparator = ' ';

  // Access the very first line of input. For competitive programming, this is often the only line.
  // Using .at(0) is a modern equivalent to [0].
  const primaryInputString = gatheredDataSegments.at(0);

  // Another validation step for the primary input string's existence.
  if (!primaryInputString) {
      console.error("Error: The primary input string is undefined or null, despite collected lines.");
      return;
  }

  // Split the input string into individual numerical components.
  // Using a regex /\s+/ handles multiple spaces between numbers robustly.
  const numericalComponents = primaryInputString.split(/\s+/);

  // Validate that exactly two numerical components were parsed.
  if (numericalComponents.length !== 2) {
    console.error(`Error: Expected exactly two numerical values, but found ${numericalComponents.length} components.`);
    return;
  }

  // Convert the string components into actual numbers.
  // Using Number() for explicit type conversion.
  const operandAlpha = Number(numericalComponents[0]);
  const operandBeta = Number(numericalComponents[1]);

  // Final validation step: ensure the parsed values are indeed numbers.
  if (isNaN(operandAlpha) || isNaN(operandBeta)) {
    console.error(`Error: One or both parsed values are not valid numbers. Received: "${numericalComponents[0]}", "${numericalComponents[1]}"`);
    return;
  }

  // Perform the first required calculation: the product.
  const resultProduct = operandAlpha * operandBeta;

  // Perform intermediate steps for the second calculation: sum and then double.
  const intermediateSum = operandAlpha + operandBeta;
  const resultDoubledSum = intermediateSum * 2;

  // Define a constant for the output formatting separator.
  const outputFormatSeparator = ' ';

  // Construct the final output string using a template literal for improved readability.
  const finalFormattedOutput = `${resultProduct}${outputFormatSeparator}${resultDoubledSum}`;

  // Output the computed results to standard output.
  console.log(finalFormattedOutput);
}