const fileSystemModule = require('fs'); // Import the file system module
const standardInputPath = '/dev/stdin'; // Define a constant for the input file path

/**
 * Processes a sequence of commands to manipulate a dynamic collection of numbers.
 * Reads commands from standard input, performs operations, and prints the final state.
 */
function manageNumericCollection() {
  // Read all raw data from the specified input path, encoding as UTF-8.
  const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

  // Trim leading/trailing whitespace and split the content into individual lines.
  const commandLines = rawInputContent.trim().split('\n');

  // The first line often contains the total number of operations, which is not directly used
  // in this implementation, so we discard it.
  commandLines.shift();

  // Initialize our mutable collection where operations will be performed.
  let activeCollection = [];

  // Iterate over each remaining line, treating it as a command.
  for (const currentLine of commandLines) {
    // Skip any empty lines that might result from trimming or malformed input.
    if (!currentLine.trim()) {
      continue;
    }

    // Split the current line into parts based on space.
    // The first part is the operation type, the second (if present) is the operand.
    const instructionParts = currentLine.split(' ');
    const operationVerb = instructionParts[0]; // e.g., "insert", "delete"
    const numericOperand = parseInt(instructionParts[1], 10); // Convert the second part to an integer

    // Use a switch statement for clear and structured handling of different command types.
    switch (operationVerb) {
      case 'insert':
        // Ensure the operand is a valid number before inserting.
        if (!isNaN(numericOperand)) {
          activeCollection.unshift(numericOperand); // Add to the beginning of the collection
        }
        break;

      case 'delete':
        // Ensure the operand is a valid number for deletion.
        if (!isNaN(numericOperand)) {
          // Find the first occurrence of the numeric operand in the collection.
          const elementIndex = activeCollection.indexOf(numericOperand);
          // If the element is found (index is not -1), remove it.
          if (elementIndex !== -1) {
            activeCollection.splice(elementIndex, 1); // Remove one element at the found index
          }
        }
        break;

      case 'deleteFirst':
        activeCollection.shift(); // Remove the element from the beginning of the collection
        break;

      case 'deleteLast':
        activeCollection.pop(); // Remove the element from the end of the collection
        break;

      default:
        // Log a warning for any unrecognized commands, but continue processing.
        // console.warn(`Unrecognized command received: "${operationVerb}" in line: "${currentLine}"`);
        break;
    }
  }

  // After processing all commands, join the elements of the final collection with spaces
  // and print the result to standard output.
  console.log(activeCollection.join(' '));
}

// Execute the main function to start processing.
manageNumericCollection();