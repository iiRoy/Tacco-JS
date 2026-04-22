// Helper function responsible for safely retrieving input data from the standard input stream.
const acquireInputData = () => {
  try {
    // Attempt to read the entire content of stdin as a UTF-8 string.
    return require("fs").readFileSync("/dev/stdin", "utf8");
  } catch (dataAcquisitionError) {
    // Log any errors encountered during the input reading process.
    console.error("An error occurred while attempting to read standard input:", dataAcquisitionError.message);
    // In case of an error, provide a safe, default string to prevent crashes,
    // which will likely be handled by subsequent validation steps.
    return "0 0";
  }
};

// A dedicated function to perform the core conditional arithmetic operation.
// It takes two validated numeric operands as arguments.
const performConditionalCalculation = (firstNumericOperand, secondNumericOperand) => {
  // Calculate the remainder of the second number divided by the first.
  // This intermediate variable makes the logic clearer.
  const modulusResult = secondNumericOperand % firstNumericOperand;

  let finalOperationResult; // Declare a variable to store the outcome of the calculation.

  // Check if the modulus result is exactly zero, indicating perfect divisibility.
  if (modulusResult === 0) {
    // If divisible, sum the two operands.
    finalOperationResult = firstNumericOperand + secondNumericOperand;
  } else {
    // Otherwise (not perfectly divisible), subtract the first from the second operand.
    finalOperationResult = secondNumericOperand - firstNumericOperand;
  }

  // Return the computed result.
  return finalOperationResult;
};

// The primary function that orchestrates the entire program execution flow.
// It takes the raw input string as its argument.
const orchestrateProgramExecution = (rawInputString) => {
  // --- Input Validation and Pre-processing ---

  // Initial check for null, undefined, or empty input string.
  if (!rawInputString || rawInputString.length === 0) {
    console.error("Error: No input data was provided. Program cannot proceed.");
    return; // Terminate execution early.
  }

  // Clean the input string by removing leading/trailing whitespace and then split it into lines.
  const contentLines = rawInputString.trim().split('\n');

  // Validate that there is at least one line of content.
  if (contentLines.length === 0) {
    console.error("Error: Input data contains no discernible lines. Program cannot proceed.");
    return; // Terminate execution early.
  }

  // Extract the first line, which is expected to contain the two numbers.
  const primaryInputLine = contentLines[0];

  // Split the primary input line into string tokens based on space delimiter.
  const numberStringTokens = primaryInputLine.split(' ');

  // Validate that at least two numeric tokens are present on the first line.
  if (numberStringTokens.length < 2) {
    console.error("Error: Insufficient numeric values found in the first line of input. Expected 2.");
    return; // Terminate execution early.
  }

  // --- Numeric Parsing and Further Validation ---

  // Convert the first string token to a number. Using Number() for explicit type conversion.
  const valueForFirstOperand = Number(numberStringTokens[0]);
  // Convert the second string token to a number.
  const valueForSecondOperand = Number(numberStringTokens[1]);

  // Check if either of the parsed values resulted in NaN (Not a Number).
  if (isNaN(valueForFirstOperand) || isNaN(valueForSecondOperand)) {
    console.error("Error: Invalid numeric input detected. Please ensure all values are valid integers.");
    return; // Terminate execution early.
  }

  // --- Specific Guard Clause for Division by Zero Scenario ---
  // If the first operand is zero, the modulo operation (valueForSecondOperand % valueForFirstOperand)
  // would result in NaN. The original logic implicitly handles this by `NaN === 0` being `false`,
  // leading to the `else` branch (subtraction). We make this explicit for clarity.
  if (valueForFirstOperand === 0) {
    const zeroDivisionOutcome = valueForSecondOperand - valueForFirstOperand; // This will effectively be valueForSecondOperand
    console.log(zeroDivisionOutcome);
    return; // Exit after printing the specific outcome for A=0.
  }

  // --- Core Calculation and Output ---

  // Call the dedicated calculation function with the validated numeric operands.
  const finalComputedValue = performConditionalCalculation(valueForFirstOperand, valueForSecondOperand);

  // Display the final result to the console.
  console.log(finalComputedValue);
};

// Initiate the program by first acquiring the input data, then passing it to the main orchestration function.
orchestrateProgramExecution(acquireInputData());