// This script processes multiple input scenarios to find the shortest path
// through a sequence of attribute-based entities on a grid.

// Core Node.js modules for file system operations
const fileSystem = require('fs');

// Read all standard input synchronously as a single string
// For competitive programming, /dev/stdin is common for input files.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the entire input into an array of lines
const allInputLines = rawInputData.trim().split('\n');

// Entry point for the application logic
initiateProcessing();

// --- Main Application Logic ---

/**
 * Orchestrates the processing of multiple grid scenarios from the input.
 * This function iterates through each scenario until a termination condition is met.
 */
function initiateProcessing() {
    let currentInputLineIndex = 0; // Tracks the current line being read from allInputLines

    // Loop indefinitely until a specific termination signal (0 0 dimensions) is encountered
    while (true) {
        // Read the current line, trim whitespace, and split by space to get dimension info
        const dimensionParts = allInputLines[currentInputLineIndex].trim().split(' ');

        // Parse width and height from the input parts. Use radix 10 for safety.
        const gridWidth = parseInt(dimensionParts[0], 10);
        const gridHeight = parseInt(dimensionParts[1], 10);

        // Basic input validation: ensure parsed dimensions are valid numbers.
        if (isNaN(gridWidth) || isNaN(gridHeight)) {
            console.error("Error: Invalid grid dimensions provided.");
            // In a real application, you might throw an error or handle it differently.
            // For competitive programming, this might just lead to a wrong answer or crash.
            break; // Exit to prevent infinite loops on malformed input
        }

        // Termination condition: if both dimensions are zero, exit the processing loop.
        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        // --- Scenario-specific variable declarations ---
        let startingPointPacked; // Stores the packed coordinates of the 'S' (start) point
        let endingPointPacked;   // Stores the packed coordinates of the 'G' (goal) point
        // Array to hold entities grouped by their attribute (0-4).
        // Each sub-array stores packed coordinates of entities of that attribute.
        const attributeEntityCollections = Array.from({ length: 5 }, () => []);

        // Iterate through the grid rows to parse entity locations
        // Looping from height-1 down to 0 (inclusive)
        for (let yCoord = gridHeight - 1; yCoord >= 0; --yCoord) {
            currentInputLineIndex++; // Move to the next line of input which contains grid row data
            const rowContents = allInputLines[currentInputLineIndex]; // Get the string for the current row

            // Iterate through the grid columns for the current row
            // Looping from width-1 down to 0 (inclusive)
            for (let xCoord = gridWidth - 1; xCoord >= 0; --xCoord) {
                const charAtCell = rowContents[xCoord]; // Character at the current grid cell

                // Process the character to identify and store entities or special points
                if (charAtCell === '.') {
                    // This is an empty cell, no action needed.
                    // Often the most frequent character, so checking first can be a minor optimization.
                    continue; // Explicitly continue to next cell
                } else if (charAtCell >= '1' && charAtCell <= '5') {
                    // It's an attribute-specific entity (1, 2, 3, 4, or 5)
                    const attributeIndex = parseInt(charAtCell, 10) - 1; // Convert char to 0-4 index
                    // Store the packed coordinates in the corresponding attribute collection
                    attributeEntityCollections[attributeIndex].push(packCoordinates(xCoord, yCoord));
                } else if (charAtCell === 'S') {
                    // This is the starting point
                    startingPointPacked = packCoordinates(xCoord, yCoord);
                } else if (charAtCell === 'G') {
                    // This is the goal point
                    endingPointPacked = packCoordinates(xCoord, yCoord);
                }
                // Any other character would be an error or ignored.
            }
        }

        // --- Pathfinding Algorithm Setup ---
        // A very large number representing infinity for distance calculations
        const INFINITE_DIST = Number.MAX_SAFE_INTEGER;
        let bestStartingAttribute = -1; // Stores the 0-indexed attribute that yielded the shortest path
        let overallMinimumDistance = INFINITE_DIST; // Stores the shortest path found across all starting attributes

        // The dynamic programming table to store minimum distances.
        // `pathDistances[attributeIndex][entityIndex]` will store the min distance to that entity.
        let pathDistances;

        // Iterate through each possible attribute (0-4) to consider it as the first entity in the sequence
        for (let initialAttributeChoice = 0; initialAttributeChoice < 5; ++initialAttributeChoice) {
            // Re-initialize pathDistances for each new starting attribute choice
            pathDistances = Array.from({ length: 5 }, (_, attIdx) => {
                // Initialize distances for all entities of this attribute to INFINITE_DIST
                return new Array(attributeEntityCollections[attIdx].length).fill(INFINITE_DIST);
            });

            // Determine the actual first attribute in the sequence for this iteration.
            // The sequence is (initialAttributeChoice + 1) % 5, then (initialAttributeChoice + 2) % 5, etc.
            let currentAttributeSequenceIndex = (initialAttributeChoice + 1) % 5;
            let currentAttributeEntities = attributeEntityCollections[currentAttributeSequenceIndex];
            let distancesToCurrentAttributeEntities = pathDistances[currentAttributeSequenceIndex];

            // Calculate the initial distances from the 'S' (start) point to all entities
            // of the first attribute in the sequence.
            for (let k = 0; k < currentAttributeEntities.length; ++k) {
                distancesToCurrentAttributeEntities[k] = calculateManhattanDistance(
                    startingPointPacked,
                    currentAttributeEntities[k]
                );
            }

            // This loop represents the 'hops' between attributes.
            // The path is S -> A1 -> A2 -> A3 -> A4 -> G.
            // There are 3 intermediate hops (A1->A2, A2->A3, A3->A4).
            for (let hopCounter = 0; hopCounter < 3; ++hopCounter) {
                // Determine the next attribute in the sequence
                const nextAttributeSequenceIndex = (currentAttributeSequenceIndex + 1) % 5;
                const nextAttributeEntities = attributeEntityCollections[nextAttributeSequenceIndex];
                const distancesToNextAttributeEntities = pathDistances[nextAttributeSequenceIndex];

                // Iterate through each entity in the current attribute group
                for (let currentEntIdx = 0; currentEntIdx < currentAttributeEntities.length; ++currentEntIdx) {
                    const currentEntityPackedCoord = currentAttributeEntities[currentEntIdx];
                    const distanceToCurrentEntity = distancesToCurrentAttributeEntities[currentEntIdx];

                    // Optimization: if the path to the current entity is already greater than or equal
                    // to the best overall path found so far, then this branch cannot lead to a better solution.
                    if (distanceToCurrentEntity >= overallMinimumDistance) {
                        continue; // Skip further calculations for this entity
                    }

                    // Iterate through each entity in the next attribute group
                    for (let nextEntIdx = 0; nextEntIdx < nextAttributeEntities.length; ++nextEntIdx) {
                        const nextEntityPackedCoord = nextAttributeEntities[nextEntIdx];
                        // Calculate the distance from the current entity to the next entity
                        const segmentDistance = calculateManhattanDistance(currentEntityPackedCoord, nextEntityPackedCoord);
                        // Update the minimum distance to the next entity
                        distancesToNextAttributeEntities[nextEntIdx] = findMinimum(
                            distancesToNextAttributeEntities[nextEntIdx],
                            distanceToCurrentEntity + segmentDistance
                        );
                    }
                }

                // Move to the next attribute in the sequence for the next hop
                currentAttributeSequenceIndex = nextAttributeSequenceIndex;
                currentAttributeEntities = nextAttributeEntities;
                distancesToCurrentAttributeEntities = distancesToNextAttributeEntities;
            }

            // After 3 hops, 'currentAttributeEntities' now holds the entities of the 4th attribute in sequence.
            // Calculate the final leg of the journey: from the 4th attribute entities to the 'G' (goal) point.
            for (let finalEntIdx = 0; finalEntIdx < currentAttributeEntities.length; ++finalEntIdx) {
                const distanceToLastEntity = distancesToCurrentAttributeEntities[finalEntIdx];
                // If the path to this entity is already too long, skip.
                if (distanceToLastEntity >= overallMinimumDistance) {
                    continue;
                }
                const finalPathCost = distanceToLastEntity + calculateManhattanDistance(
                    currentAttributeEntities[finalEntIdx],
                    endingPointPacked
                );

                // Update the overall minimum distance if a shorter path is found
                if (finalPathCost < overallMinimumDistance) {
                    overallMinimumDistance = finalPathCost;
                    bestStartingAttribute = initialAttributeChoice; // Record which starting attribute led to this best path
                }
            }
        }

        // --- Output Results ---
        // After evaluating all starting attribute choices, print the result for the current scenario.
        if (overallMinimumDistance === INFINITE_DIST) {
            console.log("NA"); // No valid path found
        } else {
            // Output the 1-indexed best starting attribute and the total minimum distance
            console.log(`${(bestStartingAttribute + 1)} ${overallMinimumDistance}`);
        }

        currentInputLineIndex++; // Move past the processed scenario's last line (blank line or next scenario's dimensions)
    }
}

