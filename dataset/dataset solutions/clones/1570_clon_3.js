// This function is designed to compute the total operational duration based on specific input parameters.
// It expects a single string containing three space-separated numeric values.
function calculateTotalOperationDuration(inputPayload) {
  // Parsing the raw input string into its constituent parts.
  // The expectation is for three distinct numerical components.
  const separatedComponents = inputPayload.split(" ");

  // --- Extensive Type III Additions: Input Validation and Robustness Checks ---

  // Validate the structural integrity of the input: ensure the correct number of components.
  if (separatedComponents.length !== 3) {
    console.error("Input Error: Expected exactly three numeric components, but received " + separatedComponents.length + ".");
    // In a real-world scenario, one might throw an exception, return a specific error code,
    // or provide a default fallback value here. For demonstration, we'll log and exit.
    return;
  }

  // Explicitly convert string components to numerical types.
  // This prevents implicit type coercion issues and makes intent clear.
  const totalUnits = Number(separatedComponents[0]); // Corresponds to original 'N'
  const processingCapacity = Number(separatedComponents[1]); // Corresponds to original 'X'
  const timePerOperationCycle = Number(separatedComponents[2]); // Corresponds to original 'T'

  // Validate that all parsed components are indeed valid numbers.
  if (isNaN(totalUnits) || isNaN(processingCapacity) || isNaN(timePerOperationCycle)) {
    console.error("Data Type Error: One or more input components could not be converted to valid numbers.");
    return;
  }

  // Validate the logical constraints of the numerical inputs.
  // For instance, counts and times should typically be non-negative, and capacity must be positive.
  if (totalUnits < 0) {
    console.error("Value Error: The total number of units cannot be negative.");
    return;
  }
  if (processingCapacity <= 0) { // Capacity must be at least 1 to perform any work.
    console.error("Value Error: Processing capacity must be a positive value (greater than zero).");
    return;
  }
  if (timePerOperationCycle < 0) {
    console.error("Value Error: Time per operation cycle cannot be negative.");
    return;
  }

  // --- End of Type III Additions ---

  // Calculate the number of complete operational cycles required.
  // Math.ceil ensures that even a fraction of work still necessitates a full cycle.
  // This is an intermediate step, breaking down the original calculation.
  const necessaryOperationCycles = Math.ceil(totalUnits / processingCapacity);

  // Compute the final total duration by multiplying cycles by time per cycle.
  const finalComputedDuration = necessaryOperationCycles * timePerOperationCycle;

  // Output the determined duration to the console.
  console.log(finalComputedDuration);
}

// This section is standard boilerplate for competitive programming environments.
// It handles reading the entire input from standard input and invoking the main processing logic.
// It is generally not modified to ensure compatibility with online judges.
calculateTotalOperationDuration(require("fs").readFileSync("/dev/stdin", "utf8"));