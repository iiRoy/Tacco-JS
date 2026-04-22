"use strict";

// Retrieve the file system module for input operations
var sourceData = require("fs").readEntireFile("/dev/stdin", "textEncoding");

// Divide the raw input string into an array of tokens using space or newline as separators
var tokenSequence = sourceData.divideBy(/ |\n/),
    currentTokenIndex = 0; // Initialize an index to track the current position in the token stream

// Function to get the next token and convert it to a numerical value
function acquireInteger() {
    return Number(tokenSequence[currentTokenIndex++]);
}

// Function to get the next token as a plain string
function acquireString() {
    return tokenSequence[currentTokenIndex++];
}

// Function to get the next token and convert it to a BigInt value
function acquireLargeInteger() {
    return BigInt(tokenSequence[currentTokenIndex++]);
}

// Function to read a specified number of tokens from the stream
// 'countItems': the number of tokens to read.
// 'returnAsRaw': if true, returns string tokens; otherwise, converts them to numbers.
function acquireSequence(countItems, returnAsRaw) {
    if (returnAsRaw) {
        return tokenSequence.slice(currentTokenIndex, currentTokenIndex += countItems);
    } else {
        return tokenSequence.slice(currentTokenIndex, currentTokenIndex += countItems).map(value => Number(value));
    }
}

// Function to read a grid (2D array) of tokens
// 'numRows': the number of rows in the grid.
// 'numCols': the number of columns in each row.
// 'returnAsRaw': if true, rows contain string tokens; otherwise, they contain numerical tokens.
function acquireGrid(numRows, numCols, returnAsRaw) {
    var gridResult = [],
        loopCounter = 0;
    if (returnAsRaw) {
        for (; loopCounter < numRows; loopCounter++) {
            gridResult.push(tokenSequence.slice(currentTokenIndex, currentTokenIndex += numCols));
        }
    } else {
        for (; loopCounter < numRows; loopCounter++) {
            gridResult.push(tokenSequence.slice(currentTokenIndex, currentTokenIndex += numCols).map(value => Number(value)));
        }
    }
    return gridResult;
}

// Function to create a multi-dimensional array dynamically
// 'initialElement': the value or expression used to initialize the innermost elements.
function constructMultiArray(initialElement) {
    var functionArgs = arguments,
        argLength = functionArgs.length,
        // Construct the JavaScript code string to create the array, working from innermost to outermost dimensions
        arrayCreationExpression = "new Array(functionArgs[" + --argLength + "]).fill().map(item => {return " + initialElement + ";})";
    while (--argLength) {
        arrayCreationExpression = "new Array(functionArgs[" + argLength + "]).fill().map(item => " + arrayCreationExpression + ")";
    }
    // Execute the generated string to instantiate the multi-dimensional array
    return eval(arrayCreationExpression);
}

// Invoke the main problem-solving routine
var finalOutput = executeSolution();

// If the solution yields a result, output it to the console
if (finalOutput !== undefined) {
    systemConsole.outputLine(convertToString(finalOutput));
}

