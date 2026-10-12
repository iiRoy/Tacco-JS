function ProcessInput(rawData) {
  // Parse the initial configuration values from the first line of the input.
  // The first number represents the total count of available items.
  let totalItems = parseInt(rawData.split("\n")[0].split(" ")[0]);
  // The second number indicates the total number of constraints or filtering conditions.
  let numConstraints = parseInt(rawData.split("\n")[0].split(" ")[1]);

  // Initialize the boundaries for the valid range.
  // The lower bound starts at 1, as items are typically 1-indexed.
  let currentMin = 1;
  // The upper bound initially covers all available items.
  let currentMax = totalItems;
  
  // Iterate through each constraint provided in the subsequent lines of the input.
  for (let constraintIndex = 1; constraintIndex <= numConstraints; constraintIndex++) {
    // Extract the current constraint pair (a minimum and a maximum value for this specific constraint).
    let constraintPair = rawData.split("\n")[constraintIndex].split(" ").map((val) => Number(val));
    // Store the minimum value from the current constraint.
    let pairMin = constraintPair[0];
    // Store the maximum value from the current constraint.
    let pairMax = constraintPair[1];
       
    // Update the overall minimum boundary.
    // The new minimum must satisfy both the previous overall minimum and the current constraint's minimum.
    currentMin = Math.max(pairMin, currentMin);
    // Update the overall maximum boundary.
    // The new maximum must satisfy both the previous overall maximum and the current constraint's maximum.
    currentMax = Math.min(pairMax, currentMax);
  }
  
  // Calculate the final count of items that fall within the determined valid range.
  // If the calculated range is invalid (e.g., currentMin > currentMax), the result should be 0.
  console.log(Math.max((currentMax - currentMin + 1), 0));
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
