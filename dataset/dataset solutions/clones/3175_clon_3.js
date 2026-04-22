function computeOptimalCost(currentLevel, maxLevels, targetSizes, currentSizes, bambooLengths) {
    // Constants for costs and penalties to improve readability
    const BAMBOO_GROW_COST = 10;
    const ADJUSTMENT_PENALTY = 30;
    // A very large number representing an impossible or invalid path cost
    const IMPOSSIBLE_COST_VAL = Number.MAX_SAFE_INTEGER / 2; // Using a large safe integer

    // Helper function to verify if all current bamboo sizes are positive
    const areAllPositive = (arr) => arr.every(val => val > 0);

    // Helper function to calculate the Manhattan distance between two 3-element arrays
    const calculateManhattanDistance = (arrA, arrB) => {
        let totalDistance = 0;
        for (let i = 0; i < arrA.length; i++) {
            totalDistance += Math.abs(arrA[i] - arrB[i]);
        }
        return totalDistance;
    };

    // Base case: If we have processed all available bamboo pieces
    if (currentLevel === maxLevels) {
        // If all final bamboo pieces have positive lengths, calculate the actual cost
        if (areAllPositive(currentSizes)) {
            let finalCost = calculateManhattanDistance(targetSizes, currentSizes);
            finalCost -= ADJUSTMENT_PENALTY; // Apply the fixed penalty for successful combination
            return finalCost;
        } else {
            // If any of the final bamboo pieces has a non-positive length, this path is invalid
            return IMPOSSIBLE_COST_VAL;
        }
    }

    // Initialize an array to store the costs from various decision branches
    let potentialCosts = [];

    // Branch 1: Decision to NOT use the current bamboo piece (bambooLengths[currentLevel])
    // Proceed to the next level without altering the current bamboo sizes
    let costSkippingBamboo = computeOptimalCost(currentLevel + 1, maxLevels, targetSizes, currentSizes, bambooLengths);
    potentialCosts.push(costSkippingBamboo);

    // Branch 2: Decision to use the current bamboo piece to grow target A
    // Create a new array to represent the updated state, preventing side effects
    let updatedSizesForA = [...currentSizes];
    updatedSizesForA[0] += bambooLengths[currentLevel]; // Add current bamboo length to target A
    let costForGrowingA = computeOptimalCost(currentLevel + 1, maxLevels, targetSizes, updatedSizesForA, bambooLengths) + BAMBOO_GROW_COST;
    potentialCosts.push(costForGrowingA);

    // Branch 3: Decision to use the current bamboo piece to grow target B
    let updatedSizesForB = [...currentSizes];
    updatedSizesForB[1] += bambooLengths[currentLevel]; // Add current bamboo length to target B
    let costForGrowingB = computeOptimalCost(currentLevel + 1, maxLevels, targetSizes, updatedSizesForB, bambooLengths) + BAMBOO_GROW_COST;
    potentialCosts.push(costForGrowingB);

    // Branch 4: Decision to use the current bamboo piece to grow target C
    let updatedSizesForC = [...currentSizes];
    updatedSizesForC[2] += bambooLengths[currentLevel]; // Add current bamboo length to target C
    let costForGrowingC = computeOptimalCost(currentLevel + 1, maxLevels, targetSizes, updatedSizesForC, bambooLengths) + BAMBOO_GROW_COST;
    potentialCosts.push(costForGrowingC);

    // Return the minimum cost found among all possible paths from this level
    return Math.min(...potentialCosts);
}

// Main function to handle input parsing and orchestrate the calculation
function processInputAndCalculate(rawData) {
    // Constant for the initial state of the three bamboo pieces
    const INITIAL_BAMBOO_STATE = [0, 0, 0];

    // Helper function for safe integer parsing, providing a default for invalid numbers
    const parseIntegerSafely = (str, defaultValue = 0) => {
        const num = parseInt(str.trim(), 10);
        return isNaN(num) ? defaultValue : num;
    };

    // Split the raw input string into an array of lines
    const inputLines = rawData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

    // Input validation: Check if there's enough data
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines.");
        return;
    }

    // Parse the first line to extract total bamboo count (N) and target lengths (A, B, C)
    const firstLineNumericValues = inputLines[0].split(' ').map(parseIntegerSafely);

    // Destructure the parsed values for easier access
    const [totalBambooCount, targetA, targetB, targetC] = firstLineNumericValues;

    // Validate the initial parsed parameters
    if (totalBambooCount < 0 || targetA < 0 || targetB < 0 || targetC < 0) {
        console.error("Error: Initial parameters (N, A, B, C) must be non-negative.");
        return;
    }

    // Parse the remaining lines to get the individual bamboo lengths
    // Using slice(1) to skip the first line, then mapping to integers and filtering out invalid lengths
    const availableLengths = inputLines.slice(1)
                                   .map(parseIntegerSafely)
                                   .filter(length => length > 0); // Only consider positive bamboo lengths

    // Additional validation: Check if the number of actual bamboo lengths matches the declared count
    if (availableLengths.length !== totalBambooCount) {
        console.warn(`Warning: Declared bamboo count (N=${totalBambooCount}) does not match the number of valid lengths found (${availableLengths.length}). Proceeding with available lengths.`);
        // Depending on problem specifics, this might be an error or just a warning.
    }

    // Execute the recursive calculation
    const finalCalculatedResult = computeOptimalCost(
        0,                           // Starting level (index of the first bamboo piece)
        totalBambooCount,            // Total number of bamboo pieces to process
        [targetA, targetB, targetC], // The desired final lengths for A, B, C
        INITIAL_BAMBOO_STATE,        // The initial lengths of A, B, C (all zero)
        availableLengths             // The array of individual bamboo lengths
    );

    // Output the computed result
    console.log(finalCalculatedResult);
}

// Standard boilerplate for reading input from stdin in competitive programming contexts
try {
    // Read the entire file content from standard input
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Process the content and print the result
    processInputAndCalculate(fileContent);
} catch (error) {
    // Handle potential errors during file reading or input processing
    console.error("An error occurred during input processing:", error.message);
    // Optionally, provide a more specific error message based on error type
    if (error.code === 'ENOENT') {
        console.error("Ensure '/dev/stdin' exists and is readable.");
    }
}