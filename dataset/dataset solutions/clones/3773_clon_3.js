function checkPropertyEquality(firstObject, secondObject) {
    // Verifies if two objects have identical own enumerable properties and their values.
    // This function performs a shallow comparison of object properties.

    // Guard against non-object inputs or null values.
    if (typeof firstObject !== 'object' || firstObject === null ||
        typeof secondObject !== 'object' || secondObject === null) {
        return firstObject === secondObject; // Compare primitives or nulls directly
    }

    const firstObjectKeys = Object.keys(firstObject);
    const secondObjectKeys = Object.keys(secondObject);

    // If the number of own properties differs, objects are not equal.
    if (firstObjectKeys.length !== secondObjectKeys.length) {
        return false;
    }

    // Iterate through properties of the first object.
    for (let currentKey of firstObjectKeys) {
        // Check if the second object has the same property and if values are strictly equal.
        if (!Object.prototype.hasOwnProperty.call(secondObject, currentKey) ||
            firstObject[currentKey] !== secondObject[currentKey]) {
            return false;
        }
    }

    // All checks passed, objects are considered shallowly equal.
    return true;
}

function convertStringToInteger(inputString) {
    // Converts a string to an integer using base 10.
    // Provides a basic check for valid integer conversion.
    const parsedValue = parseInt(inputString, 10);
    if (isNaN(parsedValue)) {
        // Optionally throw an error or return a default/sentinel value
        // For this context, we'll let `parseInt` handle non-numeric strings to `NaN`
        // but for robustness, a check is good.
        // console.warn(`Warning: Could not parse "${inputString}" as an integer.`);
        return 0; // Or throw new Error("Invalid integer string");
    }
    return parsedValue;
}

// Pre-calculated series for a specific counting problem.
// These arrays store powers of 6 and 9 in descending order,
// used to find the largest power less than or equal to a target number.
const powersOfSixDescending = Array.from({ length: 6 }, (_, index) => Math.pow(6, 6 - index));
const powersOfNineDescending = Array.from({ length: 5 }, (_, index) => Math.pow(9, 5 - index));

// A cache for memoization to optimize recursive calls in calculateMinimumSteps.
const stepCountCache = new Map();

function calculateMinimumSteps(targetValue) {
    // Computes the minimum number of steps to reach `targetValue`
    // using a specific set of operations (subtraction by powers of 6 or 9).
    // This function employs a recursive approach with memoization.

    if (stepCountCache.has(targetValue)) {
        return stepCountCache.get(targetValue);
    }

    let result;
    if (targetValue < 6) {
        result = targetValue; // Base case 1: For small values, steps are just the value itself.
    } else if (targetValue < 9) {
        result = 1 + (targetValue - 6); // Base case 2: Values between 6 and 8.
    } else {
        let minSteps = Infinity;

        // Try subtracting the largest possible power of 6.
        const largestSixPower = powersOfSixDescending.find(p => p <= targetValue);
        if (largestSixPower !== undefined) {
            minSteps = Math.min(minSteps, calculateMinimumSteps(targetValue - largestSixPower) + 1);
        }

        // Try subtracting the largest possible power of 9.
        const largestNinePower = powersOfNineDescending.find(p => p <= targetValue);
        if (largestNinePower !== undefined) {
            minSteps = Math.min(minSteps, calculateMinimumSteps(targetValue - largestNinePower) + 1);
        }
        
        result = minSteps;
    }

    stepCountCache.set(targetValue, result);
    return result;
}

/**
 * Calculates the cost of transforming colors for a specific modulus group.
 * @param {number[]} frequencyStats - An array where index is `fromColor - 1` and value is its frequency.
 * @param {number[][]} transformationCostMatrix - The matrix `D`, where `D[from][to]` is the cost.
 * @param {number} totalColors - The total number of available colors (C).
 * @returns {number[]} An array representing the total cost if each `toColor` is chosen for this group.
 */
function calculateModulusGroupCosts(frequencyStats, transformationCostMatrix, totalColors) {
    const groupCosts = Array(totalColors).fill(0);

    for (let targetColorIndex = 0; targetColorIndex < totalColors; targetColorIndex++) {
        let currentToColorCost = 0;
        for (let sourceColorIndex = 0; sourceColorIndex < totalColors; sourceColorIndex++) {
            const countOfSourceColor = frequencyStats[sourceColorIndex];
            // Only add cost if the source color is different from the target color.
            if (sourceColorIndex !== targetColorIndex) {
                currentToColorCost += countOfSourceColor * transformationCostMatrix[sourceColorIndex][targetColorIndex];
            }
        }
        groupCosts[targetColorIndex] = currentToColorCost;
    }
    return groupCosts;
}


