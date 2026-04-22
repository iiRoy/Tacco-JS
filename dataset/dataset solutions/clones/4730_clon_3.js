// This module is designed to process numerical input received via standard input (stdin).
// It categorizes the input number based on a predefined threshold value.

// Define core constants for the application logic.
// These constants enhance readability and maintainability, addressing Type III requirements.
const REFERENCE_NUMERIC_BOUNDARY = 1200; // The pivotal value for comparison logic.
const CLASSIFICATION_LOW_BAND = "ABC";     // Output string for values below the boundary.
const CLASSIFICATION_HIGH_BAND = "ARC";    // Output string for values at or above the boundary.

// Introduce a counter to keep track of the number of input data packets processed.
// This is an additional fragment (Type III) to provide more context during execution.
let inputPacketCounter = 0;

// Configure the standard input stream to interpret data as UTF-8 encoded text.
// This is a standard setup step (Type II - similar to original but re-commented).
process.stdin.setEncoding('utf8');

// Define the primary function responsible for handling each incoming chunk of data from stdin.
// Using an arrow function and a descriptive name, fulfilling Type II renaming.
const processIncomingDataChunk = (rawInputBuffer) => {
  // Increment the counter for every piece of data received.
  inputPacketCounter++;

  // Convert the buffer chunk to a string, trim any leading/trailing whitespace,
  // and then parse it as an integer using radix 10 for explicit conversion.
  // This includes Type II updates (trim, radix) and Type III intermediate steps.
  const currentNumericValue = parseInt(rawInputBuffer.toString().trim(), 10);

  // Implement a robust Type III guard clause: check for invalid numerical input.
  // If the parsed value is not a number (NaN), an error is logged, and processing for this chunk stops.
  if (isNaN(currentNumericValue)) {
    console.error(`Error: Non-numeric data detected in packet #${inputPacketCounter}. This input will be skipped.`);
    return; // Exit the handler for this invalid input.
  }

  // Declare a variable to hold the outcome of the classification.
  // This is an intermediate variable (Type III addition) for clearer logic flow.
  let outcomeCategory;

  // Utilize an if-else structure for the conditional logic instead of a ternary operator.
  // This represents a Type III rewrite of the original comparison statement.
  if (currentNumericValue < REFERENCE_NUMERIC_BOUNDARY) {
    outcomeCategory = CLASSIFICATION_LOW_BAND;
  } else {
    outcomeCategory = CLASSIFICATION_HIGH_BAND;
  }

  // Output the final determined category to the console.
  // The core logging functionality remains, but now uses the categorized variable.
  console.log(outcomeCategory);
};

// Attach the data processing function to the 'data' event of standard input.
// This sets up the event-driven mechanism for handling input.
process.stdin.on('data', processIncomingDataChunk);

// Add an 'end' event listener to signify when the standard input stream has closed.
// This is a Type III addition, providing system feedback and a summary.
process.stdin.on('end', () => {
  console.info(`\nStandard input stream has concluded. Total data packets processed: ${inputPacketCounter}.`);
  // Further cleanup or final reporting could be implemented here.
});

// A Type III addition: an initial informational message to indicate the script is active.
// The original `process.stdin.resume()` is omitted here as `on('data')` often implicitly handles resumption
// in modern Node.js environments, thus making its removal a valid Type III deletion of a non-essential statement.
console.info("Application initialized. Awaiting numerical data from standard input...");