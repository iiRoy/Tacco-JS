let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input file
const lineCollection = (rawData.trim()).split("\n"); // Process raw input: trim whitespace and split into an array of lines

for (let idx = 0; idx < lineCollection.length; idx++) { // Iterate through each line in the collection
    // Check for the termination condition "0 0"
    if (lineCollection[idx] === "0 0") {
        break; // Exit the loop if the termination string is found
    }

    // Parse the current line: split by space and convert parts to numbers
    const numPair = lineCollection[idx].split(" ").map(Number);
    const totalCount = numPair[0]; // The first number represents N
    const stepSize = numPair[1]; // The second number represents m

    let positionMap = {}; // Initialize an object to represent the circular arrangement
    // Populate the position map with nulls, indicating empty slots
    for (let mapIdx = 0; mapIdx < totalCount; mapIdx++) {
        positionMap[mapIdx] = null;
    }

    let currentPos = 0; // Initialize the starting position for the placement process

    // Loop N times to place N items
    for (let itemIdx = 0; itemIdx < totalCount; itemIdx++) {
        let emptyCount = 0; // Counter for empty slots encountered

        // Do-while loop to find the m-th empty slot
        do {
            currentPos++; // Move to the next position in the circle
            // If current position exceeds totalCount, wrap around to the beginning
            if (currentPos === totalCount) {
                currentPos = 0;
            }
            // If the current position is empty, increment the empty slot counter
            if (positionMap[currentPos] === null) {
                emptyCount++;
            }
        } while (emptyCount !== stepSize); // Continue until 'm' empty slots have been passed

        // Place the current item (itemIdx) at the found position (currentPos)
        positionMap[currentPos] = itemIdx;
    }

    // Output the final position after all items have been placed
    console.log(currentPos);
}
