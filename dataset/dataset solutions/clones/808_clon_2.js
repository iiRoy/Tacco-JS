/*
 * This script processes a series of battle scenarios.
 * It simulates a tank's movement and firing actions on a grid.
 */

// Function to adjust the mobile unit's position on the battlefield
function relocateItem(
  rowOffset, // Vertical displacement
  colOffset, // Horizontal displacement
  displayChar // Character representing the unit's new orientation
) {
  // Check if the target cell is empty ('.')
  if (
    battlefieldMatrix[playerVehicle[0] + rowOffset][
      playerVehicle[1] + colOffset
    ] == "."
  ) {
    // If empty, update the new position with the unit's character
    battlefieldMatrix[playerVehicle[0] + rowOffset][
      playerVehicle[1] + colOffset
    ] = displayChar;
    // Clear the unit's previous position
    battlefieldMatrix[playerVehicle[0]][playerVehicle[1]] = ".";
    // Update the unit's stored coordinates
    playerVehicle[0] += rowOffset;
    playerVehicle[1] += colOffset;
  } else {
    // If the target cell is occupied, just update the unit's orientation at its current spot
    battlefieldMatrix[playerVehicle[0]][playerVehicle[1]] = displayChar;
  }
}

// Function to simulate firing a projectile from the mobile unit
function launchAttack(
  verticalDirection, // Direction multiplier for rows
  horizontalDirection // Direction multiplier for columns
) {
  let stepCounter = 0; // Initialize projectile's travel distance

  // Loop indefinitely until a target or obstacle is hit
  while (true) {
    stepCounter++; // Increment distance
    // Check if a wall ('#') is hit
    if (
      battlefieldMatrix[
        playerVehicle[0] + verticalDirection * stepCounter
      ][
        playerVehicle[1] + horizontalDirection * stepCounter
      ] == "#"
    )
      break; // Stop if wall hit
    // Check if an enemy unit ('*') is hit
    else if (
      battlefieldMatrix[
        playerVehicle[0] + verticalDirection * stepCounter
      ][
        playerVehicle[1] + horizontalDirection * stepCounter
      ] == "*"
    ) {
      // Destroy the enemy unit by replacing it with an empty spot
      battlefieldMatrix[
        playerVehicle[0] + verticalDirection * stepCounter
      ][
        playerVehicle[1] + horizontalDirection * stepCounter
      ] = ".";
      break; // Stop after hitting and destroying enemy
    }
  }
}

// Obtain raw input data from standard input
const sourceText = require("fs")
  .readFileSync("/dev/stdin", "utf8");

// Standardize tank orientation symbols for internal processing
const standardizedInput = sourceText
  .replace(/\^/g, "U") // Up
  .replace(/v/g, "D") // Down
  .replace(/\</g, "L") // Left
  .replace(/\>/g, "R"); // Right

// Parse input into an array of lines, trimming extra whitespace
let parsedLines = standardizedInput.trim().split("\n");

// Extract the total number of test scenarios
let scenarioQuantity = Number(parsedLines.shift());

// Iterate through each simulation scenario
for (let caseNum = 0; caseNum < scenarioQuantity; caseNum++) {
  // Add an empty line separator between outputs of different scenarios (if not the first)
  if (caseNum !== 0) {
    console.log("");
  }

  // Get grid dimensions (height and width) for the current scenario
  const gridDimensions = parsedLines.shift().split(" ").map(Number);
  // Initialize the game grid matrix
  let battlefieldMatrix = [];

  // Add a top border of '#' characters to the grid
  battlefieldMatrix.push("####################".split(""));

  // Initialize player unit's coordinates
  let playerVehicle = [0, 0];

  // Process each row of the map to populate the grid
  for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
    // Get characters for the current map row
    const rowCharacters = parsedLines.shift().split("");
    let initialColPos = -1; // Temporary variable to store the unit's column index

    // Find the player unit's initial position within the row
    rowCharacters.forEach(function (element, positionInRow) {
      if (
        element === "U" ||
        element === "D" ||
        element === "L" ||
        element === "R"
      ) {
        initialColPos = positionInRow;
      }
    });

    // If the unit was found in this row, update its coordinates (adjusted for borders)
    if (initialColPos !== -1) {
      playerVehicle = [rowIndex + 1, initialColPos + 1];
    }

    // Add left and right borders to the current row
    rowCharacters.unshift("#");
    rowCharacters.push("#");
    // Add the processed row to the battlefield matrix
    battlefieldMatrix.push(rowCharacters);
  }

  // Add a bottom border of '#' characters to the grid
  battlefieldMatrix.push("####################".split(""));

  // Consume the empty line separating the map from the command sequence
  parsedLines.shift();

  // Get the sequence of commands for the current scenario
  const actionInstructions = parsedLines.shift().split("");

  // Process each command in the sequence
  actionInstructions.forEach(function (currentCommand) {
    // Determine action based on the command character
    if (currentCommand === "U") {
      relocateItem(-1, 0, currentCommand); // Move Up
    } else if (currentCommand === "D") {
      relocateItem(1, 0, currentCommand); // Move Down
    } else if (currentCommand === "L") {
      relocateItem(0, -1, currentCommand); // Move Left
    } else if (currentCommand === "R") {
      relocateItem(0, 1, currentCommand); // Move Right
    } else if (currentCommand === "S") {
      // If the command is 'Shoot'
      // Get the current orientation of the player unit
      const unitOrientation =
        battlefieldMatrix[playerVehicle[0]][playerVehicle[1]];
      // Fire projectile based on unit's orientation
      if (unitOrientation === "U") {
        launchAttack(-1, 0); // Shoot Up
      } else if (unitOrientation === "D") {
        launchAttack(1, 0); // Shoot Down
      } else if (unitOrientation === "L") {
        launchAttack(0, -1); // Shoot Left
      } else if (unitOrientation === "R") {
        launchAttack(0, 1); // Shoot Right
      }
    }
  });

  // Remove the temporary top and bottom borders before final output
  battlefieldMatrix.shift();
  battlefieldMatrix.pop();

  // Format the final map for display
  // Join rows, remove array commas, remove remaining boundary '#' characters
  const resultDisplay = battlefieldMatrix
    .join("\n")
    .replace(/,/g, "")
    .replace(/^#|#$/mg, "");

  // Print the final map, converting internal symbols back to original display characters
  console.log(
    resultDisplay
      .replace(/U/g, "^")
      .replace(/D/g, "v")
      .replace(/L/g, "<")
      .replace(/R/g, ">")
  );
}