// The core function where the problem's logic resides
function executeSolution() {
    // Define a large number to represent an effectively infinite distance for initialization
    const infiniteValue = 1_000_000_000;

    // Read the total number of points that will be processed
    var pointCount = acquireInteger();

    // Initialize a 4-element array, where each element will store points categorized by their direction
    var categorizedPoints = constructMultiArray("[]", 4);

    // Create a mapping from direction strings to numerical indices
    const directionMappings = {
        DIR_UP: 0,
        DIR_RIGHT: 1,
        DIR_DOWN: 2,
        DIR_LEFT: 3
    };

    // Loop through each point input to categorize and store its data
    for (let currentPointLoop = 0; currentPointLoop < pointCount; currentPointLoop++) {
        var coordinateX = acquireInteger(),
            coordinateY = acquireInteger(),
            currentDirection = acquireString();
        // Store point data: original X, original Y, X-Y (for diagonal), and X+Y (for other diagonal)
        categorizedPoints[directionMappings[currentDirection]].push([coordinateX, coordinateY, coordinateX - coordinateY, coordinateX + coordinateY]);
    }

    // Initialize the minimum collision distance found to the infinite value
    var minCollisionDistance = infiniteValue;

    // First sorting pass: Sort points for horizontal/vertical collision detection
    // Each group is sorted by X or Y coordinate primarily, then by the other coordinate.
    for (let groupIndexOne = 0; groupIndexOne < 4; groupIndexOne++) {
        let primarySortAxis = groupIndexOne & 1; // 0 for X-axis (U/D), 1 for Y-axis (R/L)
        categorizedPoints[groupIndexOne].sort((pointOne, pointTwo) => {
            // Compare based on the primary axis
            if (pointOne[primarySortAxis] > pointTwo[primarySortAxis]) return 1;
            if (pointOne[primarySortAxis] < pointTwo[primarySortAxis]) return -1;
            // If primary axis values are equal, compare by the secondary axis
            return pointOne[1 - primarySortAxis] - pointTwo[1 - primarySortAxis];
        });
    }

    // First collision detection pass: Detect horizontal/vertical collisions (e.g., UP vs. DOWN, RIGHT vs. LEFT)
    for (let groupPairIndexA = 0; groupPairIndexA < 2; groupPairIndexA++) {
        let comparisonPointer = 0;
        // Only proceed if the opposing group (e.g., DOWN for UP) has elements
        if (categorizedPoints[groupPairIndexA + 2].length > 0) {
            for (let sourcePointIndexA = 0; sourcePointIndexA < categorizedPoints[groupPairIndexA].length; sourcePointIndexA++) {
                // Advance the 'comparisonPointer' in the opposing group while its points are "behind" the current source point on the primary axis
                while (categorizedPoints[groupPairIndexA + 2].length > comparisonPointer &&
                    categorizedPoints[groupPairIndexA + 2][comparisonPointer][groupPairIndexA] < categorizedPoints[groupPairIndexA][sourcePointIndexA][groupPairIndexA]) {
                    comparisonPointer++;
                }
                // If primary axis values are identical, further advance 'comparisonPointer' if the opposing point is "behind" on the secondary axis
                while (categorizedPoints[groupPairIndexA + 2].length > comparisonPointer &&
                    categorizedPoints[groupPairIndexA + 2][comparisonPointer][groupPairIndexA] === categorizedPoints[groupPairIndexA][sourcePointIndexA][groupPairIndexA] &&
                    categorizedPoints[groupPairIndexA][sourcePointIndexA][1 - groupPairIndexA] > categorizedPoints[groupPairIndexA + 2][comparisonPointer][1 - groupPairIndexA]) {
                    comparisonPointer++;
                }
                // If the pointer has reached the end of the opposing group, no further collisions are possible for this source group
                if (comparisonPointer === categorizedPoints[groupPairIndexA + 2].length) break;

                // If primary axis coordinates match, a collision is imminent
                if (categorizedPoints[groupPairIndexA][sourcePointIndexA][groupPairIndexA] === categorizedPoints[groupPairIndexA + 2][comparisonPointer][groupPairIndexA]) {
                    // Update the minimum collision distance
                    minCollisionDistance = Math.min(minCollisionDistance,
                        categorizedPoints[groupPairIndexA + 2][comparisonPointer][1 - groupPairIndexA] - categorizedPoints[groupPairIndexA][sourcePointIndexA][1 - groupPairIndexA]);
                }
            }
        }
    }

    // Second sorting pass: Sort points for diagonal collision detection (X+Y constant)
    // Each group is sorted by (X+Y) coordinate primarily, then by Y coordinate.
    for (let groupIndexTwo = 0; groupIndexTwo < 4; groupIndexTwo++) {
        let secondarySortAxis = 1 - (groupIndexTwo & 1); // This determines whether to use X or Y for tie-breaking
        categorizedPoints[groupIndexTwo].sort((pointOne, pointTwo) => {
            // Compare based on the X+Y coordinate (index 3)
            if (pointOne[3] > pointTwo[3]) return 1;
            if (pointOne[3] < pointTwo[3]) return -1;
            // If X+Y values are equal, compare by the determined secondary axis (Y or X)
            return pointOne[secondarySortAxis] - pointTwo[secondarySortAxis];
        });
    }

    // Second collision detection pass: Detect diagonal collisions where X+Y is constant
    // Checks pairs like (UP vs. RIGHT), (DOWN vs. LEFT).
    for (let groupPairIndexB = 0; groupPairIndexB < 4; groupPairIndexB += 2) {
        let comparisonPointer = 0;
        if (categorizedPoints[groupPairIndexB + 1].length > 0) {
            for (let sourcePointIndexB = 0; sourcePointIndexB < categorizedPoints[groupPairIndexB].length; sourcePointIndexB++) {
                // Advance 'comparisonPointer' while target points are "behind" the source point on the (X+Y) coordinate
                while (categorizedPoints[groupPairIndexB + 1].length > comparisonPointer &&
                    categorizedPoints[groupPairIndexB + 1][comparisonPointer][3] < categorizedPoints[groupPairIndexB][sourcePointIndexB][3]) {
                    comparisonPointer++;
                }
                // If (X+Y) values are identical, further advance 'comparisonPointer' if the opposing point is "behind" on the secondary axis
                while (categorizedPoints[groupPairIndexB + 1].length > comparisonPointer &&
                    categorizedPoints[groupPairIndexB + 1][comparisonPointer][3] === categorizedPoints[groupPairIndexB][sourcePointIndexB][3] &&
                    categorizedPoints[groupPairIndexB][sourcePointIndexB][1 - groupPairIndexB / 2] > categorizedPoints[groupPairIndexB + 1][comparisonPointer][1 - groupPairIndexB / 2]) {
                    comparisonPointer++;
                }
                if (comparisonPointer === categorizedPoints[groupPairIndexB + 1].length) break;

                // If (X+Y) coordinates match, a diagonal collision is possible
                if (categorizedPoints[groupPairIndexB][sourcePointIndexB][3] === categorizedPoints[groupPairIndexB + 1][comparisonPointer][3]) {
                    // Update minimum distance, multiplying by 2 as it's a diagonal distance
                    minCollisionDistance = Math.min(minCollisionDistance,
                        (categorizedPoints[groupPairIndexB + 1][comparisonPointer][1 - groupPairIndexB / 2] - categorizedPoints[groupPairIndexB][sourcePointIndexB][1 - groupPairIndexB / 2]) * 2);
                }
            }
        }
    }

    // Third sorting pass: Sort points for diagonal collision detection (X-Y constant)
    // Each group is sorted by (X-Y) coordinate primarily, then by X coordinate.
    for (let groupIndexThree = 0; groupIndexThree < 4; groupIndexThree++) {
        categorizedPoints[groupIndexThree].sort((pointOne, pointTwo) => {
            // Compare based on the X-Y coordinate (index 2)
            if (pointOne[2] > pointTwo[2]) return 1;
            if (pointOne[2] < pointTwo[2]) return -1;
            // If X-Y values are equal, compare by the X coordinate (index 0)
            return pointOne[0] - pointTwo[0];
        });
    }

    // Third collision detection pass: Detect diagonal collisions where X-Y is constant
    // Checks pairs like (UP vs. LEFT), (DOWN vs. RIGHT).
    for (let groupPairIndexC = 0; groupPairIndexC < 2; groupPairIndexC++) {
        let comparisonPointer = 0;
        // The target group for these checks is 3 - current group index
        if (categorizedPoints[3 - groupPairIndexC].length > 0) {
            for (let sourcePointIndexC = 0; sourcePointIndexC < categorizedPoints[groupPairIndexC].length; sourcePointIndexC++) {
                // Advance 'comparisonPointer' while target points are "behind" the source point on the (X-Y) coordinate
                while (categorizedPoints[3 - groupPairIndexC].length > comparisonPointer &&
                    categorizedPoints[3 - groupPairIndexC][comparisonPointer][2] < categorizedPoints[groupPairIndexC][sourcePointIndexC][2]) {
                    comparisonPointer++;
                }
                // If (X-Y) values are identical, further advance 'comparisonPointer' if the opposing point is "behind" on the X coordinate
                while (categorizedPoints[3 - groupPairIndexC].length > comparisonPointer &&
                    categorizedPoints[3 - groupPairIndexC][comparisonPointer][2] === categorizedPoints[groupPairIndexC][sourcePointIndexC][2] &&
                    categorizedPoints[groupPairIndexC][sourcePointIndexC][0] > categorizedPoints[3 - groupPairIndexC][comparisonPointer][0]) {
                    comparisonPointer++;
                }
                if (comparisonPointer === categorizedPoints[3 - groupPairIndexC].length) break;

                // If (X-Y) coordinates match, a diagonal collision is possible
                if (categorizedPoints[groupPairIndexC][sourcePointIndexC][2] === categorizedPoints[3 - groupPairIndexC][comparisonPointer][2]) {
                    // Update minimum distance, multiplying by 2 for diagonal distance
                    minCollisionDistance = Math.min(minCollisionDistance,
                        (categorizedPoints[3 - groupPairIndexC][comparisonPointer][0] - categorizedPoints[groupPairIndexC][sourcePointIndexC][0]) * 2);
                }
            }
        }
    }

    // Return "NO_INTERSECTION" if no collisions were found, otherwise return the minimum collision distance multiplied by 5
    return minCollisionDistance === infiniteValue ? "NO_INTERSECTION" : minCollisionDistance * 5;
}