let buildingData = []; // Initialize a structure to hold building information

// Populate the building structure with default zero values
for (let buildingIdx = 0; buildingIdx < 4; buildingIdx++) {
  let floorUnits = []; // Represents floors within a building
  for (let floorIdx = 0; floorIdx < 3; floorIdx++) {
    // Each floor has 10 units, initialized to zero occupants
    floorUnits[floorIdx] = Array(10).fill(0);
  }
  buildingData[buildingIdx] = floorUnits; // Assign the floors to the current building
}

// Read input from standard input
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into individual lines
rawData = rawData.split("\n");

// Process each line of input, starting from the second line (index 1)
for (let lineIdx = 1; lineIdx < rawData.length; lineIdx++) {
  // Parse the current line into numbers
  let parsedLine = rawData[lineIdx].split(" ").map(Number);
  
  // Extract and adjust values for 0-based indexing
  let buildingNum = parsedLine[0] - 1; // Building index
  let floorNum = parsedLine[1] - 1;    // Floor index
  let roomNum = parsedLine[2] - 1;     // Room index
  let occupants = parsedLine[3];       // Number of occupants to add
  
  // Update the building data with the new occupant count
  buildingData[buildingNum][floorNum][roomNum] += occupants;
}

// Output the final state of the building data
for (let currentBuilding = 0; currentBuilding < buildingData.length; currentBuilding++) {
  for (let currentFloor = 0; currentFloor < buildingData[currentBuilding].length; currentFloor++) {
    // Print the occupants of each room on the current floor, separated by spaces
    console.log(buildingData[currentBuilding][currentFloor].join(" "));
  }
  // Print a separator line between buildings, but not after the last one
  if (currentBuilding !== buildingData.length - 1) {
    console.log("####################");
  }
}
