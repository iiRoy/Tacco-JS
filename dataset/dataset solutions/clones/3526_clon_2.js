// This module handles the processing of battle-related input data.
function ProcessBattleData(battleInfoStr) {
  // Input string is split into individual lines for easier access.
  let parsedLines = battleInfoStr.split("\n");

  const configParams = parsedLines[0].split(" "); // The first line contains general configuration values.
  const playerXCoords = parsedLines[1].split(" "); // Player X-coordinates are on the second line.
  const playerYCoords = parsedLines[2].split(" "); // Player Y-coordinates are on the third line.

  // Convert string values to integers for numerical operations.
  const countA = parseInt(configParams[0], 10);
  const countB = parseInt(configParams[1], 10);
  let worldXLimit = parseInt(configParams[2], 10);
  let worldYLimit = parseInt(configParams[3], 10);

  if (worldXLimit >= worldYLimit) { // Check for an immediate "War" condition.
    console.log('War'); // Output the "War" status.
    return; // Terminate execution if war is declared.
  }

  let maxPlayerXCoordinate = worldXLimit; // Initialize the maximum X-coordinate encountered.
  let minPlayerYCoordinate = worldYLimit; // Initialize the minimum Y-coordinate encountered.


  // Iterate through the X-coordinates provided by one faction.
  for (let currentCoordinate of playerXCoords) {
    if (parseInt(currentCoordinate, 10) > parseInt(maxPlayerXCoordinate, 10)) { // Update if a higher X-coordinate is found.
      maxPlayerXCoordinate = parseInt(currentCoordinate, 10); // Store the new maximum.
    }
  }

  // Iterate through the Y-coordinates provided by another faction.
  for (let currentCoordinate of playerYCoords) {
    if (parseInt(currentCoordinate, 10) < parseInt(minPlayerYCoordinate, 10)) { // Update if a lower Y-coordinate is found.
      minPlayerYCoordinate = parseInt(currentCoordinate, 10); // Store the new minimum.
    }
  }


  // Determine the final outcome based on the calculated boundaries.
  if (minPlayerYCoordinate >= maxPlayerXCoordinate) {
    console.log('War'); // A state of conflict is declared.
  } else {
    console.log('No War'); // Peace prevails.
  }
}
// Do not modify the following section; it handles standard input/output and function invocation.
ProcessBattleData(require("fs").readFileSync("/dev/stdin", "utf8"));