const inputInterface = require('readline'); // Module for handling line-by-line input.

// Buffer to accumulate all incoming text lines from the standard input.
const receivedLines = [];

// Configuration constants for the processing logic.
const INITIAL_RESOURCE_QUANTITY = 1; // The starting amount of the primary resource.
const INDEX_OFFSET_FOR_DISPLAY = 1; // Used to align 0-indexed loops with 1-indexed problem statements.

// Variables to hold parsed input parameters and the dynamic resource quantity.
let totalProcessingCycles = 0;
let conversionSourceFactor = 0;
let conversionTargetFactor = 0;
let currentResourceQuantity = INITIAL_RESOURCE_QUANTITY; // This value changes throughout the process.

// Establish an interface to read input from the standard input stream.
const lineInputHandler = inputInterface.createInterface({
  input:  process.stdin,
  output: process.stdout
});

// Listener for each line of text received from the input.
lineInputHandler.on('line', (dataString) => {
  // Only store non-empty strings after trimming whitespace.
  if (typeof dataString === 'string' && dataString.trim().length > 0) {
    receivedLines.push(dataString.trim());
  }
});

// Listener for the 'close' event, indicating the end of the input stream.
lineInputHandler.on('close', () => {
  // Critical check: Ensure input was received.
  if (receivedLines.length === 0) {
    console.error("Operation Failed: No input data provided. Exiting.");
    process.exit(1); // Terminate with an error code.
  }

  // Attempt to parse the primary configuration parameters from the first line.
  const parsedParameters = receivedLines[0].split(' ').map(value => parseInt(value, 10));

  // Validate the integrity and count of the parsed parameters.
  if (parsedParameters.length < 3 || parsedParameters.some(isNaN)) {
    console.error("Input Error: Expected three integer parameters. Received malformed data.");
    process.exit(1);
  }

  // Destructure and assign the parsed values to their respective variables.
  [totalProcessingCycles, conversionSourceFactor, conversionTargetFactor] = parsedParameters;

  // Perform a preliminary check on the input factors for potential issues.
  if (conversionSourceFactor <= 0 || conversionTargetFactor <= 0 || totalProcessingCycles < 0) {
      console.warn("Warning: One or more input factors (source/target conversion rates) or the total cycle count are non-positive. This might lead to unexpected behavior.");
      // Depending on requirements, one might choose to exit here or force default values.
  }

  // The primary simulation loop.
  // The loop counter `cycleStep` can increment by more than one in specific scenarios.
  for (let cycleStep = 0; cycleStep < totalProcessingCycles; cycleStep++) {
    let shouldPerformDirectIncrement = false; // Flag to determine the operation type for this step.

    // Condition A: If the absolute difference between conversion factors is 1.
    const factorAbsoluteDifference = Math.abs(conversionSourceFactor - conversionTargetFactor);
    if (factorAbsoluteDifference === 1) {
      shouldPerformDirectIncrement = true;
    }

    // Condition B: If the source factor is numerically greater than the target factor.
    if (!shouldPerformDirectIncrement && conversionSourceFactor > conversionTargetFactor) {
      shouldPerformDirectIncrement = true;
    }

    // Condition C: If the current resource quantity is insufficient for a full conversion batch.
    if (!shouldPerformDirectIncrement && currentResourceQuantity < conversionSourceFactor) {
      shouldPerformDirectIncrement = true;
    }

    // Condition D: If this is the very last scheduled processing cycle.
    // We adjust `cycleStep` by `INDEX_OFFSET_FOR_DISPLAY` to match the 1-indexed `k` from original problem.
    if (!shouldPerformDirectIncrement && (cycleStep + INDEX_OFFSET_FOR_DISPLAY) === totalProcessingCycles) {
      shouldPerformDirectIncrement = true;
    }

    // Execute the appropriate action based on the evaluated conditions.
    if (shouldPerformDirectIncrement) {
      currentResourceQuantity++; // Simple increase of resource quantity.
    } else {
      // Perform a complex resource conversion.
      // This involves converting a portion of the resources from the source factor to the target factor.
      const convertibleUnits = Math.floor(currentResourceQuantity / conversionSourceFactor);
      const leftoverUnits = currentResourceQuantity % conversionSourceFactor;

      currentResourceQuantity = (convertibleUnits * conversionTargetFactor) + leftoverUnits;

      // Crucial: Advance the cycle counter by an additional step after a conversion operation.
      // This effectively skips the next scheduled iteration.
      cycleStep++;
    }

    // Optional: Add a safeguard against extremely large numbers to prevent overflow issues.
    // if (currentResourceQuantity > Number.MAX_SAFE_INTEGER / 2) {
    //     console.warn("Resource quantity approaching maximum safe integer. Loop terminated early to prevent overflow.");
    //     break;
    // }
  }

  // Present the final computed resource quantity.
  const finalResultDisplay = `The calculated final resource quantity is: ${currentResourceQuantity}`;
  console.log(finalResultDisplay);
});