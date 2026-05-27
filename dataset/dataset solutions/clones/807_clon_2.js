function fireProjectile(rowDelta, colDelta) {
  // Initialize a counter for the projectile's travel distance
  let stepCount = 0;

  // Loop to simulate the projectile's path until it hits an obstacle
  while (true) {
    stepCount++; // Increment the distance traveled by the projectile

    // Check if the projectile hits a solid wall ('#')
    if (gameGrid[playerTank[0] + (rowDelta * stepCount)][playerTank[1] + (colDelta * stepCount)] === "#") {
      break; // Stop the projectile if it hits a wall
    }
    // Check if the projectile hits a target ('*')
    else if (gameGrid[playerTank[0] + (rowDelta * stepCount)][playerTank[1] + (colDelta * stepCount)] === "*") {
      // If a target is hit, replace it with an empty space ('.') and stop
      gameGrid[playerTank[0] + (rowDelta * stepCount)][playerTank[1] + (colDelta * stepCount)] = ".";
      break;
    }
  }
}

// Read the entire input from standard input using Node.js file system module
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input string to standardize direction characters
const processedInput = rawData
  .replace(/\^/g, "U") // Replace '^' (up arrow) with 'U'
  .replace(/v/g, "D") // Replace 'v' (down arrow) with 'D'
  .replace(/\</g, "L") // Replace '<' (left arrow) with 'L'
  .replace(/\>/g, "R"); // Replace '>' (right arrow) with 'R'

// Split the processed input into an array of lines and remove any leading/trailing whitespace
let lineSegments = processedInput.trim().split("\n");

// Extract the total number of test cases from the first line and convert it to a number
const testCases = lineSegments.shift() - 0;

// Iterate through each individual test case
for (let caseIndex = 0; caseIndex < testCases; caseIndex++) {
  // Print a newline character to separate the output of different test cases, except for the first one
  if (caseIndex !== 0) {
    console.log("\n");
  }

  // Get the grid's height and width from the next line, splitting by space and converting to numbers
  const gridDimensions = lineSegments.shift().split(" ").map(Number);

  // Initialize the game grid, which will store the map and tank positions
  let gameGrid = [];
  // Add a top boundary row of '#' characters
  gameGrid.push("####################".split(""));

  // Initialize the player tank's coordinates (row, column)
  let playerTank = [0, 0];

  // Loop through each row to build the game grid and find the tank's initial position
  for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
    // Get the characters for the current map row
    const currentRowChars = lineSegments.shift().split("");

    let tankColPos = -1; // Temporary variable to store the tank's column index

    // Iterate through the characters of the current row to find the tank
    currentRowChars.forEach(function(charValue, charIndex) {
      // If a tank character (U, D, L, R) is found, record its column index
      if (charValue === "U" || charValue === "D" || charValue === "L" || charValue === "R") {
        tankColPos = charIndex;
      }
    });

    // If the tank was found in this row, update its actual grid coordinates
    // (adjusted for the added boundary rows/columns)
    if (tankColPos !== -1) {
      playerTank = [rowIndex + 1, tankColPos + 1];
    }

    // Add boundary '#' characters to the left and right of the current row
    currentRowChars.unshift("#");
    currentRowChars.push("#");
    // Add the modified row to the game grid
    gameGrid.push(currentRowChars);
  }

  // Add a bottom boundary row of '#' characters
  gameGrid.push("####################".split(""));

  // Consume the empty line that separates the grid definition from the command sequence
  lineSegments.shift();

  // Get the sequence of commands for the current test case
  const commandSequence = lineSegments.shift().split("");

  // Process each command in the sequence
  commandSequence.forEach(function(currentCommand) {
    // Handle 'U' (Up) command:
    if (currentCommand === "U" && gameGrid[playerTank[0] - 1][playerTank[1]] === ".") {
      // If the space above is empty ('.'), move the tank up
      gameGrid[playerTank[0] - 1][playerTank[1]] = "U";
      gameGrid[playerTank[0]][playerTank[1]] = ".";
      playerTank[0]--;
    } else if (currentCommand === "U" && gameGrid[playerTank[0] - 1][playerTank[1]] !== ".") {
      // If the space above is not empty, just change the tank's direction to Up
      gameGrid[playerTank[0]][playerTank[1]] = "U";
    }
    // Handle 'D' (Down) command:
    else if (currentCommand === "D" && gameGrid[playerTank[0] + 1][playerTank[1]] === ".") {
      // If the space below is empty ('.'), move the tank down
      gameGrid[playerTank[0] + 1][playerTank[1]] = "D";
      gameGrid[playerTank[0]][playerTank[1]] = ".";
      playerTank[0]++;
    } else if (currentCommand === "D" && gameGrid[playerTank[0] + 1][playerTank[1]] !== ".") {
      // If the space below is not empty, just change the tank's direction to Down
      gameGrid[playerTank[0]][playerTank[1]] = "D";
    }
    // Handle 'L' (Left) command:
    else if (currentCommand === "L" && gameGrid[playerTank[0]][playerTank[1] - 1] === ".") {
      // If the space to the left is empty ('.'), move the tank left
      gameGrid[playerTank[0]][playerTank[1] - 1] = "L";
      gameGrid[playerTank[0]][playerTank[1]] = ".";
      playerTank[1]--;
    } else if (currentCommand === "L" && gameGrid[playerTank[0]][playerTank[1] - 1] !== ".") {
      // If the space to the left is not empty, just change the tank's direction to Left
      gameGrid[playerTank[0]][playerTank[1]] = "L";
    }
    // Handle 'R' (Right) command:
    else if (currentCommand === "R" && gameGrid[playerTank[0]][playerTank[1] + 1] === ".") {
      // If the space to the right is empty ('.'), move the tank right
      gameGrid[playerTank[0]][playerTank[1] + 1] = "R";
      gameGrid[playerTank[0]][playerTank[1]] = ".";
      playerTank[1]++;
    } else if (currentCommand === "R" && gameGrid[playerTank[0]][playerTank[1] + 1] !== ".") {
      // If the space to the right is not empty, just change the tank's direction to Right
      gameGrid[playerTank[0]][playerTank[1]] = "R";
    }
    // Handle 'S' (Shoot) command:
    else if (currentCommand === "S") {
      // Get the current direction of the tank from the grid
      const tankDirection = gameGrid[playerTank[0]][playerTank[1]];
      // Call the projectile firing function based on the tank's direction
      if (tankDirection === "U") fireProjectile(-1, 0); // Shoot Up
      else if (tankDirection === "D") fireProjectile(1, 0); // Shoot Down
      else if (tankDirection === "L") fireProjectile(0, -1); // Shoot Left
      else if (tankDirection === "R") fireProjectile(0, 1); // Shoot Right
    }
  });

  // Remove the temporary top and bottom boundary rows before printing the final grid
  gameGrid.shift();
  gameGrid.pop();

  // Format the final game grid for output:
  console.log(
    gameGrid.join("\n") // Join rows with newline characters
    .replace(/^#/mg, "") // Remove the left boundary '#' from each line
    .replace(/#$/mg, "") // Remove the right boundary '#' from each line
    .replace(/\,/g, "") // Remove commas that result from array.join() on inner arrays
    .replace(/U/g, "^") // Convert 'U' back to '^' for output
    .replace(/D/g, "v") // Convert 'D' back to 'v' for output
    .replace(/L/g, "<") // Convert 'L' back to '<' for output
    .replace(/R/g, ">") // Convert 'R' back to '>' for output
  );
}
