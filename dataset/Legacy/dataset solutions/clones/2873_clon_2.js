let isDebuggingActive = false; // Flag to control debug output

/**
 * Outputs debug messages to the console if debugging is enabled.
 * @param {...any} args - Arguments to be logged.
 */
function outputDebugMessage() {
  if (isDebuggingActive) {
    // Collect all passed arguments into an array for joining.
    let messageParts = [];
    for (let idx = 0; idx < arguments.length; idx++) {
      messageParts.push(arguments[idx]);
    }
    // Display the concatenated message.
    console.log(messageParts.join(', '));
  }
}

/**
 * Main function to process input data and determine path possibility.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInputData(rawData) {
  // Split the input into individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line for numerical parameters.
  const firstLineTokens = inputLines[0].split(" ");
  const gridSize = firstLineTokens[0]; // N, not used in logic, but parsed.
  const startA = firstLineTokens[1] * 1; // Convert to number
  const startB = firstLineTokens[2] * 1; // Convert to number
  const targetC = firstLineTokens[3] * 1; // Convert to number
  const targetD = firstLineTokens[4] * 1; // Convert to number

  // Get the path string from the second line.
  let pathString = inputLines[1];

  // Log initial parsed values for debugging.
  outputDebugMessage(gridSize, startA, startB, targetC, targetD, pathString);

  // Initialize a boolean flag for path possibility.
  let isPathPossible = true;

  // Special handling if targetC is greater than targetD.
  if (targetC > targetD) {
    let segmentEnd = targetD;
    // Adjust segmentEnd if the difference is small.
    if (targetC - targetD <= 3) {
      segmentEnd = targetC;
    }

    // Create a mutable copy of the path string for potential modification.
    let modifiedPath = pathString;
    // Check a specific character and attempt to modify the string.
    // Note: Strings are immutable in JS, so `modifiedPath[D - 1] = '#'`
    // will not actually change `modifiedPath`. The next line performs the actual change.
    if (pathString[targetD - 2] == '#') {
      outputDebugMessage(modifiedPath, modifiedPath[targetD - 1]);
      modifiedPath[targetD - 1] = '#'; // This line has no effect on strings.
      modifiedPath = modifiedPath.slice(0, targetD - 1) + '#' + modifiedPath.slice(targetD);
    }
    outputDebugMessage(modifiedPath);

    // Extract a segment and check for "..." pattern.
    const currentSegment = modifiedPath.slice(startB - 1, segmentEnd);
    outputDebugMessage(currentSegment, isPathPossible);
    isPathPossible = isPathPossible && (/\.\.\./).test(currentSegment);
    outputDebugMessage(currentSegment, isPathPossible);
  }

  // Check the path segment from A to C for "##" (double hash).
  let currentSegment = pathString.slice(startA - 1, targetC);
  isPathPossible = isPathPossible && !(/##/).test(currentSegment);
  outputDebugMessage(currentSegment, isPathPossible);

  // Check the path segment from B to D for "##" (double hash).
  currentSegment = pathString.slice(startB - 1, targetD);
  isPathPossible = isPathPossible && !(/##/).test(currentSegment);
  outputDebugMessage(currentSegment, isPathPossible);

  // Determine the final answer based on the boolean flag.
  const finalResult = isPathPossible ? 'Yes' : 'No';
  console.log(finalResult);
}

// Read input from stdin and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
