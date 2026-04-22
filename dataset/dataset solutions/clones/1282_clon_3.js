'use strict';
(function(rawInputContent) {

  // A utility function to rigorously validate if a value is a positive integer.
  // This adds a layer of robustness to function parameters.
  const validatePositiveInteger = (value, parameterName) => {
    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue <= 0) {
      // Throwing an error provides immediate feedback for invalid inputs.
      throw new Error(`Parameter Error: '${parameterName}' must be a positive whole number. Received: ${value}`);
    }
    return numericValue;
  };

  // This function initializes a multi-dimensional array representing a complex structure.
  // It simulates a building with multiple floors, each having several rooms.
  function initializeComplexStructure(totalBuildings, floorsPerBuilding, roomsPerFloor) {
    // Applying validation to ensure sensible dimensions for the structure.
    const actualBuildings = validatePositiveInteger(totalBuildings, 'totalBuildings');
    const actualFloors = validatePositiveInteger(floorsPerBuilding, 'floorsPerBuilding');
    const actualRooms = validatePositiveInteger(roomsPerFloor, 'roomsPerFloor');

    let mainStructureArray = []; // Represents the collection of buildings.
    const initialRoomState = 0; // The default value for an unoccupied room.

    // Outer loop for iterating through each building.
    for (let buildingIndex = 0; buildingIndex < actualBuildings; buildingIndex++) {
      let currentBuildingFloors = []; // Represents the floors within a single building.
      // Middle loop for iterating through each floor in the current building.
      for (let floorIndex = 0; floorIndex < actualFloors; floorIndex++) {
        // Inner part: create an array for rooms on the current floor, all initially empty.
        // Using Array.fill is an alternative to a manual loop for initialization.
        let currentFloorRooms = new Array(actualRooms).fill(initialRoomState);
        currentBuildingFloors.push(currentFloorRooms);
      }
      mainStructureArray.push(currentBuildingFloors);
    }

    // A decorative separator line added to the beginning of the structure for display purposes.
    const separatorCharacter = '#';
    const separatorLineLength = actualRooms * 2; // Length is twice the number of rooms, for visual consistency.
    const generatedSeparator = Array(separatorLineLength).fill(separatorCharacter).join('');

    // Prepending the separator to the structure array.
    mainStructureArray.unshift(generatedSeparator);

    return mainStructureArray;
  }

  // This function processes a list of updates for the structure and formats it for display.
  // It modifies the structure based on occupancy data and then renders it as a string.
  function applyStructureUpdatesAndRender(currentStructureState, occupancyInstructions) {
    // A quick check to ensure the structure isn't null or empty before proceeding.
    if (!currentStructureState || currentStructureState.length === 0) {
      return "Error: Initial structure state is invalid or empty.";
    }

    // The first element is expected to be the pre-generated header separator.
    const displayHeaderString = currentStructureState.shift();

    // Process each instruction to update the state of rooms.
    // Using forEach as the return value of map is not required for this side-effect operation.
    occupancyInstructions.forEach(function(singleInstruction) {
      // Each instruction should contain [building ID, floor ID, room ID, new value].
      const targetBuildingID = singleInstruction[0];
      const targetFloorID = singleInstruction[1];
      const targetRoomID = singleInstruction[2];
      const assignedValue = singleInstruction[3];

      // Robust boundary checks to prevent common array access errors (e.g., out-of-bounds).
      // Indices are 1-based in input, so convert to 0-based for array access.
      if (targetBuildingID < 1 || targetBuildingID > currentStructureState.length) {
        console.warn(`Skipping update: Building ID ${targetBuildingID} is out of valid range.`);
        return; // Move to the next instruction.
      }
      const selectedBuilding = currentStructureState[targetBuildingID - 1];

      if (targetFloorID < 1 || targetFloorID > selectedBuilding.length) {
        console.warn(`Skipping update: Floor ID ${targetFloorID} for building ${targetBuildingID} is out of range.`);
        return;
      }
      const selectedFloor = selectedBuilding[targetFloorID - 1];

      if (targetRoomID < 1 || targetRoomID > selectedFloor.length) {
        console.warn(`Skipping update: Room ID ${targetRoomID} for floor ${targetFloorID} in building ${targetBuildingID} is out of range.`);
        return;
      }

      // Update the room's value using splice, which can replace elements.
      // This directly modifies the array in place.
      selectedFloor.splice(targetRoomID - 1, 1, assignedValue);
    });

    // Constants for output formatting to improve readability.
    const roomDelimiter = ' ';
    const floorDelimiter = '\n';
    const buildingDelimiter = '\n' + displayHeaderString + '\n';

    // Transform the modified structure into a human-readable string format.
    const formattedBuildingOutputs = currentStructureState.map(function(buildingFloorSet) {
      return buildingFloorSet.map(function(floorRoomSet) {
        // Each room value is prefixed with a space for consistent spacing.
        return floorRoomSet.map(roomValue => ` ${roomValue}`).join(roomDelimiter);
      }).join(floorDelimiter); // Floors within a building are separated by newlines.
    });

    // Buildings are separated by the header string for clear visual distinction.
    return formattedBuildingOutputs.join(buildingDelimiter);
  }

  // --- Main Execution Flow ---

  // Read raw input, convert to string, remove leading/trailing whitespace, and split into lines.
  const inputLinesArray = rawInputContent.toString().trim().split('\n');

  // Guard clause: Exit if no input lines are provided.
  if (inputLinesArray.length === 0) {
    console.error("Critical Error: No input data was found. Program cannot proceed.");
    return;
  }

  // Parse each line into an array of numbers, representing update instructions.
  const parsedUpdateRequests = inputLinesArray.map(line => line.split(' ').map(Number));

  // The original problem structure implies the first line of input is metadata,
  // which is discarded as the building dimensions are hardcoded below.
  const initialMetadataLine = parsedUpdateRequests.shift();
  // console.log(`Debug: The first input line (metadata) was: ${JSON.stringify(initialMetadataLine)}`); // Optional debug output

  // Another guard clause: Check if there are any actual update requests left after discarding metadata.
  if (parsedUpdateRequests.length === 0) {
    console.warn("Warning: No valid room update instructions were found after processing input.");
    // We could either exit here or proceed to display an empty, initial layout.
    // For now, let's proceed to display an un-updated layout.
  }

  // Hardcoded dimensions for the structure, as per the problem's implicit requirements.
  const hardcodedBuildings = 4;
  const hardcodedFloors = 3;
  const hardcodedRooms = 10;

  // Step 1: Initialize the multi-level structure based on hardcoded dimensions.
  const initializedStructure = initializeComplexStructure(
    hardcodedBuildings,
    hardcodedFloors,
    hardcodedRooms
  );

  // Step 2: Apply the parsed occupancy changes and get the final formatted output string.
  const finalRenderedOutput = applyStructureUpdatesAndRender(
    initializedStructure,
    parsedUpdateRequests
  );

  // Step 3: Display the generated output to the console.
  console.log(finalRenderedOutput);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));