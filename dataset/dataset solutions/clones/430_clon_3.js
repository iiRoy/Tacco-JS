const FILE_INPUT_PATH = '/dev/stdin'; // Standard input file path.
const EMPTY_SLLOT = 0;              // Represents an empty space in the grid.
const SENTINEL_VALUE = "X";         // Boundary markers for the grid.
const OUTPUT_EMPTY_CHAR = "#";      // Character to represent empty slots in the final output.

// Helper function to locate the first empty slot from the left in a given grid.
// Returns the index of the first empty slot, or -1 if none is found (excluding sentinels).
const findFirstAvailableSlot = (gridStructure) => {
    // Iterate from the first actual data slot (index 1, after the left sentinel)
    // up to the last actual data slot (before the right sentinel).
    for (let currentIdx = 1; currentIdx < gridStructure.length - 1; currentIdx++) {
        if (gridStructure[currentIdx] === EMPTY_SLLOT) {
            return currentIdx;
        }
    }
    return -1; // Indicate no empty slot was found.
};

// Initialize file system module for reading input.
const systemIO = require('fs');

// Read the entire input content, trim whitespace, and split into lines.
let inputLineBuffer = systemIO.readFileSync(FILE_INPUT_PATH, 'utf8').trim().split("\n");

// Main loop to process multiple test cases, each defined by a pair of (N, M) values.
// The loop continues until a termination signal (N=0, M=0) is encountered.
while (true) {
    // Extract the next line containing grid dimensions.
    const dimensionsLine = inputLineBuffer.shift();

    // Guard clause: if no more lines, gracefully exit the processing loop.
    if (!dimensionsLine) {
        break;
    }

    // Parse the grid dimensions (numRows, numOperations) from the current line.
    const dimensionsArray = dimensionsLine.split(" ").map(Number);
    const numRows = dimensionsArray[0];         // Corresponds to 'n' in original code.
    const numOperations = dimensionsArray[1];   // Corresponds to 'm' in original code.

    // Termination condition: if both N and M are zero, end the program.
    if (numRows === 0 && numOperations === 0) {
        break;
    }

    // Initialize the grid for the current test case.
    // The grid includes two sentinel values ("X") at its boundaries to simplify boundary checks.
    // The core part of the grid is filled with EMPTY_SLLOT (0).
    let processingGrid = Array(numRows + 2).fill(EMPTY_SLLOT);
    processingGrid[0] = SENTINEL_VALUE;          // Left sentinel.
    processingGrid[numRows + 1] = SENTINEL_VALUE; // Right sentinel.

    // Process each operation for the current grid configuration.
    for (let opCounter = 0; opCounter < numOperations; opCounter++) {
        const operationType = inputLineBuffer.shift(); // Get the current operation character.

        // Guard clause: ensure an operation type was successfully read.
        if (!operationType) {
            // This case might indicate malformed input (e.g., M operations expected but not enough lines).
            // For robustness, one might log an error or handle it more explicitly.
            break;
        }

        // Use a switch statement for clearer handling of different operation types.
        switch (operationType) {
            case "A":
                // Operation 'A': Place 'A' in the first available (empty) slot from the left.
                const targetSlotForA = findFirstAvailableSlot(processingGrid);
                if (targetSlotForA !== -1) {
                    processingGrid[targetSlotForA] = "A";
                }
                break;

            case "B":
                // Operation 'B': Attempt to place 'B' from the right, but only if its immediate neighbors are not 'A'.
                // If this special condition cannot be met, fallback to placing 'B' in the first available slot from the left.
                let bPlacementSuccessful = false;
                // Iterate from the rightmost actual slot towards the left.
                for (let currentIdx = processingGrid.length - 2; currentIdx >= 1; currentIdx--) {
                    // Check if the current slot is empty AND its left and right neighbors are NOT 'A'.
                    if (processingGrid[currentIdx] === EMPTY_SLLOT &&
                        processingGrid[currentIdx - 1] !== "A" &&
                        processingGrid[currentIdx + 1] !== "A") {
                        processingGrid[currentIdx] = "B";
                        bPlacementSuccessful = true;
                        break; // Placement successful, exit this loop.
                    }
                }
                // Fallback if the special condition for 'B' placement was not met.
                if (!bPlacementSuccessful) {
                    const targetSlotForB = findFirstAvailableSlot(processingGrid);
                    if (targetSlotForB !== -1) {
                        processingGrid[targetSlotForB] = "B";
                    }
                }
                break;

            case "C":
                // Operation 'C': Attempt to place 'C' adjacent to an already occupied slot.
                // Prioritize placing to the right, then to the left.
                // If no such adjacent empty slot exists, place 'C' near the center of the grid.
                let cPlacementSuccessful = false;
                // Iterate through the grid to find an occupied slot with an empty neighbor.
                for (let currentIdx = 1; currentIdx <= numRows; currentIdx++) {
                    if (processingGrid[currentIdx] !== EMPTY_SLLOT) { // Found an occupied slot.
                        // Try placing 'C' to the right of the occupied slot.
                        if (currentIdx + 1 <= numRows && processingGrid[currentIdx + 1] === EMPTY_SLLOT) {
                            processingGrid[currentIdx + 1] = "C";
                            cPlacementSuccessful = true;
                            break;
                        }
                        // If right is not available, try placing 'C' to the left.
                        else if (currentIdx - 1 >= 1 && processingGrid[currentIdx - 1] === EMPTY_SLLOT) {
                            processingGrid[currentIdx - 1] = "C";
                            cPlacementSuccessful = true;
                            break;
                        }
                    }
                }
                // Fallback: if no adjacent placement was possible, place 'C' near the center.
                if (!cPlacementSuccessful) {
                    // Calculate the target middle index, adjusted for 1-based indexing and sentinels.
                    // The original code uses (n-1)/2+1 for odd n, and n/2+1 for even n.
                    // This can be simplified to Math.floor(n/2) + 1 for the 1-indexed actual content.
                    const middleTargetIndex = Math.floor(numRows / 2) + 1;
                    if (middleTargetIndex >= 1 && middleTargetIndex <= numRows && processingGrid[middleTargetIndex] === EMPTY_SLLOT) {
                        processingGrid[middleTargetIndex] = "C";
                    } else {
                        // Further fallback if the calculated middle slot is occupied, place at first available.
                        const targetSlotForC = findFirstAvailableSlot(processingGrid);
                        if (targetSlotForC !== -1) {
                            processingGrid[targetSlotForC] = "C";
                        }
                    }
                }
                break;

            case "D":
                // Operation 'D': Place 'D' in the empty slot that is the "center" of the longest
                // contiguous path of empty slots, considering obstacles and sentinels.
                // The "center" is the 'i' that yields the maximum expansion radius.
                // If multiple such 'i' exist, the first one encountered (leftmost) is chosen.
                // If no suitable expansion path (or no empty slots), fallback to first available.

                let bestPlacementCandidate = {
                    index: -1,      // The starting index 'i' that gives the max expansion.
                    radius: -1      // The maximum expansion radius found.
                };

                // Iterate through each potential empty slot as a center for 'D'.
                for (let currentScanIndex = 1; currentScanIndex <= numRows; currentScanIndex++) {
                    // Only consider empty slots as starting points.
                    if (processingGrid[currentScanIndex] !== EMPTY_SLLOT) {
                        continue;
                    }

                    let leftExpansionPointer = currentScanIndex;
                    let rightExpansionPointer = currentScanIndex;
                    let currentExpansionRadius = 0; // Counts how many steps outwards we can go.

                    // Expand outwards from currentScanIndex to determine the radius.
                    while (true) {
                        // Attempt to move the left pointer.
                        // It moves one step left if not already at the left sentinel.
                        if (processingGrid[leftExpansionPointer] !== SENTINEL_VALUE) {
                            leftExpansionPointer--;
                        }
                        // Attempt to move the right pointer.
                        // It moves one step right if not already at the right sentinel.
                        if (processingGrid[rightExpansionPointer] !== SENTINEL_VALUE) {
                            rightExpansionPointer++;
                        }

                        // Check for termination conditions after attempting to move pointers.
                        // Condition 1: Both pointers have reached the sentinels. Maximum path found.
                        if (processingGrid[leftExpansionPointer] === SENTINEL_VALUE &&
                            processingGrid[rightExpansionPointer] === SENTINEL_VALUE) {
                            break;
                        }
                        // Condition 2: Either pointer has hit an occupied slot (not sentinel, not empty). Path blocked.
                        if ((processingGrid[leftExpansionPointer] !== SENTINEL_VALUE && processingGrid[leftExpansionPointer] !== EMPTY_SLLOT) ||
                            (processingGrid[rightExpansionPointer] !== SENTINEL_VALUE && processingGrid[rightExpansionPointer] !== EMPTY_SLLOT)) {
                            break;
                        }

                        // If neither termination condition was met, it means we successfully expanded one step.
                        currentExpansionRadius++;

                        // Update the best placement candidate if the current expansion is greater.
                        if (currentExpansionRadius > bestPlacementCandidate.radius) {
                            bestPlacementCandidate.radius = currentExpansionRadius;
                            bestPlacementCandidate.index = currentScanIndex; // Store the initial 'i' that yielded this radius.
                        }
                    }
                }

                // Place 'D' based on the best candidate found.
                if (bestPlacementCandidate.index !== -1 && bestPlacementCandidate.radius > 0) {
                    processingGrid[bestPlacementCandidate.index] = "D";
                } else {
                    // Fallback: If no suitable gap was found (e.g., all slots occupied or no valid expansion),
                    // place 'D' at the first available slot from the left.
                    const targetSlotForD = findFirstAvailableSlot(processingGrid);
                    if (targetSlotForD !== -1) {
                        processingGrid[targetSlotForD] = "D";
                    }
                }
                break; // End of case "D"
        } // End of switch(operationType)
    } // End of operations loop

    // Prepare the final output string for the current grid state.
    // First, remove the sentinel values from the grid.
    // Using slice() creates a new array without modifying the original, which is cleaner than shift/pop.
    const contentWithoutSentinels = processingGrid.slice(1, processingGrid.length - 1);

    // Transform the array: replace all remaining empty slots (0) with the output symbol (#),
    // then join all elements into a single string.
    const finalGridRepresentation = contentWithoutSentinels
        .map(slotItem => slotItem === EMPTY_SLLOT ? OUTPUT_EMPTY_CHAR : slotItem)
        .join("");

    // Print the result for the current test case.
    console.log(finalGridRepresentation);
} // End of main test case processing loop