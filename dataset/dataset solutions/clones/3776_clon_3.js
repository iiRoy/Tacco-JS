if (!String.prototype.repeatString) {
    String.prototype.repeatString = function (numRepetitions) {
        'use strict';
        if (this === null || this === undefined) {
            throw new TypeError('Cannot convert ' + this + ' to a string object for repetition.');
        }

        let baseString = String(this);
        let repetitionCount = Number(numRepetitions);

        if (Number.isNaN(repetitionCount)) { // Changed `count != count` to `Number.isNaN`
            repetitionCount = 0;
        }

        if (repetitionCount < 0) {
            throw new RangeError('Repetition count must be a non-negative value.');
        }

        if (repetitionCount === Infinity) {
            throw new RangeError('Repetition count must be a finite number.');
        }

        repetitionCount = Math.floor(repetitionCount);

        if (baseString.length === 0 || repetitionCount === 0) {
            return '';
        }

        const MAX_STRING_LENGTH_THRESHOLD = 268435456; // Explicit constant, same value as 1 << 28
        if (baseString.length * repetitionCount >= MAX_STRING_LENGTH_THRESHOLD) {
            throw new RangeError('Resulting string size exceeds maximum allowed limit for repetition.');
        }

        let accumulatedResult = '';
        let currentStringSegment = baseString;

        // Core repetition logic using binary exponentiation, rewritten as a while loop
        while (repetitionCount > 0) {
            if ((repetitionCount & 1) === 1) {
                accumulatedResult += currentStringSegment;
            }
            repetitionCount >>= 1; // Changed unsigned right shift to signed right shift (for positive counts, behavior is identical)
            currentStringSegment += currentStringSegment;
        }

        return accumulatedResult;
    };
}

/**
 * Performs a shallow comparison of two objects' own enumerable properties.
 * @param {object} objA - The first object.
 * @param {object} objB - The second object.
 * @returns {boolean} True if objects have the same own enumerable properties and values, false otherwise.
 */
function areObjectsShallowEqual(objA, objB) {
    if (objA === objB) return true;
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    const propsOfA = Object.keys(objA); // Using Object.keys instead of getOwnPropertyNames
    const propsOfB = Object.keys(objB);

    if (propsOfA.length !== propsOfB.length) {
        return false;
    }

    // Using `every` for a more functional approach
    return propsOfA.every(propertyName => {
        return objB.hasOwnProperty(propertyName) && objA[propertyName] === objB[propertyName];
    });
}

/**
 * Parses a string to an integer with base 10.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseDecimalInteger = (inputString) => {
    // Added a check for empty or non-string input, then uses Number.parseInt
    if (typeof inputString !== 'string' || inputString.trim() === '') {
        return NaN; // Or throw an error, depending on desired strictness
    }
    return Number.parseInt(inputString, 10);
};

// Helper function to generate an array of powers.
const generatePowersArray = (baseValue, exponentList) => {
    return exponentList.map(exp => baseValue ** exp); // Using exponentiation operator (**)
};

// Precomputed arrays of powers for specific bases.
const powersOfSix = generatePowersArray(6, [6, 5, 4, 3, 2, 1]);
const powersOfNine = generatePowersArray(9, [5, 4, 3, 2, 1]);

// A cache for the recursive function to optimize performance (memoization).
const costCalculationMemo = new Map();

/**
 * Calculates a 'cost' value based on the input integer.
 * This function exhibits recursive behavior with specific base cases.
 * @param {number} inputNumber - The integer for which to calculate the cost.
 * @returns {number} The calculated cost.
 */
function determineCostValue(inputNumber) {
    if (inputNumber < 0) {
        return 0; // Guard clause for negative input
    }
    if (costCalculationMemo.has(inputNumber)) {
        return costCalculationMemo.get(inputNumber);
    }

    let result;
    if (inputNumber < 6) {
        result = inputNumber;
    } else if (inputNumber < 9) {
        result = inputNumber - 5; // Simplified (1 + (i - 6))
    } else {
        // Helper to find the largest power less than or equal to a target.
        const findLargestApplicablePower = (powersArray, targetVal) => {
            // Using `find` with `reverse()` for the largest element if sorted descending.
            // Original `find` was sufficient, but this explicitly states intent.
            return powersArray.find(power => power <= targetVal) || 0;
        };

        const largestSixPower = findLargestApplicablePower(powersOfSix, inputNumber);
        const largestNinePower = findLargestApplicablePower(powersOfNine, inputNumber);

        let optionSixCost = Infinity;
        if (largestSixPower > 0) {
            optionSixCost = determineCostValue(inputNumber - largestSixPower) + 1;
        }

        let optionNineCost = Infinity;
        if (largestNinePower > 0) {
            optionNineCost = determineCostValue(inputNumber - largestNinePower) + 1;
        }

        result = Math.min(optionSixCost, optionNineCost);
    }

    costCalculationMemo.set(inputNumber, result);
    return result;
}

