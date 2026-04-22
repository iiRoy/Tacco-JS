// Function to simulate firing a projectile from the player vehicle
function fireProjectile(rowDirection, colDirection) {
  // Initialize a counter for the steps the projectile travels
  let stepCounter = 0;

  // Loop indefinitely until the projectile hits an obstacle or a target
  while (true) {
    stepCounter++; // Increment the step count for each movement
    // Calculate the potential next position of the projectile based on current vehicle position and direction
    const targetRowPosition = playerCraftPosition[0] + (rowDirection * stepCounter);
    const targetColPosition = playerCraftPosition[1] + (colDirection * stepCounter);

    // Check if the projectile hits a solid wall ('#')
    if (playGrid[targetRowPosition][targetColPosition] === "#") {
      break; // Stop the projectile's movement as it hit a wall
    }
    // Check if the projectile hits a destructible target ('*')
    else if (playGrid[targetRowPosition][targetColPosition] === "*") {
      playGrid[targetRowPosition][targetColPosition] = "."; // Remove the target by replacing it with an empty space
      break; // Stop the projectile's movement after hitting the target
    }
  }
}

// Read raw input data from standard input using Node.js 'fs' module
let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Normalize directional characters in the input to a consistent internal representation
rawInputData = rawInputData
  .replace(/\^/g, "U") // Replace caret '^' with 'U' for Up
  .replace(/v/g, "D") // Replace 'v' with 'D' for Down
  .replace(/\</g, "L") // Replace less-than '<' with 'L' for Left
  .replace(/\>/g, "R"); // Replace greater-than '>' with 'R' for Right

// Split the processed input into an array of lines and remove leading/trailing whitespace from the whole string
let inputLines = rawInputData.trim().split("\n");
// Extract the number of test cases from the very first line of input
let numberOfTests = Number(inputLines.shift());

