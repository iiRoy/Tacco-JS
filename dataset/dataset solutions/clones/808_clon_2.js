function shiftPosition(rowOffset, colOffset, tankSymbol) {
  // Check if the target cell is empty ('.')
  if (gameGrid[playerCoords[0] + rowOffset][playerCoords[1] + colOffset] === ".") {
    // Move the tank to the new position
    gameGrid[playerCoords[0] + rowOffset][playerCoords[1] + colOffset] = tankSymbol;
    // Clear the old tank position
    gameGrid[playerCoords[0]][playerCoords[1]] = ".";
    // Update tank's coordinates
    playerCoords[0] += rowOffset;
    playerCoords[1] += colOffset;
  } else {
    // If target is not empty, just update the tank's direction in its current cell
    gameGrid[playerCoords[0]][playerCoords[1]] = tankSymbol;
  }
}

function fireProjectile(projRowDir, projColDir) {
  let stepCount = +0; // Initialize step counter for projectile path
  while (true) {
    stepCount++; // Increment step for each cell traversed
    // Check if projectile hits a wall ('#')
    if (gameGrid[playerCoords[0] + (projRowDir * stepCount)][playerCoords[1] + (projColDir * stepCount)] === "#") {
      break; // Stop if a wall is hit
    }
    // Check if projectile hits a brick ('*')
    else if (gameGrid[playerCoords[0] + (projRowDir * stepCount)][playerCoords[1] + (projColDir * stepCount)] === "*") {
      gameGrid[playerCoords[0] + (projRowDir * stepCount)][playerCoords[1] + (projColDir * stepCount)] = "."; // Destroy the brick
      break; // Stop after destroying a brick
    }
  }
}

// Read input from standard input
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Replace tank direction symbols for internal processing
rawData = rawData.replace(/\^/g, "U").replace(/v/g, "D").replace(/\</g, "L").replace(/\>/g, "R");

// Split input into an array of lines and remove leading/trailing whitespace
let inputLines = rawData.trim().split("\n");

// Get the number of test cases
let testCases = +inputLines.shift();

// Iterate through each test case
for (let caseIndex = +0; caseIndex < testCases; caseIndex++) {
  // Add an empty line between test case outputs, except for the first one
  if (caseIndex !== +0) {
    console.log("");
  }

  // Read grid height and width
  let gridDimensions = inputLines.shift().split(" ").map(val => +val);
  let gameGrid = []; // Initialize the game grid

  // Add a top border of walls
  gameGrid.push("####################".split(""));

  let playerCoords = [+0, +0]; // Initialize tank coordinates [row, column]

  // Populate the game grid with map data
  for (let rowIndex = +0; rowIndex < gridDimensions[+0]; rowIndex++) {
    let currentRow = inputLines.shift().split(""); // Get current row as an array of characters
    let initialTankCol = -1; // Variable to store initial tank column

    // Find the initial position of the tank in the current row
    currentRow.forEach(function(cellValue, cellIndex) {
      if (cellValue === "U" || cellValue === "D" || cellValue === "L" || cellValue === "R") {
        initialTankCol = cellIndex;
      }
    });

    // If tank is found in this row, update its coordinates
    if (initialTankCol !== -1) {
      playerCoords = [rowIndex + 1, initialTankCol + 1];
    }

    // Add left and right wall borders to the current row
    currentRow.unshift("#");
    currentRow.push("#");
    gameGrid.push(currentRow);
  }

  // Add a bottom border of walls
  gameGrid.push("####################".split(""));

  // Consume the empty line separating map from commands
  inputLines.shift();

  // Read the sequence of commands
  let commandSequence = inputLines.shift().split("");

  // Process each command
  commandSequence.forEach(function(currentCommand) {
    if (currentCommand === "U") {
      shiftPosition(-1, +0, currentCommand); // Move Up
    } else if (currentCommand === "D") {
      shiftPosition(+1, +0, currentCommand); // Move Down
    } else if (currentCommand === "L") {
      shiftPosition(+0, -1, currentCommand); // Move Left
    } else if (currentCommand === "R") {
      shiftPosition(+0, +1, currentCommand); // Move Right
    } else if (currentCommand === "S") {
      // If command is 'S' (Shoot), determine tank's current direction
      let currentTankDirection = gameGrid[playerCoords[+0]][playerCoords[+1]];
      if (currentTankDirection === "U") {
        fireProjectile(-1, +0); // Shoot Up
      } else if (currentTankDirection === "D") {
        fireProjectile(+1, +0); // Shoot Down
      } else if (currentTankDirection === "L") {
        fireProjectile(+0, -1); // Shoot Left
      } else if (currentTankDirection === "R") {
        fireProjectile(+0, +1); // Shoot Right
      }
    }
  });

  // Remove the top and bottom border rows before output
  gameGrid.shift();
  gameGrid.pop();

  // Join the grid rows into a single string, remove commas, and remove left/right border walls
  let finalOutputGrid = gameGrid.join("\n").replace(/\,/g, "").replace(/^#|#$/mg, "");

  // Replace internal tank symbols back to original output symbols and print the result
  console.log(finalOutputGrid.replace(/U/g, "^").replace(/D/g, "v").replace(/L/g, "<").replace(/R/g, ">"));
}
