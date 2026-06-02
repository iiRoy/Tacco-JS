function ProcessInput(rawData) {
    // Process the raw input string: trim, split by newlines, then split each line by spaces.
    rawData = rawData.trim().split("\n").map(function(item) { return item.split(" "); });

    // Extract the number of entries from the first line of input.
    let numEntries = parseInt(rawData[0][0], 10);

    // Initialize an array to store parsed coordinate and direction data.
    let coordDirList = [];

    // Populate the coordDirList array with X, Y coordinates (as integers) and direction (as string).
    for (let idx = 0; idx < numEntries; idx++) {
        coordDirList.push([
            parseInt(rawData[idx + 1][0], 10),
            parseInt(rawData[idx + 1][1], 10),
            rawData[idx + 1][2]
        ]);
    }

    // Sort the list based on the sum of X and Y coordinates, then by X coordinate.
    coordDirList.sort(function(elemA, elemB) {
        const sumA = elemA[0] + elemA[1];
        const sumB = elemB[0] + elemB[1];
        if (sumA < sumB) return -1;
        if (sumA > sumB) return 1;
        // If sums are equal, sort by X coordinate
        if (elemA[0] < elemB[0]) return -1;
        if (elemA[0] > elemB[0]) return 1;
        return 0;
    });

    // Initialize variables for collision detection along the X+Y = constant diagonal.
    let currentGroupVal = -1; // Stores the sum (X+Y) for the current group of points.
    let lastCoordVal;         // Stores the X coordinate of the last relevant point.
    let minCollisionTime = Infinity; // Stores the minimum collision time found so far.
    let lastDirection = 'U';  // Stores the direction of the last relevant point ('U' or 'R').

    // First pass: Check for collisions on X+Y = constant diagonals (moving 'U' and 'R').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentSum = coordDirList[idx][0] + coordDirList[idx][1];
        const currentX = coordDirList[idx][0];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentSum) {
            // We are in the same diagonal group.
            if (lastDirection === 'R') {
                // If the previous relevant point was moving 'R', check for collision with 'U'.
                if (currentDir === 'U') {
                    lastDirection = 'U'; // Update the last direction to 'U'
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentX - lastCoordVal) * 10);
                } else if (currentDir === 'R') {
                    // If current is also 'R', update lastCoordVal.
                    lastCoordVal = currentX;
                }
            } else {
                // If the previous relevant point was moving 'U', and current is 'R', update state.
                if (currentDir === 'R') {
                    lastDirection = 'R';
                    lastCoordVal = currentX;
                }
            }
        } else {
            // New diagonal group. Reset state.
            currentGroupVal = currentSum;
            if (currentDir === 'R') {
                lastDirection = 'R';
                lastCoordVal = currentX;
            } else {
                lastDirection = 'U';
            }
        }
    }

    // Reset variables for the next pass.
    currentGroupVal = -1;
    lastDirection = 'L'; // Now checking for 'L' and 'D' directions.

    // Second pass: Check for collisions on X+Y = constant diagonals (moving 'L' and 'D').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentSum = coordDirList[idx][0] + coordDirList[idx][1];
        const currentX = coordDirList[idx][0];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentSum) {
            if (lastDirection === 'D') {
                if (currentDir === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentX - lastCoordVal) * 10);
                } else if (currentDir === 'D') {
                    lastCoordVal = currentX;
                }
            } else {
                if (currentDir === 'D') {
                    lastDirection = 'D';
                    lastCoordVal = currentX;
                }
            }
        } else {
            currentGroupVal = currentSum;
            if (currentDir === 'D') {
                lastDirection = 'D';
                lastCoordVal = currentX;
            } else {
                lastDirection = 'L';
            }
        }
    }

    // Sort the list based on the difference of Y and X coordinates, then by X coordinate.
    coordDirList.sort(function(elemA, elemB) {
        const diffA = elemA[1] - elemA[0];
        const diffB = elemB[1] - elemB[0];
        if (diffA < diffB) return -1;
        if (diffA > diffB) return 1;
        // If differences are equal, sort by X coordinate
        if (elemA[0] < elemB[0]) return -1;
        if (elemA[0] > elemB[0]) return 1;
        return 0;
    });

    // Reset variables for the next pass.
    currentGroupVal = Infinity; // Using Infinity as initial value for difference comparison.
    lastDirection = 'D'; // Now checking for 'D' and 'R' directions.

    // Third pass: Check for collisions on Y-X = constant diagonals (moving 'D' and 'R').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentDiff = coordDirList[idx][1] - coordDirList[idx][0];
        const currentX = coordDirList[idx][0];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentDiff) {
            if (lastDirection === 'R') {
                if (currentDir === 'D') {
                    lastDirection = 'D';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentX - lastCoordVal) * 10);
                } else if (currentDir === 'R') {
                    lastCoordVal = currentX;
                }
            } else {
                if (currentDir === 'R') {
                    lastDirection = 'R';
                    lastCoordVal = currentX;
                }
            }
        } else {
            currentGroupVal = currentDiff;
            if (currentDir === 'R') {
                lastDirection = 'R';
                lastCoordVal = currentX;
            } else {
                lastDirection = 'D';
            }
        }
    }

    // Reset variables for the next pass.
    currentGroupVal = Infinity;
    lastDirection = 'L'; // Now checking for 'L' and 'U' directions.

    // Fourth pass: Check for collisions on Y-X = constant diagonals (moving 'L' and 'U').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentDiff = coordDirList[idx][1] - coordDirList[idx][0];
        const currentX = coordDirList[idx][0];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentDiff) {
            if (lastDirection === 'U') {
                if (currentDir === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentX - lastCoordVal) * 10);
                } else if (currentDir === 'U') {
                    lastCoordVal = currentX;
                }
            } else {
                if (currentDir === 'U') {
                    lastDirection = 'U';
                    lastCoordVal = currentX;
                }
            }
        } else {
            currentGroupVal = currentDiff;
            if (currentDir === 'U') {
                lastDirection = 'U';
                lastCoordVal = currentX;
            } else {
                lastDirection = 'L';
            }
        }
    }

    // Sort the list based on X coordinate, then by Y coordinate.
    coordDirList.sort(function(elemA, elemB) {
        if (elemA[0] < elemB[0]) return -1;
        if (elemA[0] > elemB[0]) return 1;
        // If X coordinates are equal, sort by Y coordinate
        if (elemA[1] < elemB[1]) return -1;
        if (elemA[1] > elemB[1]) return 1;
        return 0;
    });

    // Reset variables for the next pass.
    currentGroupVal = -1; // Stores the X coordinate for the current group.
    lastDirection = 'D'; // Now checking for 'D' and 'U' directions.

    // Fifth pass: Check for collisions on X = constant vertical lines (moving 'D' and 'U').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentX = coordDirList[idx][0];
        const currentY = coordDirList[idx][1];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentX) {
            if (lastDirection === 'U') {
                if (currentDir === 'D') {
                    lastDirection = 'D';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentY - lastCoordVal) * 5);
                } else if (currentDir === 'U') {
                    lastCoordVal = currentY;
                }
            } else {
                if (currentDir === 'U') {
                    lastDirection = 'U';
                    lastCoordVal = currentY;
                }
            }
        } else {
            currentGroupVal = currentX;
            if (currentDir === 'U') {
                lastDirection = 'U';
                lastCoordVal = currentY;
            } else {
                lastDirection = 'D';
            }
        }
    }

    // Sort the list based on Y coordinate, then by X coordinate.
    coordDirList.sort(function(elemA, elemB) {
        if (elemA[1] < elemB[1]) return -1;
        if (elemA[1] > elemB[1]) return 1;
        // If Y coordinates are equal, sort by X coordinate
        if (elemA[0] < elemB[0]) return -1;
        if (elemA[0] > elemB[0]) return 1;
        return 0;
    });

    // Reset variables for the next pass.
    currentGroupVal = -1; // Stores the Y coordinate for the current group.
    lastDirection = 'L'; // Now checking for 'L' and 'R' directions.

    // Sixth pass: Check for collisions on Y = constant horizontal lines (moving 'L' and 'R').
    for (let idx = 0; idx < coordDirList.length; idx++) {
        const currentY = coordDirList[idx][1];
        const currentX = coordDirList[idx][0];
        const currentDir = coordDirList[idx][2];

        if (currentGroupVal === currentY) {
            if (lastDirection === 'R') {
                if (currentDir === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(currentX - lastCoordVal) * 5);
                } else if (currentDir === 'R') {
                    lastCoordVal = currentX;
                }
            } else {
                if (currentDir === 'R') {
                    lastDirection = 'R';
                    lastCoordVal = currentX;
                }
                // No else needed, if currentDir is 'L' and lastDirection is 'L', nothing happens.
            }
        } else {
            currentGroupVal = currentY; // Update the group value to the current Y coordinate.
            if (currentDir === 'R') {
                lastDirection = 'R';
                lastCoordVal = currentX;
            } else {
                lastDirection = 'L';
            }
        }
    }

    // Determine the final result. If no collisions were found, it's "SAFE".
    const finalResult = minCollisionTime === Infinity ? "SAFE" : minCollisionTime;
    console.log(finalResult);
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