// --- Helper Functions for Coordinate Packing and Math Operations ---

/**
 * Calculates the Manhattan distance (L1 norm) between two packed coordinate points.
 * @param {number} packedFrom - The starting point's packed coordinates.
 * @param {number} packedTo - The ending point's packed coordinates.
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance(packedFrom, packedTo) {
    // Unpack x and y coordinates using bitwise operations
    // X is stored in bits 11-31 (right shift by 11 to get X)
    // Y is stored in bits 0-10 (AND with 2047, which is 0b11111111111 or (1<<11)-1)
    const fromX = packedFrom >> 11;
    const fromY = packedFrom & 2047; // 2047 = (1 << 11) - 1
    const toX = packedTo >> 11;
    const toY = packedTo & 2047;

    return getAbsoluteValue(fromX - toX) + getAbsoluteValue(fromY - toY);
}

/**
 * Returns the smaller of two numbers using a bitwise trick for potential micro-optimization.
 * This avoids a conditional branch.
 * @param {number} valA - First number.
 * @param {number} valB - Second number.
 * @returns {number} The minimum of valA and valB.
 */
function findMinimum(valA, valB) {
    // Bitwise min: `b + ((a - b) & ((a - b) >> 31))`
    // If a < b, (a - b) is negative. (a - b) >> 31 will be -1 (0xFFFFFFFF).
    // (a - b) & -1 is (a - b). So, b + (a - b) = a.
    // If a >= b, (a - b) is non-negative. (a - b) >> 31 will be 0.
    // (a - b) & 0 is 0. So, b + 0 = b.
    return valB + ((valA - valB) & ((valA - valB) >> 31));
}

