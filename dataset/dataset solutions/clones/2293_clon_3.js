function executeResourceConsumptionSimulation(rawInputString) {
  // This function simulates a resource consumption process based on initial quantities
  // and a specified number of consumption operations.

  // Step 1: Prepare and parse the raw input string.
  // The input is expected to be a space-separated string of three integers:
  // [initial_resource_A_quantity] [initial_resource_B_quantity] [number_of_operations]

  const trimmedInput = rawInputString.trim();
  const inputSegments = trimmedInput.split(" ");

  // Validate the number of input segments. A guard clause for malformed input.
  const expectedSegmentCount = 3;
  if (inputSegments.length < expectedSegmentCount) {
    console.error("Error: Insufficient input parameters. Expected 3 numeric values.");
    // In a real application, one might throw an error or use default values.
    // For this clone, we'll log and terminate execution of the function.
    return;
  }

  // Convert string segments to integers.
  // Using Number.parseInt for explicit base 10 conversion.
  const numericParameters = inputSegments.map(segment => Number.parseInt(segment.trim(), 10));

  // Validate that all parsed values are actual numbers.
  if (numericParameters.some(isNaN)) {
    console.error("Error: One or more input values could not be parsed as valid integers.");
    return;
  }

  // Extract and assign to explicitly named variables for clarity.
  // These variables will hold the mutable state of our resources.
  let primaryResourceQuantity = numericParameters[0];
  let secondaryResourceQuantity = numericParameters[1];
  const desiredOperationCount = numericParameters[2]; // This value is constant for the simulation.

  // Optional: Add warnings for unusual initial states, without altering core logic.
  if (primaryResourceQuantity < 0 || secondaryResourceQuantity < 0) {
    console.warn("Warning: Initial resource quantities are negative. Simulation will proceed.");
  }
  if (desiredOperationCount < 0) {
    console.warn("Warning: Negative number of consumption operations specified. No operations will occur.");
  }


  // Step 2: Execute the resource consumption simulation.
  // Iterate through the specified number of operations, decrementing resources.
  // Resource A (primary) is preferred over Resource B (secondary).

  for (let currentOperationIndex = 0; currentOperationIndex < desiredOperationCount; currentOperationIndex++) {
    // A flag to indicate if any resource was successfully consumed in the current iteration.
    let wasResourceReduced = false;

    // First attempt to consume from the primary resource pool.
    if (primaryResourceQuantity >= 1) {
      // Decrement the primary resource. Using compound assignment for variety.
      primaryResourceQuantity -= 1;
      wasResourceReduced = true;
    }
    // If the primary resource is depleted or unavailable, attempt to consume from the secondary.
    else if (secondaryResourceQuantity >= 1) {
      // Decrement the secondary resource. Using explicit subtraction for variety.
      secondaryResourceQuantity = secondaryResourceQuantity - 1;
      wasResourceReduced = true;
    }
    // If neither resource is available, no action is taken for this operation.
    // The original code implicitly handles this by doing nothing, so we maintain that.
    // We could add a debug log here if needed:
    // else {
    //   // console.debug(`Operation ${currentOperationIndex + 1}: No resources available for consumption.`);
    // }
  }


  // Step 3: Output the final state of the resources.
  // Display the remaining quantities of the primary and secondary resources.
  // Using a template literal for modern string formatting.

  console.log(`${primaryResourceQuantity} ${secondaryResourceQuantity}`);
}


// Entry point for the application: Reads input from standard input and
// initiates the resource consumption simulation.
try {
  // Specify the standard input file path for POSIX systems.
  const standardInputSourcePath = "/dev/stdin";
  // Dynamically load the file system module.
  const fileSystemUtility = require("fs");

  // Read the entire content of the standard input as a UTF-8 string.
  const rawInputContent = fileSystemUtility.readFileSync(standardInputSourcePath, "utf8");

  // Invoke the main simulation function with the obtained input.
  executeResourceConsumptionSimulation(rawInputContent);

} catch (inputReadError) {
  // Catch and report any errors that occur during the file reading process.
  console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
  // Terminate the process with a non-zero exit code to indicate failure.
  process.exit(1);
}