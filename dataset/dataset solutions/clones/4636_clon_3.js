'use strict'; // Ensure strict mode for better code quality

// A very large numeric bound, used as an initial maximum or sentinel in some algorithms.
// While not directly utilized in the core logic of this specific problem,
// it's a common auxiliary constant in competitive programming, maintained for structural similarity.
const LARGE_NUMERIC_BOUND = Number.MAX_SAFE_INTEGER;

/**
 * Parses a string of space-separated numerical values into an array of integers.
 * It handles potential multiple spaces by filtering out empty strings and
 * explicitly uses base 10 for parsing.
 * @param {string} inputLineStr - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers. Returns an empty array on invalid input.
 */
function parseNumericLine(inputLineStr) {
    if (typeof inputLineStr !== 'string') {
        console.error("Input for parseNumericLine must be a string.");
        return [];
    }
    return inputLineStr.split(' ').filter(s => s.length > 0).map(s => parseInt(s.trim(), 10));
}

/**
 * Normalizes a given position to ensure it falls within the circular track's boundaries [0, trackLength).
 * This helper function correctly handles negative results that can occur with JavaScript's modulo operator
 * when the dividend is negative.
 * @param {number} rawPosition - The calculated position, which might be outside [0, trackLength).
 * @param {number} trackLength - The total length of the circular track.
 * @returns {number} The normalized position within the track's range. Returns 0 if trackLength is non-positive.
 */
function normalizePosition(rawPosition, trackLength) {
    if (trackLength <= 0) {
        console.warn("Attempted to normalize position with non-positive track length.");
        return 0; // Or throw an error, depending on desired robustness.
    }
    return (rawPosition % trackLength + trackLength) % trackLength;
}

/**
 * Performs a binary search on a sorted array to find the "lower bound" of a target value.
 * This means it returns the index of the first element in the array that is
 * greater than or equal to the target value. If all elements are smaller, it returns
 * the array's length. The search is conducted within a specified range [searchStart, searchEnd).
 * @param {number[]} sortedNumericArray - The array to search, which must be sorted ascendingly.
 * @param {number} searchStartIndex - The inclusive starting index for the search.
 * @param {number} searchEndIndex - The exclusive ending index for the search.
 * @param {number} targetValue - The value to find the lower bound for.
 * @returns {number} The index of the first element >= targetValue, or searchEndIndex if no such element exists.
 */
