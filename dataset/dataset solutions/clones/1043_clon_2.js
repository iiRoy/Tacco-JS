// Initialize the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Establish a callback function to execute whenever new data arrives on the standard input.
process.stdin.on(
  'data',
  // This anonymous arrow function processes each segment of input received.
  (inputSegment) => {
    // Transform the raw input segment into a structured list of instructions:
    // 1. Convert the Buffer object to a string representation.
    // 2. Remove any leading or trailing whitespace from the entire string.
    // 3. Split the string into individual lines based on the newline character.
    // 4. Discard the very first line of the input (often a count or header, not a command).
    // 5. For each remaining line, further split it by spaces to get command tokens.
    const operationSequence = inputSegment
      .toString()
      .trim()
      .split('\n')
      .slice(1)
      .map((tokenString) => {
        // Each token string is now an array of words, e.g., ['add', 'element1'].
        return tokenString.split(' ');
      });

    // Create an empty JavaScript object to serve as a registry for tracking added items.
    // This object will effectively act as a hash set, storing keys to indicate presence.
    const itemRegistry = {};

    // Iterate over each command array within our processed operation sequence.
    operationSequence.forEach((currentOperation) => {
      // Examine the first token of the current command to determine its type.
      if (currentOperation[0] === 'store') {
        // If the command is 'store', add the second token (the item itself) to the registry.
        // Assigning 'true' as the value indicates that the item is now present.
        itemRegistry[currentOperation[1]] = true;
      } else if (currentOperation[0] === 'query') {
        // If the command is 'query', check if the second token (the item to query) exists in the registry.
        // Use the 'in' operator for an efficient property existence check.
        // Output 'present' if the item is found, otherwise output 'absent'.
        global.console.log(
          currentOperation[1] in itemRegistry ? 'present' : 'absent'
        );
      }
      // Commands of other types are implicitly ignored and do not trigger any action.
    }); // Concludes the iteration through the sequence of operations.
  } // Concludes the input segment processing function.
); // Concludes the setup for the 'data' event listener.