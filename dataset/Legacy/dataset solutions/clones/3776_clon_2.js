if (!String.prototype.repeat) {
    String.prototype.repeat = function (numRepetitions) {
        'use strict';
        // Ensure the context is not null or undefined
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        // Convert the 'this' value to a string primitive
        var baseString = '' + this;
        // Coerce the repetition count to a number
        numRepetitions = +numRepetitions;
        // Handle NaN case for the count, treating it as 0
        if (numRepetitions != numRepetitions) {
            numRepetitions = 0;
        }
        // Validate that the repetition count is non-negative
        if (numRepetitions < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        // Validate that the repetition count is not infinite
        if (numRepetitions == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        // Convert the count to an integer by flooring
        numRepetitions = Math.floor(numRepetitions);
        // If the base string is empty or count is zero, return an empty string
        if (baseString.length == 0 || numRepetitions == 0) {
            return '';
        }
        // Check for potential string length overflow before allocation
        // A common limit for string length in JS engines is 2^28
        if (baseString.length * numRepetitions >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        // Initialize an empty string to accumulate the result
        var resultAccumulator = '';
        // Use a binary exponentiation-like algorithm for efficient string repetition
        for (;;) {
            // If the least significant bit of numRepetitions is 1, append baseString
            if ((numRepetitions & 1) == 1) {
                resultAccumulator += baseString;
            }
            // Right shift numRepetitions by 1 (equivalent to integer division by 2)
            numRepetitions >>>= 1;
            // If numRepetitions becomes 0, all bits have been processed
            if (numRepetitions == 0) {
                break;
            }
            // Double the baseString for the next iteration
            baseString += baseString;
        }
        return resultAccumulator;
    };
}

// This function checks for shallow equality of own enumerable properties between two objects.
function areEquivalent(firstObj, secondObj) {
    // Get an array of all own enumerable property names of the first object.
    var firstProps = Object.getOwnPropertyNames(firstObj);
    // Get an array of all own enumerable property names of the second object.
    var secondProps = Object.getOwnPropertyNames(secondObj);

    // If the number of properties differs, the objects are not equivalent.
    if (firstProps.length != secondProps.length)
        return false;

    // Iterate through the properties of the first object.
    for (var idx = 0; idx < firstProps.length; idx++) {
        var currentPropName = firstProps[idx];
        // Check if the value of the current property is strictly equal in both objects.
        if (firstObj[currentPropName] !== secondObj[currentPropName])
            return false;
    }
    // If all properties match, the objects are considered equivalent.
    return true;
}

// A utility function to parse a string into an integer using base 10.
function parseInteger(inputString) {
    return parseInt(inputString, 10);
}

// Pre-calculate powers of 6 for specific exponents to be used in the 'calculateSteps' function.
var baseSixPowers = [6, 5, 4, 3, 2, 1].map(function (exponentVal) {
    return Math.pow(6, exponentVal);
});

// Pre-calculate powers of 9 for specific exponents to be used in the 'calculateSteps' function.
var baseNinePowers = [5, 4, 3, 2, 1].map(function (exponentVal) {
    return Math.pow(9, exponentVal);
});

// This recursive function calculates the minimum number of steps to reach a target value.
// It's not used in the main problem logic but is part of the original code.
function calculateSteps(targetValue) {
    // Base cases for small target values.
    if (targetValue < 6)
        return targetValue;
    if (targetValue < 9)
        return 1 + (targetValue - 6);

    // Recursive step: find the largest power of 6 or 9 less than or equal to targetValue,
    // subtract it, and add 1 for the current step. Take the minimum of these two options.
    var optionSix = calculateSteps(targetValue - baseSixPowers.find(function (powerVal) {
        return powerVal <= targetValue;
    })) + 1;
    var optionNine = calculateSteps(targetValue - baseNinePowers.find(function (powerVal) {
        return powerVal <= targetValue;
    })) + 1;

    return Math.min(optionSix, optionNine);
}

// The primary function to process the input data and solve the problem.
function processInputData(rawData) {
    // Split the raw input string into an array of individual lines.
    var inputLines = rawData.split("\n");

    // Parse the first line to get configuration parameters: N (grid size) and C (number of colors).
    var configParams = inputLines.shift().split(" ").map(function (strVal) {
        return parseInteger(strVal);
    });
    var gridSize = configParams[0]; // N
    var colorCount = configParams[1]; // C

    // Read the cost matrix D, which defines the cost to change one color to another.
    // D is a C x C matrix.
    var costMatrix = inputLines.splice(0, colorCount).map(function (lineStr) {
        return lineStr.split(" ").map(function (strVal) {
            return parseInteger(strVal);
        });
    });

    // Read the initial color grid 'c', an N x N matrix of cell colors.
    var colorGrid = inputLines.splice(0, gridSize).map(function (lineStr) {
        return lineStr.split(" ").map(function (strVal) {
            return parseInteger(strVal);
        });
    });

    // Initialize a 3xColorCount array to store the frequency of each color
    // for cells grouped by (row_index + col_index) % 3.
    // remainderColorCounts[0] for (i+j)%3 == 0
    // remainderColorCounts[1] for (i+j)%3 == 1
    // remainderColorCounts[2] for (i+j)%3 == 2
    var remainderColorCounts = [
        ".".repeat(colorCount).split("").map(function (dummy) { return 0; }),
        ".".repeat(colorCount).split("").map(function (dummy) { return 0; }),
        ".".repeat(colorCount).split("").map(function (dummy) { return 0; })
    ];

    // Populate the remainderColorCounts array by iterating through the color grid.
    colorGrid.forEach(function (row, rowIndex) {
        row.forEach(function (cellColor, colIndex) {
            // Colors are 1-indexed in input, convert to 0-indexed for array access.
            remainderColorCounts[(rowIndex + colIndex) % 3][cellColor - 1]++;
        });
    });

    // Calculate the total cost for each (i+j)%3 group if all its cells were changed to a specific target color.
    // remainderScores[k][targetColorIndex] will hold this total cost.
    var remainderScores = remainderColorCounts.map(function (currentStats) {
        return ".".repeat(colorCount).split("").map(function (dummy, targetColorIndex) {
            // For each possible target color, sum up the costs from all original colors.
            return currentStats.map(function (occurrenceCount, sourceColorIndex) {
                // If the source color is already the target color, the cost is zero.
                // Otherwise, it's the count of cells with 'sourceColorIndex' multiplied by the cost to change it to 'targetColorIndex'.
                return sourceColorIndex == targetColorIndex ? 0 : occurrenceCount * costMatrix[sourceColorIndex][targetColorIndex];
            }).reduce(function (accumulator, currentValue) {
                return accumulator + currentValue;
            }, 0); // Sum all individual costs for this target color.
        });
    });

    // Initialize the minimum total cost to a very large value.
    var minimumTotalCost = Infinity;

    // Iterate through all possible color assignments for the three (i+j)%3 groups.
    // The colors assigned to each group must be distinct.

    // Assign a color for the (i+j)%3 == 0 group.
    for (var colorA = 0; colorA < colorCount; colorA++) {
        // Assign a color for the (i+j)%3 == 1 group.
        for (var colorB = 0; colorB < colorCount; colorB++) {
            // Ensure colorA and colorB are different.
            if (colorA == colorB)
                continue;

            // Assign a color for the (i+j)%3 == 2 group.
            for (var colorC = 0; colorC < colorCount; colorC++) {
                // Ensure colorC is different from both colorA and colorB.
                if (colorB == colorC || colorA == colorC)
                    continue;

                // Calculate the total score for this unique combination of colors.
                // Update the minimumTotalCost if this combination yields a lower score.
                minimumTotalCost = Math.min(minimumTotalCost, remainderScores[0][colorA] + remainderScores[1][colorB] + remainderScores[2][colorC]);
            }
        }
    }
    // Output the calculated minimum total cost to the console.
    console.log(minimumTotalCost);
}

// Read the entire input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