function findInsertionPoint(sortedNumericArray, searchStartIndex, searchEndIndex, targetValue) {
    if (!Array.isArray(sortedNumericArray) || sortedNumericArray.length === 0) {
        return 0; // For empty or invalid arrays, the insertion point is 0.
    }
    if (searchStartIndex < 0 || searchEndIndex > sortedNumericArray.length || searchStartIndex > searchEndIndex) {
        console.error("Invalid search range provided to findInsertionPoint.");
        return 0; // Fallback or error handling for bad ranges.
    }

    let low = searchStartIndex;
    let high = searchEndIndex; // Exclusive upper bound

    while (low < high) {
        let mid = Math.floor((low + high) / 2);
        if (sortedNumericArray[mid] < targetValue) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    // At the end of the loop, 'low' (which equals 'high') is the index of the first element
    // that is greater than or equal to 'targetValue', or 'searchEndIndex' if all elements
    // in the range are less than 'targetValue'.
    return low;
}

/**
 * Simulates the movement and "collisions" of ants on a circular track for a given duration.
 * This function employs the classic "ants pass through each other" trick:
 * 1. Calculate each ant's final position as if they were transparent and didn't collide.
 * 2. Determine how many times the *first ant* effectively "crosses paths" with other ants.
 *    This count represents the shift in its final identity within the sorted list of final positions.
 * 3. Sort all virtual final positions.
 * 4. Reassign these sorted positions to the original ants based on the calculated shift.
 * @param {string} rawInputTextData - The complete raw input string read from stdin.
 */
function simulateAntsOnTrack(rawInputTextData) {
    // --- Input Validation and Initial Parameter Parsing ---
    if (typeof rawInputTextData !== 'string' || rawInputTextData.trim() === '') {
        console.error("Input data is empty or invalid. Please provide valid simulation parameters.");
        return;
    }

    const allInputLines = rawInputTextData.trim().split('\n');
    if (allInputLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least 2 lines (parameters + first ant).");
        return;
    }

    const [totalAntsCount, trackLengthRawValue, initialTimeOffset] = parseNumericLine(allInputLines[0]);

    if (totalAntsCount === undefined || trackLengthRawValue === undefined || initialTimeOffset === undefined ||
        isNaN(totalAntsCount) || isNaN(trackLengthRawValue) || isNaN(initialTimeOffset)) {
        console.error("Failed to parse initial simulation parameters (ant count, track length, or time).");
        return;
    }

    const antCount = totalAntsCount;
    const trackLen = trackLengthRawValue;
    const effectiveSimulationTime = initialTimeOffset % trackLen; // Time modulo track length for circularity

    if (trackLen <= 0) {
        console.error("Track length must be a positive value. Simulation aborted.");
        return;
    }
    if (antCount < 0) {
        console.error("Ant count cannot be negative. Simulation aborted.");
        return;
    }
    if (antCount === 0) {
        console.log(''); // No ants, no output.
        return;
    }

    // Parse data for the first ant (logically at index 0)
    const firstAntInitialState = parseNumericLine(allInputLines[1]);
    if (firstAntInitialState.length < 2 || isNaN(firstAntInitialState[0]) || isNaN(firstAntInitialState[1])) {
        console.error("Invalid initial state data for the first ant.");
        return;
    }
    const firstAnt = {
        position: firstAntInitialState[0],
        direction: firstAntInitialState[1] // 1 for left (counter-clockwise), 2 for right (clockwise)
    };

    // Array to store the final positions of ants *if they were transparent and passed through each other*.
    // These are "virtual" positions before considering identity shifts.
    const virtualFinalPositions = new Array(antCount);

    // This counter tracks the effective shift of the *original* first ant's final identity
    // within the sorted list of virtual final positions, due to "collisions".
    let identityShiftCounter = 0;

    // --- Main Simulation Loop: Calculate Virtual Positions and Identity Shift ---
    // We iterate through all ants, including the first one (currentAntLogicalIndex = 0).
    // The input lines are 1-indexed for ants (line 1 for ant 0, line 2 for ant 1, etc.).
    for (let currentAntLogicalIndex = 0; currentAntLogicalIndex < antCount; ++currentAntLogicalIndex) {
        const currentAntInputLineIdx = currentAntLogicalIndex + 1; // Map logical index to input line index
        const currentAntRawState = parseNumericLine(allInputLines[currentAntInputLineIdx]);

        if (currentAntRawState.length < 2 || isNaN(currentAntRawState[0]) || isNaN(currentAntRawState[1])) {
            console.warn(`Invalid state data for ant at line ${currentAntInputLineIdx}. Skipping.`);
            virtualFinalPositions[currentAntLogicalIndex] = 0; // Assign a default/fallback position
            continue;
        }

        const currentAnt = {
            position: currentAntRawState[0],
            direction: currentAntRawState[1]
        };

        // --- Collision Impact Calculation (for first ant's identity shift) ---
        // This block determines how many times the *first ant* effectively "swaps places"
        // with the *current ant* being processed. Each swap contributes to `identityShiftCounter`.
        let calculatedCollisionTime;

        // Scenario 1: First ant moves right (direction 2), Current ant moves left (direction 1)
        if (firstAnt.direction === 2 && currentAnt.direction === 1) {
            if (firstAnt.position < currentAnt.position) {
                // First ant is 'behind' current ant. They will meet by first ant circling the track.
                calculatedCollisionTime = (trackLen + firstAnt.position - currentAnt.position) / 2;
            } else {
                // First ant is 'ahead' of current ant. They will meet directly.
                calculatedCollisionTime = (firstAnt.position - currentAnt.position) / 2;
            }

            if (calculatedCollisionTime >= 0 && calculatedCollisionTime <= effectiveSimulationTime) {
                // If a collision event occurs within the simulation time
                identityShiftCounter = (identityShiftCounter + antCount) % antCount; // Ensure positive modulo result
                // Check for a second collision after a full lap (if time permits)
                if (calculatedCollisionTime + trackLen / 2 <= effectiveSimulationTime) {
                    identityShiftCounter = (identityShiftCounter - 2 + antCount) % antCount;
                } else {
                    identityShiftCounter = (identityShiftCounter - 1 + antCount) % antCount;
                }
            }
        }
        // Scenario 2: First ant moves left (direction 1), Current ant moves right (direction 2)
        else if (firstAnt.direction === 1 && currentAnt.direction === 2) {
            if (firstAnt.position > currentAnt.position) {
                // First ant is 'ahead' of current ant. They will meet by current ant circling the track.
                calculatedCollisionTime = (trackLen - firstAnt.position + currentAnt.position) / 2;
            } else {
                // First ant is 'behind' current ant. They will meet directly.
                calculatedCollisionTime = (currentAnt.position - firstAnt.position) / 2;
            }

            if (calculatedCollisionTime >= 0 && calculatedCollisionTime <= effectiveSimulationTime) {
                // If a collision event occurs within the simulation time
                // Check for a second collision after a full lap
                if (calculatedCollisionTime + trackLen / 2 <= effectiveSimulationTime) {
                    identityShiftCounter = (identityShiftCounter + 2) % antCount;
                } else {
                    identityShiftCounter = (identityShiftCounter + 1) % antCount;
                }
            }
        }
        // If ants move in the same direction or away from each other, their relative order doesn't change
        // in a way that affects the first ant's identity shift, so `identityShiftCounter` remains unchanged.

        // --- Calculate Virtual Final Position for the Current Ant ---
        // This is the position if the ant moved for `effectiveSimulationTime` without any interaction.
        let finalCalculatedPosition;
        if (currentAnt.direction === 1) { // Direction 1: Moves right (positive increment)
            finalCalculatedPosition = currentAnt.position + effectiveSimulationTime;
        } else { // Direction 2: Moves left (negative increment)
            finalCalculatedPosition = currentAnt.position - effectiveSimulationTime;
        }
        virtualFinalPositions[currentAntLogicalIndex] = normalizePosition(finalCalculatedPosition, trackLen);
    }

    // Store the virtual final position of the *original* first ant before sorting the entire list.
    const firstAntVirtualFinalPosition = virtualFinalPositions[0];

    // Sort all virtual final positions. This gives us the final locations available on the track,
    // regardless of which ant occupies them.
    virtualFinalPositions.sort((posA, posB) => posA - posB);

    // Find the index of the `firstAntVirtualFinalPosition` within the sorted list.
    // This gives us a reference point in the sorted array.
    let firstAntReferenceSortedIndex = findInsertionPoint(virtualFinalPositions, 0, antCount, firstAntVirtualFinalPosition);

    // --- Final Assignment: Map Sorted Virtual Positions to Actual Ant Identities ---
    // Create the array that will hold the final positions for each ant in their original order.
    const actualFinalPositions = new Array(antCount);

    // Iterate through the original ant indices (0 to antCount-1).
    // The ant that *originally started at index `k`* will end up at the position
    // determined by `firstAntReferenceSortedIndex` offset by `identityShiftCounter`.
    for (let outputArrayIndex = 0; outputArrayIndex < antCount; ++outputArrayIndex) {
        actualFinalPositions[identityShiftCounter] = virtualFinalPositions[firstAntReferenceSortedIndex];

        // Increment indices, ensuring they wrap around the array length using modulo.
        firstAntReferenceSortedIndex = (firstAntReferenceSortedIndex + 1) % antCount;
        identityShiftCounter = (identityShiftCounter + 1) % antCount;
    }

    // Output the final positions, each on a new line.
    console.log(actualFinalPositions.join('\n'));
}

// Entry point for the program: Read input from standard input and execute the simulation.
// This setup is typical for competitive programming environments.
simulateAntsOnTrack(require("fs").readFileSync("/dev/stdin", "utf8"));