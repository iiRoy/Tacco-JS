(function() {
  // Array to hold all processed input lines, gathered from standard input stream.
  // This buffer will contain the numerical parameters for subsequent calculations.
  let collectedInputLines = [];

  // Initialize the standard input stream processor.
  // This object allows listening for data and end events from stdin.
  const stdInputReader = process.openStdin();

  // Configure the input stream to interpret received data as UTF-8 encoded text.
  // This ensures proper handling of various characters.
  stdInputReader.setEncoding('utf8');

  // Event listener for incoming data chunks from standard input.
  // This function is invoked each time a new piece of data is available.
  stdInputReader.on('data', function(currentChunkOfData) {
    // Split the received data chunk into individual lines based on newline characters.
    // Then, iterate over each potential line.
    currentChunkOfData.split("\n").forEach(rawLineContent => {
      // Trim whitespace from the beginning and end of each line.
      const cleanedLine = rawLineContent.trim();
      // If the cleaned line is not empty, add it to our collection of input lines.
      // This ensures that only meaningful input is stored for processing.
      if (cleanedLine.length > 0) {
        collectedInputLines.push(cleanedLine);
      }
    });
  });

  // Event listener for the 'end' of the standard input stream.
  // This function executes once all input has been received.
  stdInputReader.on('end', function(_) { // The parameter '_' is unused, signifying it's not needed.

    // --- Input Validation and Preparation ---
    if (collectedInputLines.length === 0) {
      // If no input lines were collected, log an error and exit.
      // This is a guard clause to prevent processing empty data.
      console.error("Error: No input data received for processing.");
      return;
    }

    // Extract the first line, which represents the total number of operations to perform.
    // Use radix 10 for parseInt to ensure correct parsing.
    const totalOperationCycles = parseInt(collectedInputLines.shift(), 10);

    // Validate the parsed number of cycles.
    if (isNaN(totalOperationCycles) || totalOperationCycles <= 0) {
      console.error("Error: Invalid or non-positive number of operations specified.");
      return;
    }

    // --- Main Processing Loop ---
    // Iterate through each operation cycle as specified by the first input line.
    for (let currentCycleIndex = 0; currentCycleIndex < totalOperationCycles; ++currentCycleIndex) {
      // Ensure we have a line for the current operation.
      if (currentCycleIndex >= collectedInputLines.length) {
        console.error(`Error: Insufficient input lines for operation ${currentCycleIndex + 1}.`);
        break; // Exit loop if data is missing.
      }

      // Get the current line for this operation and split it by spaces to get individual string values.
      const stringValueTokens = collectedInputLines[currentCycleIndex].split(" ");

      // Convert all string tokens into integer numbers.
      // Using map with Number constructor is a concise way to achieve this.
      const numericOperationParameters = stringValueTokens.map(Number);

      // --- Parameter Extraction and Adjustment ---
      // Ensure we have at least 3 parameters for this operation.
      if (numericOperationParameters.length < 3) {
        console.error(`Error: Not enough parameters on line ${currentCycleIndex + 1}. Expected 3, got ${numericOperationParameters.length}.`);
        continue; // Skip to the next operation if parameters are insufficient.
      }

      // Extract the first two primary parameters and decrement them by one.
      // These often represent zero-indexed coordinates or similar values.
      const primaryCoordValue = numericOperationParameters[0] - 1;
      const secondaryCoordValue = numericOperationParameters[1] - 1;
      // The third parameter is used directly in the final calculation.
      const finalSubtractionValue = numericOperationParameters[2];

      // --- Conditional Adjustment Calculation ---
      // Initialize an adjustment variable.
      let dynamicAdjustment = 0;
      // Check the remainder of the primary coordinate when divided by 3.
      const primaryCoordRemainder = primaryCoordValue % 3;

      // If the remainder is 0 or 1, apply a specific adjustment based on the secondary coordinate.
      if (primaryCoordRemainder === 0 || primaryCoordRemainder === 1) {
        // The adjustment is half of the secondary coordinate, rounded down.
        dynamicAdjustment = Math.floor(secondaryCoordValue / 2);
      }

      // --- Final Result Computation ---
      // Define constants for clarity in the complex calculation.
      const initialBaseValue = 196471;
      const primaryCoordFactor = 195;
      const floorDivisionFactor = 5;
      const secondaryCoordFactor = 20;

      // Calculate the individual components of the final expression.
      const termA = primaryCoordValue * primaryCoordFactor;
      const termB = Math.floor(primaryCoordValue / 3) * floorDivisionFactor;
      const termC = secondaryCoordValue * secondaryCoordFactor;

      // Combine all terms and the dynamic adjustment to get the final result.
      const computedOutput = initialBaseValue - termA - termB - termC + dynamicAdjustment - finalSubtractionValue;

      // Output the calculated result to the console.
      console.log(computedOutput);
    }
  });

}).call(this); // Immediately invoked function expression (IIFE) to encapsulate scope.