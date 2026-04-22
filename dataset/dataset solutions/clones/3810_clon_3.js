// Core logic for performing a conditional subtraction based on a numeric modifier.
const calculateConditionalDifference = (val1, val2, modifier) => {
  // For robustness, ensure the modifier is treated as a number.
  // If it's not a number, we might default or throw, but here we assume valid parse.
  const numericModifier = Number(modifier);

  // Determine if the numeric modifier value is an even number.
  const isModifierValueEven = (numericModifier % 2 === 0);

  let finalResultValue;
  // Based on the parity, compute the difference between the two input values.
  if (isModifierValueEven) {
    finalResultValue = val1 - val2;
  } else {
    finalResultValue = val2 - val1;
  }
  return finalResultValue;
};

// Main entry point for processing the system's input stream.
const processSystemInput = (rawInputContent) => {
  // Preliminary validation: Check if the input is a valid string and not empty.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    console.error("Error: Received invalid or empty input content. Aborting processing.");
    return; // Exit early if input is not suitable.
  }

  // Divide the raw input string into distinct sections using a space as the primary delimiter.
  const inputSections = rawInputContent.split(' ');

  // Define the minimum number of sections expected for a valid operation.
  // (e.g., value1, value2, value3(unused), modifierString)
  const requiredSectionCount = 4;
  if (inputSections.length < requiredSectionCount) {
    console.error(`Error: Insufficient input sections. Expected at least ${requiredSectionCount}, but received ${inputSections.length}.`);
    return; // Terminate if the input format is incomplete.
  }

  // Parse the first two sections into floating-point numbers.
  // parseFloat is used for general numeric parsing, handling potential decimals.
  const primaryOperand = parseFloat(inputSections[0]);
  const secondaryOperand = parseFloat(inputSections[1]);

  // Note: The third section (inputSections[2]) is parsed in the original but never utilized.
  // We explicitly omit processing it here to reflect its non-essential nature in the logic.
  // const tertiaryOperand = parseFloat(inputSections[2]); // This line is intentionally removed.

  // Retrieve the string that serves as the operation modifier.
  const modifierSourceString = inputSections[3];

  // Extract the very last character from the modifier string.
  // Add a defensive check for an empty modifier string.
  let lastCharOfModifier = '';
  if (modifierSourceString.length > 0) {
      lastCharOfModifier = modifierSourceString.slice(-1);
  } else {
      console.warn("Warning: Modifier string was empty. Defaulting to '0' for parity check.");
      lastCharOfModifier = '0'; // Provide a default if the string is unexpectedly empty.
  }

  // Convert the extracted character into an integer for the parity check.
  // A radix of 10 is specified for explicit decimal parsing.
  const numericalParityCheckValue = parseInt(lastCharOfModifier, 10);

  // Execute the core calculation using the dedicated helper function.
  const finalComputedOutcome = calculateConditionalDifference(
    primaryOperand,
    secondaryOperand,
    numericalParityCheckValue
  );

  // Output the final computed result to the standard output stream.
  console.log(finalComputedOutcome);
};

// Entry point for execution in a Node.js environment.
// Reads data from standard input asynchronously and passes it to the processing function.
try {
    const fileSystemModule = require("fs");
    const bufferFromStdin = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processSystemInput(bufferFromStdin);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or initial processing.
    console.error("An error occurred during program execution:", executionError.message);
    // Depending on requirements, could also exit with a non-zero status code here.
}