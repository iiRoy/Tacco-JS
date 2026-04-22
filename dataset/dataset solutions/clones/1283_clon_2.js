let buildingStructure = []; // Initialize the main structural array

for ( let levelIndex = 0; levelIndex < 4; levelIndex++ ) { // Loop through each level (e.g., floor)
  let unitCollection = []; // Create a collection of units for the current level
  for ( let roomBlockIndex = 0; roomBlockIndex < 3; roomBlockIndex++ ) { // Loop through each block of rooms within a unit
    unitCollection[roomBlockIndex] = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]; // Initialize a room block with ten zero counters
  }
  buildingStructure[levelIndex] = unitCollection; // Assign the completed unit collection to the current level
}

const rawDataStream = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a UTF-8 string
let processedLines = rawDataStream.split('\n'); // Split the input string into an array of lines

for ( let currentLineNum = 1; currentLineNum < processedLines.length; currentLineNum++ ) { // Iterate through each line of input data, starting from the second line
  const parsedValues = processedLines[currentLineNum].split(' ').map(Number); // Split the current line by spaces and convert parts to numbers

  let targetFloor = parsedValues[0] - 1; // Extract and adjust the floor identifier
  let targetUnit = parsedValues[1] - 1; // Extract and adjust the unit identifier
  let targetRoom = parsedValues[2] - 1; // Extract and adjust the room identifier
  let incrementValue = parsedValues[3]; // Extract the value to be added

  buildingStructure[targetFloor][targetUnit][targetRoom] += incrementValue; // Update the counter in the structure
}

for ( let currentFloorIter = 0; currentFloorIter < buildingStructure.length; currentFloorIter++ ) { // Loop through each floor in the structure for display
  for ( let currentUnitIter = 0; currentUnitIter < buildingStructure[currentFloorIter].length; currentUnitIter++ ) { // Loop through each unit within the current floor
    console.log( buildingStructure[currentFloorIter][currentUnitIter].join(' ') ); // Print the room counts for the current unit, separated by spaces
  }

  // Add a separator between floors, but not after the very last floor
  if ( currentFloorIter !== buildingStructure.length - 1 ) {
    console.log( "--------------------" );
  }
}