// This module facilitates interactions with the file system.
const fileSystemMod = require('fs');

// Fetch the complete content from the standard input stream, interpreted as UTF-8 text.
const rawInputData = fileSystemMod.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw text: first, remove leading/trailing whitespace,
// then divide the string into an array of separate lines using the newline character as a delimiter.
const lineFragments = rawInputData.trim().split('\n');


// Initiate the primary processing loop, which is designed to handle multiple sets of input data
// until a specific termination condition is met.
while (true) {

    // Retrieve the very first line from the array of input fragments.
    // This line typically contains the grid dimension and the number of instructions.
    let dimensionAndHeightStr = lineFragments.shift();

    // Evaluate the extracted line to determine if it signals the end of input.
    if ( dimensionAndHeightStr === "0 0" ) {
        // If the termination sequence "0 0" is encountered, gracefully exit the processing loop.
        break;
    }

    // Split the current line by spaces and convert each resulting string segment into a numerical value.
    // This yields an array containing the grid size and the count of subsequent instructions.
    const dimHeightVals = dimensionAndHeightStr.split(' ').map(Number);

    // Deconstruct the numerical values into distinct, semantically meaningful constants.
    const gridDimension = dimHeightVals[0];    // Represents the 'N' value, defining the cube's side length.
    const numInstructions = dimHeightVals[1];  // Represents the 'H' value, the total number of operations to perform.

    // Instantiate an empty JavaScript object to serve as a hash map.
    // This map will store unique string keys representing the coordinates of 'occupied' cells
    // within the 3D grid, with a boolean 'true' value indicating their presence.
    const occupiedCellsMap = { };

    // Commence a loop that iterates through each instruction, for the total count specified by 'numInstructions'.
    for (let instructionIndex = 0; instructionIndex < numInstructions; ++instructionIndex) {

        // Extract the next instruction line from the input array,
        // split it by spaces to get its constituent parts.
        const currentInstructionParts = lineFragments.shift().split(' ');

        // Assign descriptive names to the components of the current instruction.
        const axisType = currentInstructionParts[0];                           // Specifies the plane ('xy', 'xz', or 'yz').
        const coordA = parseInt(currentInstructionParts[1], 10);              // The first fixed coordinate for the instruction.
        const coordB = parseInt(currentInstructionParts[2], 10);              // The second fixed coordinate for the instruction.

        // Based on the 'axisType', iterate and mark the relevant cells as occupied.
        if (axisType === "xy") {
            // When the instruction targets the 'xy' plane, the third coordinate (Z-axis) varies.
            for (let iterCoord = 1; iterCoord <= gridDimension; ++iterCoord) {
                // Construct a unique key for the cell (coordA, coordB, iterCoord) and mark it.
                occupiedCellsMap[`${coordA}_${coordB}_${iterCoord}`] = true;
            }
        } else if (axisType === "xz") {
            // For the 'xz' plane, the middle coordinate (Y-axis) is the one that varies.
            for (let iterCoord = 1; iterCoord <= gridDimension; ++iterCoord) {
                // Construct and mark the cell (coordA, iterCoord, coordB).
                occupiedCellsMap[`${coordA}_${iterCoord}_${coordB}`] = true;
            }
        } else if (axisType === "yz") {
            // In the case of the 'yz' plane, the first coordinate (X-axis) changes.
            for (let iterCoord = 1; iterCoord <= gridDimension; ++iterCoord) {
                // Construct and mark the cell (iterCoord, coordA, coordB).
                occupiedCellsMap[`${iterCoord}_${coordA}_${coordB}`] = true;
            }
        }
    }

    // Calculate the total volume of the grid (gridDimension cubed).
    // Then, subtract the number of uniquely occupied cells (derived from the map's keys).
    // Finally, output this result to the console, representing the count of unoccupied cells.
    console.log(
        (gridDimension * gridDimension * gridDimension) - Object.keys(occupiedCellsMap).length
    );
}