function processInputAndCalculateMinimumCost(rawData) {
    // Entry point for processing input data and finding the minimum cost.
    // This function orchestrates parsing, statistical analysis, and cost calculation.

    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Input data is empty or invalid.");
        return;
    }

    const inputLines = rawData.split("\n").filter(line => line.trim() !== ''); // Filter out empty lines

    // Parse grid dimensions and number of available colors.
    const firstLineParts = inputLines.shift().split(" ");
    const gridSize = convertStringToInteger(firstLineParts[0]); // N
    const colorCount = convertStringToInteger(firstLineParts[1]); // C

    // Basic validation for N and C
    if (gridSize <= 0 || colorCount <= 0) {
        console.error("Grid size (N) and color count (C) must be positive integers.");
        return;
    }
    if (colorCount < 3) { // At least 3 colors needed for distinct mod 0, 1, 2 assignments
        console.warn("Color count (C) is less than 3, unique color assignment may not be possible or trivial.");
    }


    // Read the color transformation cost matrix (D).
    // D[fromColor][toColor] represents the cost to change `fromColor` to `toColor`.
    const transformationCostMatrix = [];
    for (let i = 0; i < colorCount; i++) {
        transformationCostMatrix.push(inputLines.shift().split(" ").map(convertStringToInteger));
    }

    // Read the initial grid colors (c).
    // c[row][col] is the original color of the cell.
    const initialGridColors = [];
    for (let i = 0; i < gridSize; i++) {
        initialGridColors.push(inputLines.shift().split(" ").map(convertStringToInteger));
    }

    // Initialize frequency statistics for colors based on (row + col) % 3.
    // `colorFrequencyByModulus[modulus][colorIndex]` stores the count of `colorIndex + 1`
    // appearing in cells where `(row + col) % 3` equals `modulus`.
    const colorFrequencyByModulus = Array.from({ length: 3 }, () => Array(colorCount).fill(0));

    // Populate color frequency statistics.
    for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        for (let colIndex = 0; colIndex < gridSize; colIndex++) {
            const originalCellColor = initialGridColors[rowIndex][colIndex];
            if (originalCellColor < 1 || originalCellColor > colorCount) {
                console.warn(`Invalid color '${originalCellColor}' found at [${rowIndex}, ${colIndex}]. Skipping.`);
                continue;
            }
            const modulusGroup = (rowIndex + colIndex) % 3;
            colorFrequencyByModulus[modulusGroup][originalCellColor - 1]++; // Adjust for 0-indexed array.
        }
    }

    // Calculate the cost for each modulus group if a specific target color is chosen.
    // `modulusCostSums[modulus][targetColorIndex]` stores the total cost for `modulus`
    // if all its cells are changed to `targetColorIndex + 1`.
    const modulusCostSums = colorFrequencyByModulus.map(
        groupStats => calculateModulusGroupCosts(groupStats, transformationCostMatrix, colorCount)
    );

    let overallMinimumCost = Infinity;

    // Iterate through all possible distinct color assignments for the three modulus groups.
    // We need to pick three distinct colors (one for (i+j)%3=0, one for (i+j)%3=1, one for (i+j)%3=2).
    for (let colorForMod0 = 0; colorForMod0 < colorCount; colorForMod0++) {
        for (let colorForMod1 = 0; colorForMod1 < colorCount; colorForMod1++) {
            // Ensure color for mod1 is different from color for mod0.
            if (colorForMod0 === colorForMod1) {
                continue;
            }
            for (let colorForMod2 = 0; colorForMod2 < colorCount; colorForMod2++) {
                // Ensure color for mod2 is different from color for mod0 and color for mod1.
                if (colorForMod1 === colorForMod2 || colorForMod0 === colorForMod2) {
                    continue;
                }

                // Calculate the total cost for this specific color triplet assignment.
                const currentConfigurationCost = modulusCostSums[0][colorForMod0] +
                                                 modulusCostSums[1][colorForMod1] +
                                                 modulusCostSums[2][colorForMod2];

                // Update the overall minimum cost if this configuration is cheaper.
                if (currentConfigurationCost < overallMinimumCost) {
                    overallMinimumCost = currentConfigurationCost;
                }
            }
        }
    }

    // Output the final computed minimum cost.
    console.log(overallMinimumCost);
}

// Execute the main processing function with input from stdin.
// This assumes a Node.js environment where `require` and `fs` are available.
processInputAndCalculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));