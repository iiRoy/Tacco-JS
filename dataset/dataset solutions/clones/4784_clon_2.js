// This function determines a specific movement sequence based on input coordinates.
function calculateTraversal (initialStream) {
  // Parse the raw input stream into an array of numbers.
  // It expects a single line, space-separated numbers.
  let numericComponents = initialStream.split("\n")[0] .split(" ").map(Number);

  // Extract the horizontal and vertical target values from the parsed components.
  // Assuming the coordinates are at indices 2 and 3.
  const targetPoint = {
    horizontal: numericComponents[2],
    vertical:   numericComponents[3]
  };

  // Initialize an empty string to build the sequence of movements.
  let movementPattern = "";

  // First Quadrant Movement: Move Up (U) 'vertical' times.
  // This forms the initial vertical path segment.
  for (let stepIndex = 0; stepIndex < targetPoint.vertical; stepIndex++) {
    movementPattern += "U";
  }

  // First Quadrant Movement: Move Right (R) 'horizontal' times.
  // This completes the first rectangular corner.
  for (let stepIndex = 0; stepIndex < targetPoint.horizontal; stepIndex++) {
    movementPattern += "R";
  }

  // Second Quadrant Movement: Move Down (D) 'vertical' times.
  // Tracing downwards from the rightmost point.
  for (let stepIndex = 0; stepIndex < targetPoint.vertical; stepIndex++) {
    movementPattern += "D";
  }

  // Second Quadrant Movement: Move Left (L) 'horizontal' times.
  // Completing the first full rectangle.
  for (let stepIndex = 0; stepIndex < targetPoint.horizontal; stepIndex++) {
    movementPattern += "L";
  }

  // Additional single left movement.
  movementPattern += "L";

  // Third Quadrant Movement: Move Up (U) 'vertical + 1' times.
  // Starting a new, larger rectangular path.
  for (let stepIndex = 0; stepIndex < targetPoint.vertical + 1; stepIndex++) {
    movementPattern += "U";
  }

  // Third Quadrant Movement: Move Right (R) 'horizontal + 1' times.
  for (let stepIndex = 0; stepIndex < targetPoint.horizontal + 1; stepIndex++) {
    movementPattern += "R";
  }

  // Specific diagonal-like movement.
  movementPattern += "DR";

  // Fourth Quadrant Movement: Move Down (D) 'vertical + 1' times.
  for (let stepIndex = 0; stepIndex < targetPoint.vertical + 1; stepIndex++) {
    movementPattern += "D";
  }

  // Fourth Quadrant Movement: Move Left (L) 'horizontal + 1' times.
  for (let stepIndex = 0; stepIndex < targetPoint.horizontal + 1; stepIndex++) {
    movementPattern += "L";
  }

  // Final upward adjustment.
  movementPattern += "U";

  // Print the complete generated movement pattern to the console.
  console.log(movementPattern);
}

// Read input from standard input and pass it to the main processing function.
calculateTraversal( require("fs").readFileSync("/dev/stdin", "utf8") );