// Iterate through each defined test case
for (let currentTestIndex = 0; currentTestIndex < numberOfTests; currentTestIndex++) {
  // Add a newline separator between the outputs of different test cases, except for the very first one
  if (currentTestIndex !== 0) {
    console.log("\n");
  }

  // Read grid dimensions (height and width) for the current test case from the next line
  let gridDimensions = inputLines.shift().split(" ").map(Number);
  // Initialize the game board (playGrid) with an artificial top border of '#' characters
  let playGrid = [];
  playGrid.push("####################".split("")); // Top border, assuming max width for now, will be adjusted by actual content

  // Initialize the player vehicle's starting position (row, column)
  let playerCraftPosition = [0, 0];

  // Populate the game board based on subsequent input lines, adding side borders
  for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
    let currentGridRow = inputLines.shift().split(""); // Get characters for the current row

    let vehicleColumnPosition = -1; // Initialize to indicate vehicle not found in this row
    // Search for the player vehicle's initial position and direction within the current row
    currentGridRow.forEach(function(cellCharacter, charPosition) {
      if (["U", "D", "L", "R"].includes(cellCharacter)) {
        vehicleColumnPosition = charPosition; // Store the column index where the vehicle is found
      }
    });

    // If a vehicle was found in this row, update its coordinates in the playerCraftPosition array
    if (vehicleColumnPosition !== -1) {
      playerCraftPosition = [rowIndex + 1, vehicleColumnPosition + 1]; // Adjust for the added top and left borders
    }

    currentGridRow.unshift("#"); // Add a left border ('#') to the current row
    currentGridRow.push("#"); // Add a right border ('#') to the current row
    playGrid.push(currentGridRow); // Add the processed row to the game board
  }

  playGrid.push("####################".split("")); // Add an artificial bottom border

  // Consume the empty line that typically separates the grid definition from the action sequence
  inputLines.shift();

  // Read the sequence of actions for the player vehicle from the next input line
  let playerActionsSequence = inputLines.shift().split("");

  // Process each action character in the sequence
  playerActionsSequence.forEach(function(actionCharacter) {
    // Get the current row and column of the player vehicle for easier access
    let currentRow = playerCraftPosition[0];
    let currentCol = playerCraftPosition[1];

    if (actionCharacter === "U") { // Action: Move Up
      // Check if the cell above is empty ('.')
      if (playGrid[currentRow - 1][currentCol] === ".") {
        playGrid[currentRow - 1][currentCol] = "U"; // Move vehicle to the new position, facing Up
        playGrid[currentRow][currentCol] = "."; // Clear the old position
        playerCraftPosition[0]--; // Update vehicle's row coordinate
      } else {
        playGrid[currentRow][currentCol] = "U"; // If cannot move, just change vehicle's direction to Up
      }
    } else if (actionCharacter === "D") { // Action: Move Down
      // Check if the cell below is empty ('.')
      if (playGrid[currentRow + 1][currentCol] === ".") {
        playGrid[currentRow + 1][currentCol] = "D"; // Move vehicle to the new position, facing Down
        playGrid[currentRow][currentCol] = "."; // Clear the old position
        playerCraftPosition[0]++; // Update vehicle's row coordinate
      } else {
        playGrid[currentRow][currentCol] = "D"; // If cannot move, just change vehicle's direction to Down
      }
    } else if (actionCharacter === "L") { // Action: Move Left
      // Check if the cell to the left is empty ('.')
      if (playGrid[currentRow][currentCol - 1] === ".") {
        playGrid[currentRow][currentCol - 1] = "L"; // Move vehicle to the new position, facing Left
        playGrid[currentRow][currentCol] = "."; // Clear the old position
        playerCraftPosition[1]--; // Update vehicle's column coordinate
      } else {
        playGrid[currentRow][currentCol] = "L"; // If cannot move, just change vehicle's direction to Left
      }
    } else if (actionCharacter === "R") { // Action: Move Right
      // Check if the cell to the right is empty ('.')
      if (playGrid[currentRow][currentCol + 1] === ".") {
        playGrid[currentRow][currentCol + 1] = "R"; // Move vehicle to the new position, facing Right
        playGrid[currentRow][currentCol] = "."; // Clear the old position
        playerCraftPosition[1]++; // Update vehicle's column coordinate
      } else {
        playGrid[currentRow][currentCol] = "R"; // If cannot move, just change vehicle's direction to Right
      }
    } else if (actionCharacter === "S") { // Action: Shoot
      // Determine the current facing direction of the player vehicle
      let currentVehicleDirection = playGrid[currentRow][currentCol];
      if (currentVehicleDirection === "U") {
        fireProjectile(-1, 0); // Call shoot function to fire Up (-1 row, 0 col change)
      } else if (currentVehicleDirection === "D") {
        fireProjectile(1, 0); // Call shoot function to fire Down (1 row, 0 col change)
      } else if (currentVehicleDirection === "L") {
        fireProjectile(0, -1); // Call shoot function to fire Left (0 row, -1 col change)
      } else if (currentVehicleDirection === "R") {
        fireProjectile(0, 1); // Call shoot function to fire Right (0 row, 1 col change)
      }
    }
  });

  // Remove the artificial top and bottom borders from the game board before printing
  playGrid.shift(); // Remove the top border row
  playGrid.pop(); // Remove the bottom border row

  // Prepare the final game board for output:
  // 1. Join rows with newline characters.
  // 2. Remove the left and right border '#' characters from each line.
  // 3. Remove any commas introduced by the join operation (if applicable, e.g., if array elements were joined by default).
  // 4. Convert the internal directional representations (U, D, L, R) back to their original symbols (^, v, <, >).
  console.log(
    playGrid.join("\n")
    .replace(/^#/mg, "") // Remove the leftmost '#' from each line (multiline global regex)
    .replace(/#$/mg, "") // Remove the rightmost '#' from each line (multiline global regex)
    .replace(/\,/g, "") // Remove any commas (e.g., from array.join default behavior)
    .replace(/U/g, "^") // Convert 'U' back to '^'
    .replace(/D/g, "v") // Convert 'D' back to 'v'
    .replace(/L/g, "<") // Convert 'L' back to '<'
    .replace(/R/g, ">") // Convert 'R' back to '>'
  );
}