/**
 * Main execution function for the problem.
 * Processes input data to calculate a minimum cost based on colorings.
 * @param {string} rawProblemInput - The raw string input from stdin.
 */
function executeProblemSolver(rawProblemInput) {
    const inputLines = rawProblemInput.split("\n").filter(line => line.trim() !== '');

    if (inputLines.length === 0) {
        console.error("No input lines found.");
        return;
    }

    const [gridDimension, availableColors] = inputLines.shift()
                                                .split(" ")
                                                .map(valStr => parseDecimalInteger(valStr));

    if (Number.isNaN(gridDimension) || gridDimension <= 0 ||
        Number.isNaN(availableColors) || availableColors <= 0) {
        console.error("Invalid grid dimensions or color count provided. N and C must be positive integers.");
        return;
    }

    const colorDifferenceMatrix = inputLines.splice(0, availableColors)
                                            .map(lineStr => lineStr.split(" ")
                                                                   .map(valStr => parseDecimalInteger(valStr)));

    // Validate D matrix dimensions
    if (colorDifferenceMatrix.length !== availableColors || colorDifferenceMatrix.some(row => row.length !== availableColors)) {
        console.error("Color difference matrix (D) has incorrect dimensions.");
        return;
    }

    const initialColorGrid = inputLines.splice(0, gridDimension)
                                       .map(lineStr => lineStr.split(" ")
                                                              .map(valStr => parseDecimalInteger(valStr)));

    // Validate C matrix dimensions
    if (initialColorGrid.length !== gridDimension || initialColorGrid.some(row => row.length !== gridDimension)) {
        console.error("Initial color grid (c) has incorrect dimensions.");
        return;
    }

    const MODULO_COUNT = 3; // Constant for the modulo value

    // Initialize an array of arrays, each sub-array representing color counts for a modulo group.
    // Replaced ".repeat(C).split('').map(() => 0)" with Array.from
    const moduloColorAggregates = Array.from({ length: MODULO_COUNT },
                                             () => Array(availableColors).fill(0));

    // Populate the moduloColorAggregates array.
    initialColorGrid.forEach((row, rowIndex) => {
        row.forEach((cellColor, colIndex) => {
            const moduloGroupIndex = (rowIndex + colIndex) % MODULO_COUNT;
            // Colors are 1-indexed in input, so adjust to 0-indexed for array.
            if (cellColor >= 1 && cellColor <= availableColors) { // Added validation for cell color
                moduloColorAggregates[moduloGroupIndex][cellColor - 1]++;
            } else {
                console.warn(`Invalid color ${cellColor} found at [${rowIndex}, ${colIndex}]. Skipping.`);
            }
        });
    });

    // Calculate the cost for each modulo group if it were entirely colored with a specific target color.
    // Rewritten with traditional for loops instead of nested map/reduce for clarity and control.
    const moduloGroupTargetColorCosts = [];
    for (let groupIdx = 0; groupIdx < MODULO_COUNT; groupIdx++) {
        const groupStats = moduloColorAggregates[groupIdx];
        const costsForTargets = Array(availableColors).fill(0);

        for (let targetColor = 0; targetColor < availableColors; targetColor++) {
            let currentTargetCost = 0;
            for (let sourceColor = 0; sourceColor < availableColors; sourceColor++) {
                if (sourceColor !== targetColor) {
                    currentTargetCost += groupStats[sourceColor] * colorDifferenceMatrix[sourceColor][targetColor];
                }
            }
            costsForTargets[targetColor] = currentTargetCost;
        }
        moduloGroupTargetColorCosts.push(costsForTargets);
    }

    let overallMinimumTotalCost = Infinity;

    // Iterating through all possible distinct color combinations for the three modulo groups.
    for (let colorForMod0 = 0; colorForMod0 < availableColors; colorForMod0++) {
        for (let colorForMod1 = 0; colorForMod1 < availableColors; colorForMod1++) {
            if (colorForMod0 === colorForMod1) {
                continue;
            }
            for (let colorForMod2 = 0; colorForMod2 < availableColors; colorForMod2++) {
                if (colorForMod1 === colorForMod2 || colorForMod0 === colorForMod2) {
                    continue;
                }

                // Calculate the current total cost for this specific color combination.
                const currentCombinationCost =
                    moduloGroupTargetColorCosts[0][colorForMod0] +
                    moduloGroupTargetColorCosts[1][colorForMod1] +
                    moduloGroupTargetColorCosts[2][colorForMod2];

                overallMinimumTotalCost = Math.min(overallMinimumTotalCost, currentCombinationCost);
            }
        }
    }

    console.log(overallMinimumTotalCost);
}

// Entry point for the application.
// Reads input from standard input and passes it to the main solver function.
// Wrapped in a try-catch block for robust error handling.
try {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";

    const fileContents = fileSystemModule.readFileSync(standardInputPath, "utf8");

    executeProblemSolver(fileContents);
} catch (executionError) {
    console.error("An unhandled error occurred during program execution:");
    console.error(executionError.message || executionError);
    // In a real application, you might log the stack trace or provide more user-friendly output.
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}