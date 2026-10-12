let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawData.trim().split("\n");

// Main processing loop for multiple test cases.
// Continues until a specific termination condition is met.
while (true) {
    // Extract the first line, split by space, and convert parts to numbers.
    let dimensions = lineSegments.shift().split(" ").map(Number);
    let rows = dimensions[0]; // Represents the number of available slots in the grid.
    let operationsCount = dimensions[1]; // Total number of operations to perform for this test case.

    // If both dimensions are zero, it signifies the end of input.
    if (rows === 0 && operationsCount === 0) {
        break; // Terminate the program.
    }

    // Initialize the grid layout with '0's, representing empty spots.
    let gridLayout = [];
    for (let idx = 0; idx < rows; idx++) {
        gridLayout.push(0);
    }

    // Add boundary markers 'X' to both ends of the grid.
    // These markers help in boundary checks during placement operations.
    gridLayout.unshift("X");
    gridLayout.push("X");

    // Process each operation based on the input for the current test case.
    for (let opIdx = 0; opIdx < operationsCount; opIdx++) {
        let currentOperation = lineSegments.shift(); // Get the next operation type.

        // Operation 'A': Place 'A' in the first available spot from the left.
        if (currentOperation === "A") {
            for (let pos = 1; pos < gridLayout.length - 1; pos++) {
                if (gridLayout[pos] === 0) { // If the current spot is empty.
                    gridLayout[pos] = "A"; // Place 'A'.
                    break; // Stop after placing the item.
                }
            }
        }

        // Operation 'B': Place 'B' in an available spot from the right,
        // ensuring it's not adjacent to an 'A'. If no such spot,
        // place 'B' in the first available spot from the left.
        if (currentOperation === "B") {
            let foundSpot = false;
            for (let pos = gridLayout.length - 2; pos >= 1; pos--) {
                // Check if the current spot is empty and not next to an 'A'.
                if (gridLayout[pos - 1] !== "A" && gridLayout[pos] === 0 && gridLayout[pos + 1] !== "A") {
                    gridLayout[pos] = "B"; // Place 'B'.
                    foundSpot = true;
                    break; // Stop after placing.
                }
            }
            // If a suitable spot was found according to the special rule, move to the next operation.
            if (foundSpot) {
                continue;
            }
            // Fallback: If no special spot found, place 'B' in the first available spot from the left.
            for (let pos = 1; pos < gridLayout.length - 1; pos++) {
                if (gridLayout[pos] === 0) {
                    gridLayout[pos] = "B"; // Place 'B'.
                    break; // Stop after placing.
                }
            }
        }

        // Operation 'C': Place 'C' adjacent to an existing item if possible.
        // Otherwise, place 'C' in a central position of the grid.
        if (currentOperation === "C") {
            let foundSpot = false;
            for (let pos = 1; pos < gridLayout.length - 1; pos++) {
                if (gridLayout[pos] !== 0) { // If the current spot is occupied.
                    if (gridLayout[pos + 1] === 0) { // Check the right neighbor.
                        gridLayout[pos + 1] = "C"; // Place 'C'.
                        foundSpot = true;
                        break;
                    } else if (gridLayout[pos - 1] === 0) { // Check the left neighbor.
                        gridLayout[pos - 1] = "C"; // Place 'C'.
                        foundSpot = true;
                        break;
                    }
                }
            }
            // If an adjacent spot was found, move to the next operation.
            if (foundSpot) {
                continue;
            }
            // Fallback: Place 'C' in a central position if no adjacent spot was found.
            // Handles both odd and even 'rows' counts to find the appropriate middle index.
            if (rows % 2 === 1) {
                gridLayout[Math.floor((rows - 1) / 2) + 1] = "C"; // Middle for odd number of rows.
            } else {
                gridLayout[rows / 2 + 1] = "C"; // Right of center for even number of rows.
            }
        }

        // Operation 'D': Find the largest empty contiguous block and place 'D' in its center.
        // If no such block, place 'D' in the first available spot from the left.
        if (currentOperation === "D") {
            // bestPlacement stores [index_to_place_D, max_gap_length_found]
            let bestPlacement = [0, 0];
            for (let currentPos = 1; currentPos < gridLayout.length - 1; currentPos++) {
                if (gridLayout[currentPos] !== 0) {
                    continue; // Skip occupied spots.
                }

                let leftSearch = currentPos;
                let rightSearch = currentPos;
                let currentGapLength = 0;

                // Expand outwards from currentPos to find the boundaries of the empty block.
                while (true) {
                    if (gridLayout[leftSearch] !== "X") {
                        leftSearch--;
                    }
                    if (gridLayout[rightSearch] !== "X") {
                        rightSearch++;
                    }

                    // If both search pointers hit 'X' boundaries, we've reached the grid ends.
                    if (gridLayout[leftSearch] === "X" && gridLayout[rightSearch] === "X") {
                        break;
                    }
                    // If left boundary is not 'X' but occupied by an item, stop expanding left.
                    if (gridLayout[leftSearch] !== "X" && gridLayout[leftSearch] !== 0) {
                        break;
                    }
                    // If right boundary is not 'X' but occupied by an item, stop expanding right.
                    if (gridLayout[rightSearch] !== "X" && gridLayout[rightSearch] !== 0) {
                        break;
                    }

                    currentGapLength++; // Increment gap length for this potential placement.
                    // Update bestPlacement if the current gap is larger than previously found.
                    if (bestPlacement[1] < currentGapLength) {
                        bestPlacement = [currentPos, currentGapLength];
                    }
                }
            }

            // If a suitable central placement was found (max_gap_length > 0).
            if (bestPlacement[0] !== 0 && bestPlacement[1] !== 0) {
                gridLayout[bestPlacement[0]] = "D"; // Place 'D' at the calculated center.
            } else {
                // Fallback: If no large gap found, place 'D' in the first available spot from the left.
                for (let currentPos = 1; currentPos < gridLayout.length - 1; currentPos++) {
                    if (gridLayout[currentPos] === 0) {
                        gridLayout[currentPos] = "D"; // Place 'D'.
                        break;
                    }
                }
            }
        }
    } // End of operations loop.

    // Remove the temporary boundary markers 'X' before final output.
    gridLayout.shift();
    gridLayout.pop();

    // Convert the grid array to a single string, replacing '0's with '#' for display.
    let resultString = gridLayout.join("").replace(/0/g, "#");
    // Print the final result for the current test case.
    console.log(resultString);
} // End of main processing loop.
