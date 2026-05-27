function ColorSolver(initialState) {
  // This object keeps track of states that have already been visited
  // to prevent redundant processing and infinite loops in the BFS.
  let visitedStates = {};

  // The queue for Breadth-First Search, storing tuples of [state_string, steps_count].
  let processingQueue = [[initialState, 0]];

  // Mark the starting state as visited.
  visitedStates[initialState] = true;

  // Main BFS loop.
  while (true) {
    // If the queue is empty, it means no solution was found.
    if (processingQueue.length === 0) {
      finalResult = "NA"; // Set the global result variable.
      break; // Exit the BFS loop.
    }

    // Dequeue the next state to process.
    let currentEntry = processingQueue.shift();
    let currentState = currentEntry[0]; // The string representation of the current state.
    let stepCount = currentEntry[1]; // The number of steps taken to reach this state.

    // Check if the current state is a target state (all characters are the same digit).
    // The regex checks for strings composed solely of '0's, '1's, or '2's.
    if (/^0+$|^1+$|^2+$/.test(currentState)) {
      finalResult = stepCount; // A solution is found, store the step count.
      break; // Exit the BFS loop.
    }

    // Iterate through adjacent pairs of characters in the current state string.
    for (let idx = 0; idx < currentState.length - 1; idx++) {
      // If the adjacent characters are the same, no operation can be performed on them.
      if (currentState[idx] === currentState[idx + 1]) {
        continue; // Skip to the next pair.
      }

      // Convert the string to an array of characters to allow modification.
      let charArray = currentState.split("");

      // Calculate the 'newColorValue' based on the two different adjacent characters.
      // The sum of the three colors (0, 1, 2) is 3.
      // So, if two colors are known, the third color is 3 - (color1) - (color2).
      let newColorValue = 3 - (+charArray[idx]) - (+charArray[idx + 1]);

      // Apply the new color to both adjacent characters.
      charArray[idx] = newColorValue;
      charArray[idx + 1] = newColorValue;

      // Convert the modified character array back into a string.
      let nextStateString = charArray.join("");

      // Check if this new state has been visited before.
      if (visitedStates.hasOwnProperty(nextStateString) === false) {
        // If not visited, add it to the queue for future processing.
        processingQueue.push([nextStateString, stepCount + 1]);
        // Mark the new state as visited.
        visitedStates[nextStateString] = true;
      }
    }
  }
}

// Read input from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into an array of lines.
let inputLines = (rawData.trim()).split("\n");

// Global variable to store the result of the BFS for each input line.
let finalResult;

// Loop through each line of input until a "0" is encountered.
while (true) {
  // Get the next color string from the input lines.
  let currentColorString = inputLines.shift();

  // If the current string is "0", it signifies the end of input.
  if (currentColorString === "0") {
    break; // Exit the processing loop.
  }

  // Replace 'r', 'g', 'b' characters with their numeric representations '0', '1', '2'.
  currentColorString = currentColorString.replace(/r/g, "0").replace(/g/g, "1").replace(/b/g, "2");

  // Execute the BFS algorithm with the transformed color string.
  ColorSolver(currentColorString);

  // Print the computed result to the console.
  console.log(finalResult);
}
