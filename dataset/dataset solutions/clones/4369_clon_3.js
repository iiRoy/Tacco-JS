// Function to process raw input and determine the count of elements with odd occurrences.
// This function takes a raw string containing multiple lines of data.
function processInputData(sourceText) {
  // Implement a guard clause for robustness: check if the input string is empty or null.
  if (!sourceText || sourceText.trim().length === 0) {
    console.error("Provided source data is empty. Unable to perform analysis.");
    return 0; // Return a default value indicating no odd occurrences found.
  }

  // Split the incoming raw string into an array of lines.
  // Using a regular expression to handle both Windows (\r\n) and Unix (\n) line endings.
  const lineSegments = sourceText.split(/\r?\n/);

  // In many competitive programming scenarios, the first line specifies the count of subsequent items.
  // Although not strictly essential for the core logic of counting odd occurrences,
  // we extract it here as an illustrative Type III addition (intermediate step/helper variable).
  const expectedItemCount = parseInt(lineSegments.shift(), 10); 
  // It's good practice to filter out any empty strings that might result from splitting,
  // especially if the input has trailing newlines or multiple consecutive newlines.
  const dataItems = lineSegments.filter(line => line.length > 0);

  // Initialize a Map to serve as our status tracker.
  // A Map is generally preferred over a plain object for dynamic key-value storage,
  // especially when keys might not be simple strings or when iteration order matters (though not here).
  const statusTracker = new Map();
  let oddOccurrenceCount = 0; // This variable accumulates the final result.

  // Iterate through each data item received from the input.
  // Using a 'for...of' loop provides a clean and modern way to iterate over array elements.
  for (const currentItem of dataItems) {
    // Check the current status of the item in our tracker.
    // If the item exists and its value is 'true', it means it has appeared an odd number of times so far.
    // The `|| false` ensures that if `get` returns `undefined`, `isCurrentlyActive` becomes `false`.
    const isCurrentlyActive = statusTracker.get(currentItem) || false;

    // Based on the current status, update the tracker and the overall count.
    if (isCurrentlyActive) {
      // If the item was active, this occurrence makes its total count even.
      // So, we mark it as inactive (false) and decrement the global count.
      statusTracker.set(currentItem, false);
      oddOccurrenceCount--;
    } else {
      // If the item was not active (either new or previously even), this occurrence makes it odd.
      // We mark it as active (true) and increment the global count.
      statusTracker.set(currentItem, true);
      oddOccurrenceCount++;
    }
  }

  // Return the final calculated count of elements that have appeared an odd number of times.
  return oddOccurrenceCount;
}

// This function acts as the main execution entry point for the program.
// It handles file system interactions and calls the core processing logic.
function initiateExecutionFlow() {
  // Dynamically load the Node.js file system module.
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin"; // Standard path for reading input in typical environments.

  try {
    // Read the entire file content synchronously, decoding it as UTF-8.
    const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
    
    // Pass the raw content to our processing function.
    const finalResult = processInputData(rawInputContent);
    
    // Output the computed result to the console.
    console.log(finalResult);
  } catch (error) {
    // Implement robust error handling for file operations or processing failures.
    console.error(`An error occurred during execution: ${error.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1); 
  }
}

// Begin the program by calling the execution flow initiator.
initiateExecutionFlow();