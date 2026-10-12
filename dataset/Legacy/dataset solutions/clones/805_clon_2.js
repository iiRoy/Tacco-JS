function fireProjectile(rowDelta, colDelta) {
  // Initialize a counter for steps taken by the projectile.
  let stepCount = 0;

  // The projectile continues indefinitely until it hits a boundary or target.
  while (true) {
    // Increment the step counter for each movement.
    stepCount++;

    // Calculate the next potential position of the projectile.
    const targetRow = playerVehicle[0] + (rowDelta * stepCount);
    const targetCol = playerVehicle[1] + (colDelta * stepCount);

    // Check what the projectile hits in the game grid.
    if (gameGrid[targetRow][targetCol] === "#") {
      // If it hits a wall ('#'), the projectile stops.
      break;
    } else if (gameGrid[targetRow][targetCol] === "*") {
      // If it hits a target ('*'), the target is destroyed (replaced with '.'), and the projectile stops.
      gameGrid[targetRow][targetCol] = ".";
      break;
    }
    // If it hits an empty space ('.') or another tank, it continues.
  }
}

// Read the entire input from standard input as a string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input string: replace specific characters with their normalized forms.
// This ensures consistent representation for tank directions.
const processedInput = rawData
  .replace(/\^/g, "U") // Up arrow becomes 'U'
  .replace(/v/g, "D") // Down arrow becomes 'D'
  .replace(/\</g, "L") // Left arrow becomes 'L'
  .replace(/\>/g, "R"); // Right arrow becomes 'R'

// Split the processed input into an array of lines.
let lineSegments = processedInput.trim().split("\n");

// The first line indicates the number of test cases. Convert it to a number.
const testCaseCount = lineSegments.shift() - 0;

// Iterate through each test case.
for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
  // If it's not the first test case, print an empty line for separation.
  if (caseIndex !== 0) {
    console.log("");
  }

  // The next line contains the height and width of the current game map.
  // Split by space and convert to numbers.
  const dimensions = lineSegments.shift().split(" ").map(Number);

  // Initialize the 2D array representing the game grid.
  // Add a top border row of '#' characters.
  const gameGrid = [];
  gameGrid.push("####################".split(""));

  // Initialize the player vehicle's position [row, column].
  let playerVehicle = [0, 0];

  // Process each row of the game map.
  for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    // Get the current row string and split it into an array of characters.
    const currentRow = lineSegments.shift().split("");

    // Find the initial position of the player vehicle within this row.
    let vehicleColPosition = -1;
    currentRow.forEach(function(charValue, charIndex) {
      if (charValue === "U" || charValue === "D" || charValue === "L" || charValue === "R") {
        vehicleColPosition = charIndex;
      }
    });

    // If the vehicle was found in this row, update its global position.
    // Add 1 to row and column because of the added border rows/columns.
    if (vehicleColPosition !== -1) {
      playerVehicle = [rowIndex + 1, vehicleColPosition + 1];
    }

    // Add left and right border '#' characters to the current row.
    currentRow.unshift("#");
    currentRow.push("#");

    // Add the bordered row to the game grid.
    gameGrid.push(currentRow);
  }

  // Add a bottom border row of '#' characters.
  gameGrid.push("####################".split(""));

  // Skip the empty line separating the map from the commands.
  lineSegments.shift();

  // Get the sequence of commands for the current test case.
  const commandSequence = lineSegments.shift().split("");

  // Process each command in the sequence.
  commandSequence.forEach(function(command) {
    // Handle 'U' (Up) command.
    if (command === "U") {
      // If the space above is empty ('.'), move the tank.
      if (gameGrid[playerVehicle[0] - 1][playerVehicle[1]] === ".") {
        gameGrid[playerVehicle[0] - 1][playerVehicle[1]] = "U"; // New position becomes 'U'
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "."; // Old position becomes empty
        playerVehicle[0]--; // Update tank's row
      } else {
        // If the space above is not empty, just change the tank's direction.
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "U";
      }
    }
    // Handle 'D' (Down) command.
    else if (command === "D") {
      // If the space below is empty ('.'), move the tank.
      if (gameGrid[playerVehicle[0] + 1][playerVehicle[1]] === ".") {
        gameGrid[playerVehicle[0] + 1][playerVehicle[1]] = "D"; // New position becomes 'D'
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "."; // Old position becomes empty
        playerVehicle[0]++; // Update tank's row
      } else {
        // If the space below is not empty, just change the tank's direction.
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "D";
      }
    }
    // Handle 'L' (Left) command.
    else if (command === "L") {
      // If the space to the left is empty ('.'), move the tank.
      if (gameGrid[playerVehicle[0]][playerVehicle[1] - 1] === ".") {
        gameGrid[playerVehicle[0]][playerVehicle[1] - 1] = "L"; // New position becomes 'L'
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "."; // Old position becomes empty
        playerVehicle[1]--; // Update tank's column
      } else {
        // If the space to the left is not empty, just change the tank's direction.
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "L";
      }
    }
    // Handle 'R' (Right) command.
    else if (command === "R") {
      // If the space to the right is empty ('.'), move the tank.
      if (gameGrid[playerVehicle[0]][playerVehicle[1] + 1] === ".") {
        gameGrid[playerVehicle[0]][playerVehicle[1] + 1] = "R"; // New position becomes 'R'
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "."; // Old position becomes empty
        playerVehicle[1]++; // Update tank's column
      } else {
        // If the space to the right is not empty, just change the tank's direction.
        gameGrid[playerVehicle[0]][playerVehicle[1]] = "R";
      }
    }
    // Handle 'S' (Shoot) command.
    else if (command === "S") {
      // Determine the tank's current direction from its character on the grid.
      const currentDirection = gameGrid[playerVehicle[0]][playerVehicle[1]];

      // Call the projectile firing function based on the tank's direction.
      if (currentDirection === "U") {
        fireProjectile(-1, 0); // Shoot Up (row decreases, col stays same)
      } else if (currentDirection === "D") {
        fireProjectile(1, 0); // Shoot Down (row increases, col stays same)
      } else if (currentDirection === "L") {
        fireProjectile(0, -1); // Shoot Left (row stays same, col decreases)
      } else if (currentDirection === "R") {
        fireProjectile(0, 1); // Shoot Right (row stays same, col increases)
      }
    }
  });

  // Remove the top and bottom border rows before printing the final map.
  gameGrid.shift();
  gameGrid.pop();

  // Join the grid rows into a single string, then perform final replacements for output.
  const finalOutput = gameGrid
    .join("\n") // Join rows with newline characters
    .replace(/^#/mg, "") // Remove leading '#' (left border) from each line
    .replace(/#$/mg, "") // Remove trailing '#' (right border) from each line
    .replace(/\,/g, "") // Remove commas introduced by array.join()
    .replace(/U/g, "^") // Convert 'U' back to '^' for output
    .replace(/D/g, "v") // Convert 'D' back to 'v' for output
    .replace(/L/g, "<") // Convert 'L' back to '<' for output
    .replace(/R/g, ">"); // Convert 'R' back to '>' for output

  // Print the final state of the game map for the current test case.
  console.log(finalOutput);
}
