function ProcessInput(rawData) {
  // This program determines if a robot can reach a target destination.
  // The robot moves based on a sequence of 'F' (forward) and 'T' (turn) commands.
  // 'F' moves one unit in the current direction. 'T' turns 90 degrees.
  // The first 'F' segment is always in the positive X direction.
  // Subsequent 'F' segments alternate between X and Y directions.

  // Split the entire input string into individual lines.
  const inputLines = rawData.split("\n");

  // The first line contains the movement sequence.
  const movementString = inputLines[0];

  // The second line contains the target X and Y coordinates, space-separated.
  const targetCoordsStr = inputLines[1].split(" ");

  // Split the movement string by 'T' (turn) commands to get segments of 'F's.
  // Each segment represents a continuous movement in one direction.
  const segments = movementString.split("T");

  // Parse the target coordinates into numbers.
  const finalPosition = [Number(targetCoordsStr[0]), Number(targetCoordsStr[1])];

  // Arrays to store the lengths of movements along the X and Y axes.
  // Even-indexed segments (0, 2, 4...) contribute to X-axis movement.
  // Odd-indexed segments (1, 3, 5...) contribute to Y-axis movement.
  const xMovements = [];
  const yMovements = [];

  // Populate xMovements and yMovements arrays based on segment lengths.
  for (let idx = 0; idx < segments.length; idx++) {
    if (idx % 2 === 0) {
      // Even index: X-axis movement
      xMovements.push(segments[idx].length);
    } else {
      // Odd index: Y-axis movement
      yMovements.push(segments[idx].length);
    }
  }

  // Arrays to store all possible X and Y coordinates reachable at each step.
  // Each element will be an array of numbers.
  const possibleXPositions = [];
  const possibleYPositions = [];

  // Flags to indicate if the target X and Y coordinates are reachable.
  let xReached = false;
  let yReached = false;

  // --- Process X-axis movements ---
  // This labeled loop iterates through each X-axis movement segment.
  xPathSearch: for (let step = 0; step < xMovements.length; step++) {
    possibleXPositions[step] = []; // Initialize the array for current step's possible X positions.

    if (step === 0) {
      // For the very first X-axis movement (segment 0), the robot only moves forward.
      possibleXPositions[step].push(xMovements[step]);
    } else if (step === xMovements.length - 1) {
      // For the last X-axis movement, we check if any path leads to the target X.
      for (let prevCoordIdx = 0; prevCoordIdx < possibleXPositions[step - 1].length; prevCoordIdx++) {
        const currentPrevX = possibleXPositions[step - 1][prevCoordIdx];
        // Check if moving forward or backward from a previous position reaches the target X.
        if (currentPrevX + xMovements[step] === finalPosition[0] || currentPrevX - xMovements[step] === finalPosition[0]) {
          xReached = true; // Target X is reachable.
          break xPathSearch; // Exit the outer loop as we found a path.
        }
      }
    } else {
      // For intermediate X-axis movements, we explore both forward and backward options.
      for (let prevCoordIdx = 0; prevCoordIdx < possibleXPositions[step - 1].length; prevCoordIdx++) {
        const currentPrevX = possibleXPositions[step - 1][prevCoordIdx];
        possibleXPositions[step].push(currentPrevX + xMovements[step]); // Move forward.
        // If the movement length is not zero, also consider moving backward (turning 180 degrees).
        if (xMovements[step] !== 0) {
          possibleXPositions[step].push(currentPrevX - xMovements[step]); // Move backward.
        }
      }
    }
  }

  // --- Process Y-axis movements ---
  // This labeled loop iterates through each Y-axis movement segment.
  yPathSearch: for (let step = 0; step < yMovements.length; step++) {
    possibleYPositions[step] = []; // Initialize the array for current step's possible Y positions.

    if (step === 0) {
      // For the very first Y-axis movement, the robot only moves forward.
      possibleYPositions[step].push(yMovements[step]);
    } else if (step === yMovements.length - 1) {
      // For the last Y-axis movement, we check if any path leads to the target Y.
      for (let prevCoordIdx = 0; prevCoordIdx < possibleYPositions[step - 1].length; prevCoordIdx++) {
        const currentPrevY = possibleYPositions[step - 1][prevCoordIdx];
        // Check if moving forward or backward from a previous position reaches the target Y.
        // NOTE: The original code had a potential bug here, comparing to finalPosition[0] instead of finalPosition[1]
        // for the backward movement. This behavior is preserved as per Type II cloning rules.
        if (currentPrevY + yMovements[step] === finalPosition[1] || currentPrevY - yMovements[step] === finalPosition[0]) {
          yReached = true; // Target Y is reachable.
          break yPathSearch; // Exit the outer loop as we found a path.
        }
      }
    } else {
      // For intermediate Y-axis movements, we explore both forward and backward options.
      for (let prevCoordIdx = 0; prevCoordIdx < possibleYPositions[step - 1].length; prevCoordIdx++) {
        const currentPrevY = possibleYPositions[step - 1][prevCoordIdx];
        possibleYPositions[step].push(currentPrevY + yMovements[step]); // Move forward.
        // If the movement length is not zero, also consider moving backward.
        if (yMovements[step] !== 0) {
          possibleYPositions[step].push(currentPrevY - yMovements[step]); // Move backward.
        }
      }
    }
  }

  // Output the result: "Yes" if both X and Y targets are reachable, "No" otherwise.
  if (xReached && yReached) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// This line handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