/**
 * Packs x and y coordinates into a single 32-bit integer for efficient storage and retrieval.
 * X coordinates are stored in higher bits, Y in lower bits.
 * Y uses bits 0-10 (11 bits, max value 2047).
 * X uses bits 11-31 (21 bits, max value 2^21 - 1).
 * This allows for grids up to ~2 million in X and ~2 thousand in Y.
 * @param {number} xCoordinate - The X coordinate.
 * @param {number} yCoordinate - The Y coordinate.
 * @returns {number} The packed coordinate value.
 */
function packCoordinates(xCoordinate, yCoordinate) {
    // Y coordinate (0-2047) takes up 11 bits.
    // X coordinate is shifted left by 11 bits to make space for Y.
    return (xCoordinate << 11) + yCoordinate;
}

/**
 * Computes the absolute value of a number using a bitwise trick.
 * This avoids a conditional branch, which can be faster in some contexts.
 * @param {number} value - The number.
 * @returns {number} The absolute value of the number.
 */
function getAbsoluteValue(value) {
    // Bitwise abs: `(a ^ (a >> 31)) - (a >> 31)`
    // If 'value' is negative, `value >> 31` is -1 (all ones).
    // `value ^ -1` is bitwise NOT. `~value`.
    // `~value - (-1)` is `~value + 1`, which is equivalent to `-value` for two's complement.
    // If 'value' is positive, `value >> 31` is 0.
    // `value ^ 0` is `value`.
    // `value - 0` is `value`.
    return (value ^ (value >> 31)) - (value >> 31);
}