function ProcessGrid(dataArray) {
  // Parse grid dimensions and starting position
  const gridHeight = Number.parseInt(dataArray.shift());
  const gridWidth = Number.parseInt(dataArray.shift());
  const numSteps = Number.parseInt(dataArray.shift());
  const startRow = Number.parseInt(dataArray.shift());
  const startCol = Number.parseInt(dataArray.shift());

  // Get the movement and wind sequences
  const moveSequence = dataArray.shift();
  const windSequence = dataArray.shift();

  // Initialize the boundaries of the current safe region
  // These represent the min/max column and row indices the player can reach
  let currentLeftBound = startCol;
  let currentRightBound = startCol;
  let currentTopBound = startRow;
  let currentBottomBound = startRow;

  // Iterate through each step of the movement and wind
  for (let stepIndex = 0; stepIndex < numSteps; stepIndex++) {
    // Get the player's intended move and the wind's direction for this step
    const playerMove = moveSequence.charAt(stepIndex);
    const windDirection = windSequence.charAt(stepIndex);

    // Apply the player's movement to expand the potential safe region
    if (playerMove === "L") {
      currentLeftBound--; // Move left, so left boundary decreases
    } else if (playerMove === "R") {
      currentRightBound++; // Move right, so right boundary increases
    } else if (playerMove === "U") {
      currentTopBound--; // Move up, so top boundary decreases
    } else {
      currentBottomBound++; // Move down, so bottom boundary increases
    }

    // Check if the expanded region is outside the grid boundaries
    // If any boundary goes out, it's impossible to stay within the grid
    if (currentLeftBound <= 0 || currentRightBound > gridWidth || currentTopBound <= 0 || currentBottomBound > gridHeight) {
      console.log("NO"); // Output "NO" and terminate
      return;
    }

    // Apply the wind's effect to shrink the potential safe region
    // Wind pushes the player, effectively shrinking the reachable area from the opposite side
    if (windDirection === "L") {
      // Wind pushes left, so the rightmost reachable point might be pushed left
      currentRightBound = Math.max(1, currentRightBound - 1);
    } else if (windDirection === "R") {
      // Wind pushes right, so the leftmost reachable point might be pushed right
      currentLeftBound = Math.min(gridWidth, currentLeftBound + 1);
    } else if (windDirection === "U") {
      // Wind pushes up, so the bottommost reachable point might be pushed up
      currentBottomBound = Math.max(1, currentBottomBound - 1);
    } else {
      // Wind pushes down, so the topmost reachable point might be pushed down
      currentTopBound = Math.min(gridHeight, currentTopBound + 1);
    }
  }

  // If the loop completes without returning "NO", it means the player can stay within the grid
  console.log("YES");
}

// Read input from standard input, process it, and call the main function
ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
