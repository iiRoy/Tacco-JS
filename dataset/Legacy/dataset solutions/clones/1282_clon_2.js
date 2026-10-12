'use strict';
(function(inputSource) {
  // Function to construct a multi-level architectural layout
  function createStructure(numBuildings, numFloors, numRooms) {
    // Initialize the main complex array to hold building data
    var complex = [];
    // Iterate through each building unit
    for (var idxB = 0; idxB < numBuildings; idxB++) {
      var level = []; // Represents a single floor within a building
      // Iterate through each floor level
      for (var idxF = 0; idxF < numFloors; idxF++) {
        var unit = []; // Represents a collection of rooms on a floor
        // Iterate through each room within the current floor
        for (var idxR = 0; idxR < numRooms; idxR++) {
          unit.push(0); // Assign an initial state (e.g., empty) to the room
        }
        level.push(unit); // Add the array of rooms to the current floor
      }
      complex.push(level); // Add the completed floor array to the building structure
    }
    // Prepend a decorative header line to the beginning of the complex array
    complex.unshift(Array(numRooms * 2).fill('#').join(''));
    return complex; // Return the fully initialized architectural complex
  }

  // Function to process and format occupancy updates for the structure
  function processOccupancy(initialLayout, occupancyUpdates) {
    // Extract the first element, which serves as a separator string, and remove it
    var separatorLine = initialLayout.shift();

    // Apply each individual occupancy update from the provided data
    occupancyUpdates.map(function(updateEntry) {
      // Locate the specific room based on the coordinates in the update entry
      var targetRoom = initialLayout[updateEntry[0] - 1][updateEntry[1] - 1];
      // Update the room's state using splice, replacing one element at the specified index
      targetRoom.splice(updateEntry[2] - 1, 1, updateEntry[3]);
    });

    // Format the updated layout into a displayable string
    return initialLayout.map(function(floorLayout) {
      // For each floor, map its room states to a formatted string
      return floorLayout.map(function(roomStates) {
        // Join the room states with spaces, prepending an additional space for alignment
        return ' ' + roomStates.join(' ');
      }).join('\n'); // Join the formatted floor strings with newline characters
    }).join('\n' + separatorLine + '\n'); // Join the building sections with the separator line
  }

  // Read raw input data from the provided source
  var rawData = inputSource.toString().trim().split('\n');
  // Parse the raw input lines into arrays of numbers
  var parsedUpdates = rawData.map(function(lineContent) {
    return lineContent.split(' ').map(Number);
  });
  // Remove the first line of parsed updates, as it's typically metadata
  parsedUpdates.shift();

  // Execute the main logic:
  // 1. Create the initial building structure.
  // 2. Process the occupancy updates against this structure.
  // 3. Output the final formatted result to the console.
  console.log(processOccupancy(createStructure(4, 3, 10), parsedUpdates));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
