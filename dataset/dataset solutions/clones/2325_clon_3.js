// This script processes numerical input from standard input to perform a specific calculation.

// Standard input setup for Node.js environment
process.stdin.resume();
process.stdin.setEncoding("utf-8");

// A utility function to display results to the console
function logOutput(dataToLog) {
  console.log(dataToLog);
}

let inputDataAccumulator = "";
let processedLinePointer = 0;

// Event listener for incoming data chunks from standard input
process.stdin.on("data", incomingDataChunk => {
  inputDataAccumulator += incomingDataChunk;
});

// Event listener for the end of standard input stream
process.stdin.on("end", () => {
  // Split the accumulated input into an array of lines
  const lines = inputDataAccumulator.split("\n");
  // Filter out any potential empty lines if they exist, to ensure valid processing
  inputDataAccumulator = lines.filter(line => line.trim() !== "");
  
  // Initiate the main application workflow after all input is received
  executePrimaryWorkflow();
});

// Function to retrieve the next line from the processed input buffer
function retrieveNextInputLine() {
  if (processedLinePointer >= inputDataAccumulator.length) {
    // Optionally log an error or return null/undefined if no more lines
    // For this problem, we assume input is always sufficient.
    return null; 
  }
  return inputDataAccumulator[processedLinePointer++];
}

// ************************ End of Input/Output Boilerplate *******************
// ************************** Core Application Logic Begins *******************

/**
 * Executes the primary workflow of the application.
 * This involves reading two numbers from input, performing
 * a series of mathematical operations, and logging the final result.
 */
function executePrimaryWorkflow() {

  // Attempt to read the first line of numerical input
  const rawInputLine = retrieveNextInputLine();

  // Guard clause: Ensure an input line was successfully retrieved
  if (!rawInputLine) {
    logOutput("Error: No input line available for processing.");
    return; // Exit if no input
  }

  // Parse the input line: split by space and convert to numbers
  const stringRepresentations = rawInputLine.split(" ");
  
  // Guard clause: Validate that at least two numbers were provided
  if (stringRepresentations.length < 2) {
    logOutput("Error: Insufficient numerical values provided in input line.");
    return; // Exit if not enough numbers
  }

  // Convert string numbers to actual numerical values
  const numericValuesArray = stringRepresentations.map(strRepresentation => Number(strRepresentation));

  // Extract the two operands using array destructuring
  const [firstOperand, secondOperand] = numericValuesArray;

  // Determine the maximum and minimum values among the two operands
  const maxValue = Math.max(firstOperand, secondOperand);
  const minValue = Math.min(firstOperand, secondOperand);

  // Guard clause: Prevent division by zero if the smaller value is zero
  if (minValue === 0) {
    logOutput("Error: Division by zero is not permitted as the smaller value is zero.");
    return; // Exit if division by zero would occur
  }

  // Calculate the integer part of the division of the larger by the smaller value
  const integerDivisionResult = Math.floor(maxValue / minValue);

  // Calculate the integer part of the product of the two values
  const integerMultiplicationResult = Math.floor(maxValue * minValue);

  // Guard clause: Check if the intermediate division result is zero, which would cause another division by zero
  if (integerDivisionResult === 0) {
    logOutput("Error: Intermediate division result became zero, preventing further calculation.");
    return; // Exit if intermediate result is zero
  }

  // Perform the final calculation: integer product divided by integer division result
  const calculatedFinalOutput = Math.floor(integerMultiplicationResult / integerDivisionResult);

  // Display the computed final result to the user
  logOutput(calculatedFinalOutput);
  
}