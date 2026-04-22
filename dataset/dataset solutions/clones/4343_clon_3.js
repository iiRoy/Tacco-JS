(function() {
  // Activate strict mode for the entire script to catch common coding errors and "unsafe" actions.
  "use strict";

  // A dynamically growing collection to store each line of text received from the input channel.
  const inputLineBuffer = [];

  // Initialize the utility for reading input line by line.
  // This setup links the standard input stream to a line-based parser.
  const lineReaderUtility = require('readline').createInterface({
    input: process.stdin,  // Directs the utility to listen to the standard input stream.
    output: process.stdout // Standard output stream; used internally by readline for terminal control, but not for our result.
  });

  // Assign an event listener that triggers whenever a complete line of text is entered.
  lineReaderUtility.on('line', (currentInputLine) => {
    // Each processed line is appended to our buffer for later use.
    inputLineBuffer.push(currentInputLine);
  });

  // Attach a final event handler to the standard input stream,
  // which will execute once the input stream has completely closed.
  process.stdin.on('end', () => {
    // --- Start of the primary data processing block ---

    // Implement a preliminary validation: ensure enough data lines were provided.
    // The calculation requires at least two distinct numerical inputs.
    if (inputLineBuffer.length < 2) {
      console.error("Fatal Error: Insufficient input data. At least two lines containing numbers are required for computation.");
      process.exit(1); // Terminate the process with an error status.
    }

    // Define a robust helper function to safely convert a raw string segment into a numeric value.
    // This includes trimming whitespace and validating the conversion.
    const extractNumericValue = (rawStringSegment) => {
      const cleanedAndParsedNumber = Number(rawStringSegment.trim()); // Trim whitespace and attempt conversion.

      // Validate the parsing outcome: if it's not a number, report an error.
      if (isNaN(cleanedAndParsedNumber)) {
        console.error(`Input Validation Failed: The segment '${rawStringSegment}' could not be interpreted as a valid number.`);
        process.exit(1); // Exit due to invalid input.
      }
      return cleanedAndParsedNumber;
    };

    // Retrieve the first two lines from the buffer and convert them to numeric types.
    // These will serve as the operands for our calculation.
    const firstInputOperand = extractNumericValue(inputLineBuffer[0]);
    const secondInputOperand = extractNumericValue(inputLineBuffer[1]);

    // Perform the core arithmetic operation:
    // 1. Square the first numerical operand.
    // 2. Subtract the second numerical operand from the squared result.
    const squaredFirstOperand = firstInputOperand * firstInputOperand; // Direct multiplication instead of Math.pow for Type III variance.
    const finalCalculatedOutcome = squaredFirstOperand - secondInputOperand;

    // Output the derived numerical result to the console's standard output stream.
    console.log(finalCalculatedOutcome);

    // --- End of the primary data processing block ---
  });
})();