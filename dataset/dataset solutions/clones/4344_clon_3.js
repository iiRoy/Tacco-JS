const processInputData = (sourceContent) => {
  // This routine processes raw text input to perform a specific numerical computation.
  // It expects two numeric values, each on a new line, from the provided string.

  if (typeof sourceContent !== 'string' || sourceContent.length === 0) {
    console.error("Input processing error: Provided source content is invalid or empty.");
    return null; // Return null to indicate failure
  }

  // Splitting the entire content into individual lines.
  const contentLines = sourceContent.split('\n');

  // Basic validation: ensure we have at least two lines for our expected inputs.
  if (contentLines.length < 2) {
    console.error("Input data insufficient. Expected at least two lines for computation.");
    return null;
  }

  // Extracting and cleaning the first line for the base value.
  const firstLineText = contentLines[0].trim();
  const numericalBase = Number(firstLineText); // Using Number() for parsing, a common alternative to parseInt.

  // Validation: Check if the parsed base number is actually a number.
  if (isNaN(numericalBase)) {
    console.error(`Data parsing error: '${firstLineText}' is not a valid number for the base value.`);
    return null;
  }

  // Extracting and cleaning the second line for the deduction term.
  const secondLineText = contentLines[1].trim();
  const deductionTerm = Number(secondLineText); // Consistency in parsing method.

  // Validation: Check if the parsed deduction term is actually a number.
  if (isNaN(deductionTerm)) {
    console.error(`Data parsing error: '${secondLineText}' is not a valid number for the deduction term.`);
    return null;
  }

  // Performing intermediate calculation steps for clarity.
  const baseValueSquared = numericalBase * numericalBase;
  const finalComputedValue = baseValueSquared - deductionTerm;

  // Outputting the result with a descriptive message.
  // Using console.info for informational output.
  console.info(`Calculation completed: The result is ${finalComputedValue}`);

  // Optionally, return the computed value for potential external use.
  return finalComputedValue;
};

// This immediately-invoked function expression (IIFE) serves as the application's entry point.
// It handles reading from the standard input stream and then delegates to the primary processing function.
(function initializeApplicationExecution() {
  try {
    // Attempting to read the entire content of standard input synchronously.
    // The 'utf8' encoding is specified for text interpretation.
    const rawSystemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoking the main data processing routine with the acquired input.
    processInputData(rawSystemInputContent);

  } catch (operationError) {
    // Catching and reporting any errors that occur during file reading or initial processing.
    console.error("An unexpected error occurred during application initialization or input reading:", operationError.message);
  }
})();