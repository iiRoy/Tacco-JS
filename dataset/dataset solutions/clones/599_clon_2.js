// This script processes a grid-based puzzle using a breadth-first search approach.
// It aims to find the shortest path while consuming a specific resource.
function GridNavigator( startColumn, startRow )
{
  // Mark the starting cell as visited on the main level map.
  levelMap[startRow][startColumn] = ".";

  // Define offsets for moving in four cardinal directions (up, left, right, down).
  var columnShifts = [ 0, -1, 1, 0 ];
  var rowShifts    = [ -1, 0, 0, 1 ];

  // Initialize the path length counter.
  var currentDistance = 0;

  // Initialize the BFS exploration queue. Each element holds:
  // [currentColumn, currentRow, distanceToReach, powerConsumed, currentMapState]
  var explorationQueue = [ [startColumn, startRow, currentDistance, 1, levelMap] ];

  // An object to keep track of already explored states to prevent cycles and redundant computations.
  var exploredStates = {};

  // Create a unique string identifier for the initial state and mark it as explored.
  exploredStates[ startColumn + " " + startRow + " " + levelMap.join("") ] = true;

  // Begin the breadth-first search loop.
  while ( true )
  {
    // If the queue is empty, no path was found to the target.
    if ( explorationQueue.length === 0 )
    {
      currentDistance = -1;
      break;
    }

    // Dequeue the current node for processing.
    var currentNode = explorationQueue.shift();

    // Extract individual components from the current node.
    var currentColumn  = currentNode[0];
    var currentRow     = currentNode[1];
    var nodeDistance   = currentNode[2];
    var consumedPower  = currentNode[3];
    var activeMapState = currentNode[4];

    // Check if the goal condition is met (consumed power exceeds the threshold).
    if ( consumedPower === powerThreshold + 1 )
    {
      currentDistance = nodeDistance;
      break;
    }

    // Iterate through all four possible directions from the current cell.
    for ( var dirIdx = 0; dirIdx < 4; dirIdx++ )
    {
      // Calculate the coordinates of the next adjacent cell.
      var nextColumn = currentColumn + columnShifts[dirIdx];
      var nextRow    = currentRow    + rowShifts[dirIdx];

      // Store the potential power consumption for the next state.
      var potentialPower = consumedPower;

      // Skip this neighbor if it's out of bounds of the grid.
      if ( nextColumn < 0 || nextRow < 0 || nextColumn >= mapDimensions[0] || nextRow >= mapDimensions[1] )
      {
        continue;
      }

      // Skip this neighbor if it's an impassable obstacle ('X').
      if ( levelMap[nextRow][nextColumn] === "X" )
      {
        continue;
      }

      // Create a deep copy of the current map state to avoid modifying previous states.
      var mapClone = activeMapState.map( function(rowVector) { return rowVector.slice(); } );

      // If the next cell requires the current 'potentialPower' level,
      // it means we can consume it and advance to the next power level.
      if ( mapClone[nextRow][nextColumn] === "" + potentialPower )
      {
        potentialPower++; // Increment power level.
        mapClone[nextRow][nextColumn] = "."; // Mark this cell as visited in the cloned map.
      }

      // Generate a unique string key for the new state (position + map configuration).
      var stateIdentifier = nextColumn + " " + nextRow + " " + mapClone.join("");

      // If this state has already been explored, skip it.
      if ( exploredStates.hasOwnProperty(stateIdentifier) )
      {
        continue;
      }

      // Mark the new state as explored.
      exploredStates[stateIdentifier] = true;

      // Enqueue the new state with updated distance, power, and map configuration.
      explorationQueue.push([ nextColumn, nextRow, nodeDistance + 1, potentialPower, mapClone ]);
    }
  }
  // Return the calculated shortest distance, or -1 if no path was found.
  return currentDistance;
}

// Use the 'fs' module to read the puzzle input from standard input.
var fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim whitespace from the input and split it into an array of lines.
var lineFragments = (fileData.trim()).split("\n");
// Parse the first line to get grid dimensions (width, height) and the power threshold.
var mapDimensions = (lineFragments.shift()).split(" ").map(Number);
// Extract the power threshold value.
var powerThreshold = mapDimensions[2];
// Initialize the 2D array that represents the game level map.
var levelMap = [];
// Initialize an array to store the starting coordinates.
var initialCoords = [];
// Loop through the remaining input lines to populate the level map.
for ( var rowCounter = 0; rowCounter < mapDimensions[1]; rowCounter++ )
{
  // Split each line into individual characters to form a row.
  var charRow = (lineFragments.shift()).split("");
  // Check if the starting point 'S' is present in the current row.
  var startColIndex = charRow.indexOf("S");
  if ( startColIndex !== -1 )
  {
    initialCoords = [startColIndex, rowCounter]; // Store its coordinates.
  }
  // Add the processed character row to the level map.
  levelMap.push(charRow);
}
// This variable would typically store the final result of the BFS.
// In this snippet, it's initialized to zero.
var computedAnswer = 0;
// The line below calls the BFS function and assigns its result to `computedAnswer`.
// However, it was commented out in the original snippet, so it remains commented here
// to maintain the exact structure and statements.
// computedAnswer = GridNavigator(initialCoords[0], initialCoords[1]);
console.log(computedAnswer);