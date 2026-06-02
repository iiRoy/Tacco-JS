function shiftPosition(rowOffset, colOffset, charToPlace) {
  // Check if the target cell is empty ('.')
  if (gameGrid[vehicleCoords[0] + rowOffset][vehicleCoords[1] + colOffset] === ".") {
    // Move the vehicle to the new position
    gameGrid[vehicleCoords[0] + rowOffset][vehicleCoords[1] + colOffset] = charToPlace;
    // Clear the old vehicle position
    gameGrid[vehicleCoords[0]][vehicleCoords[1]] = ".";
    // Update vehicle coordinates
    vehicleCoords[0] += rowOffset;
    vehicleCoords[1] += colOffset;
  } else {
    // If target cell is not empty, just update the vehicle's orientation
    gameGrid[vehicleCoords[0]][vehicleCoords[1]] = charToPlace;
  }
}

function fireProjectile(rowOffset, colOffset) {
  // Initialize projectile travel distance
  let idx = 0;
  // Loop indefinitely until projectile hits something
  while (true) {
    idx++; // Increment distance
    // Check if projectile hits a wall ('#')
    if (gameGrid[vehicleCoords[0] + (rowOffset * idx)][vehicleCoords[1] + (colOffset * idx)] === "#") {
      break; // Stop projectile
    }
    // Check if projectile hits a destructible obstacle ('*')
    else if (gameGrid[vehicleCoords[0] + (rowOffset * idx)][vehicleCoords[1] + (colOffset * idx)] === "*") {
      // Destroy the obstacle
      gameGrid[vehicleCoords[0] + (rowOffset * idx)][vehicleCoords[1] + (colOffset * idx)] = ".";
      break; // Stop projectile
    }
  }
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into lines and remove leading/trailing whitespace
let lineData = rawData.trim().split("\n");

// Get the number of test cases
const numTestCases = parseInt(lineData.shift(), 10);

// Iterate through each test case
for (let testCaseIndex = 0; testCaseIndex < numTestCases; testCaseIndex++) {
  // Add an empty line between test case outputs, except for the first one
  if (testCaseIndex !== 0) {
    console.log("");
  }

  // Read grid dimensions (height and width)
  const gridDimensions = lineData.shift().split(" ").map(Number);
  // Initialize the game grid
  let gameGrid = [];

  // Add a top border of walls
  gameGrid.push("######################".split(""));

  // Initialize vehicle coordinates
  let vehicleCoords = [0, 0];

  // Populate the game grid with map data
  for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
    let rowChars = lineData.shift().split("");
    let initialTankCol = -1;

    // Find the initial position of the tank
    rowChars.forEach(function(elementVal, charIndex) {
      if (elementVal === "^" || elementVal === "v" || elementVal === "<" || elementVal === ">") {
        initialTankCol = charIndex;
      }
    });

    // If tank found, update its coordinates (adjusted for border)
    if (initialTankCol !== -1) {
      vehicleCoords = [rowIndex + 1, initialTankCol + 1];
    }

    // Add left and right borders to the current row
    rowChars.unshift("#");
    rowChars.push("#");
    gameGrid.push(rowChars);
  }

  // Add a bottom border of walls
  gameGrid.push("######################".split(""));

  // Consume the empty line separating map from commands
  lineData.shift();

  // Read the sequence of commands
  const commandSequence = lineData.shift().split("");

  // Process each command
  commandSequence.forEach(function(currentCommand) {
    if (currentCommand === "U") {
      shiftPosition(-1, 0, "^"); // Move Up
    } else if (currentCommand === "D") {
      shiftPosition(1, 0, "v"); // Move Down
    } else if (currentCommand === "L") {
      shiftPosition(0, -1, "<"); // Move Left
    } else if (currentCommand === "R") {
      shiftPosition(0, 1, ">"); // Move Right
    } else if (currentCommand === "S") {
      // Get current tank orientation
      const currentTankChar = gameGrid[vehicleCoords[0]][vehicleCoords[1]];
      // Fire projectile based on orientation
      if (currentTankChar === "^") {
        fireProjectile(-1, 0);
      } else if (currentTankChar === "v") {
        fireProjectile(1, 0);
      } else if (currentTankChar === "<") {
        fireProjectile(0, -1);
      } else if (currentTankChar === ">") {
        fireProjectile(0, 1);
      }
    }
  });

  // Remove the top and bottom border rows for output
  gameGrid.shift();
  gameGrid.pop();

  // Format the game grid for output: join rows, remove commas, remove side borders
  const finalOutputGrid = gameGrid.join("\n").replace(/,/g, "").replace(/^#|#$/mg, "");
  console.log(finalOutputGrid);
}
