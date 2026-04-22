/**
 * Expert Code Clone Generation: Type III Clone
 *
 * This version of the code implements the same core logic as the original,
 * but with extensive modifications to exemplify a Type III clone.
 *
 * Key changes include:
 * - Renaming all identifiers for clarity and to avoid direct lexical similarity (Type II).
 * - Rewriting comments and reformatting whitespace (Type II).
 * - Replacing variable declarations (`var`) with modern `const` and `let` (Type III - update).
 * - Refactoring array destructuring instead of individual index assignments (Type III - update/delete).
 * - Introducing a `Map` for directional transformations in `adjustDiceOrientation` for better organization and extensibility (Type III - add/update).
 * - Utilizing `Set` objects for efficient storage and lookup of unique dice configurations, replacing plain objects with `hasOwnProperty` checks (Type III - update/add).
 * - Serializing dice states using `JSON.stringify` for consistent `Set` keys (Type III - add).
 * - Encapsulating the complex sequence of orientation changes and rotational checks into a dedicated helper function `exploreAllOrientationsAndRotations` (Type III - add/restructure).
 * - Introducing input validation and error handling for robustness (Type III - add).
 * - Using a global boolean flag `finalVerificationStatus` for the overall result (Type III - update).
 * - Adding early exit conditions to optimize processing when a duplicate is found (Type III - add).
 */

// Global configuration and status storage
// This Set will store stringified representations of all unique dice configurations encountered so far.
const globalKnownConfigurations = new Set();
// This boolean flag tracks whether all dice instances processed are unique.
// true indicates "Yes" (all unique), false indicates "No" (a duplicate was found).
let finalVerificationStatus = true;

/**
 * Transforms a dice configuration based on a given directional command.
 * The dice faces are represented as a 6-element array:
 * [top, north, east, west, south, bottom]
 *
 * @param {string} command - The direction to move ('N', 'S', 'E', 'W').
 * @param {number[]} currentLayout - The current 6-element array representing dice faces.
 * @returns {number[]} A new 6-element array representing the dice faces after the move.
 * @throws {Error} If an invalid direction command or layout is provided.
 */
function adjustDiceOrientation(command, currentLayout) {
    // Guard clause for invalid input array structure
    if (!Array.isArray(currentLayout) || currentLayout.length !== 6 || currentLayout.some(isNaN)) {
        throw new Error("Invalid dice layout provided. Expected an array of 6 numbers.");
    }

    // Deconstruct current faces for clarity, using descriptive names
    const [faceTop, faceNorth, faceEast, faceWest, faceSouth, faceBottom] = currentLayout;

    // Define transformation rules using a Map for readability, extensibility, and direct lookup.
    // Each entry maps a direction command to the new dice configuration.
    const transformationMap = new Map([
        // Moving North: North face becomes Top, Top face becomes South, Bottom becomes North, South becomes Bottom.
        ['N', [faceNorth, faceBottom, faceEast, faceWest, faceTop, faceSouth]],
        // Moving South: South face becomes Top, Top face becomes North, Bottom becomes South, North becomes Bottom.
        ['S', [faceSouth, faceTop, faceEast, faceWest, faceBottom, faceNorth]],
        // Moving East: West face becomes Top, Top face becomes East, Bottom becomes West, East becomes Bottom.
        ['E', [faceWest, faceNorth, faceTop, faceBottom, faceSouth, faceEast]],
        // Moving West: East face becomes Top, Top face becomes West, Bottom becomes East, West becomes Bottom.
        ['W', [faceEast, faceNorth, faceBottom, faceTop, faceSouth, faceWest]]
    ]);

    const nextLayout = transformationMap.get(command);

    // Guard clause for unknown direction commands
    if (!nextLayout) {
        throw new Error(`Unknown direction command: ${command}. Expected 'N', 'S', 'E', or 'W'.`);
    }

    return nextLayout;
}

/**
 * Rotates the dice clockwise along its current top-bottom axis.
 * The top and bottom faces remain the same, but the North, East, South, West faces shift.
 *
 * @param {number[]} currentLayout - The current 6-element array representing dice faces.
 * @returns {number[]} A new 6-element array representing the dice faces after rotation.
 * @throws {Error} If an invalid layout is provided.
 */
function spinDiceClockwise(currentLayout) {
    // Guard clause for invalid input array structure
    if (!Array.isArray(currentLayout) || currentLayout.length !== 6 || currentLayout.some(isNaN)) {
        throw new Error("Invalid dice layout for rotation. Expected an array of 6 numbers.");
    }

    // Deconstruct faces using descriptive names
    // [top, north, east, west, south, bottom]
    const [fTop, fNorth, fEast, fWest, fSouth, fBottom] = currentLayout;

    // Clockwise rotation rule: North -> East, East -> South, South -> West, West -> North
    // Top and Bottom faces remain fixed during this rotation.
    const rotatedLayout = [fTop, fWest, fNorth, fSouth, fEast, fBottom];

    return rotatedLayout;
}

/**
 * Explores all 4 rotational permutations of a given dice configuration
 * and checks them against the `globalKnownConfigurations` set.
 * If any permutation is already known, it updates the `finalVerificationStatus` to false.
 * Otherwise, it adds all 4 permutations to the global set.
 *
 * @param {number[]} baseConfiguration - The initial 6-element dice configuration.
 * @returns {boolean} True if a duplicate (already seen configuration) was found among the current permutations, false otherwise.
 */
function processDicePermutations(baseConfiguration) {
    // If a duplicate has already been detected globally, we can skip further checks for efficiency.
    if (!finalVerificationStatus) {
        return true; // Indicate that a duplicate state has already been found
    }

    // Create a mutable copy of the base configuration to apply rotations
    let currentDiceState = [...baseConfiguration];

    // Iterate four times to generate all four rotational permutations around the current top face.
    for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
        // Serialize the current dice state into a string for consistent storage and comparison in the Set.
        const serializedState = JSON.stringify(currentDiceState);

        // Check if this specific permutation has been globally encountered before.
        if (globalKnownConfigurations.has(serializedState)) {
            finalVerificationStatus = false; // A duplicate was found, update global status.
            return true; // Immediately indicate that a duplicate was found.
        }

        // If not a duplicate, add this unique permutation to the global set.
        globalKnownConfigurations.add(serializedState);

        // Apply a clockwise rotation to get the next permutation for the next iteration.
        currentDiceState = spinDiceClockwise(currentDiceState);
    }

    return false; // No duplicate was found among these 4 permutations.
}

/**
 * Encapsulates the logic to explore all 24 unique orientations and their 4 rotations
 * for a given dice instance. This covers all possible physical states of a single die.
 *
 * @param {number[]} initialDiceState - The initial configuration of the dice for a test case.
 * @returns {boolean} True if a duplicate configuration is found across all orientations/rotations, false otherwise.
 */
function exploreAllOrientationsAndRotations(initialDiceState) {
    // Create a working copy of the dice state for manipulation within this function.
    let currentDiceInstance = [...initialDiceState];

    // Phase 1: Explore orientations by rotating the dice "North" 4 times.
    // This sequence effectively cycles through 4 different faces becoming the 'top' face
    // while keeping the 'East' and 'West' faces relatively consistent.
    // The top faces explored here are (original Top, North, Bottom, South).
    for (let orientationCycle = 0; orientationCycle < 4; orientationCycle++) {
        // Process the current orientation and its 4 rotations.
        // If a duplicate is found, propagate the signal immediately.
        if (processDicePermutations(currentDiceInstance)) {
            return true; // Duplicate found
        }
        // Change the dice orientation by moving 'North'.
        currentDiceInstance = adjustDiceOrientation("N", currentDiceInstance);
    }
    // After this loop, 'currentDiceInstance' is effectively back to its initial top-bottom axis orientation,
    // ready for the next phase of moves.

    // Phase 2: Change the top face to the original 'East' face.
    currentDiceInstance = adjustDiceOrientation("E", currentDiceInstance);
    // Process this new orientation and its 4 rotations.
    if (processDicePermutations(currentDiceInstance)) {
        return true; // Duplicate found
    }

    // Phase 3: Change the top face to the original 'West' face.
    // From the state where 'East' is top, moving 'South' twice will bring 'West' to the top.
    currentDiceInstance = adjustDiceOrientation("S", currentDiceInstance);
    currentDiceInstance = adjustDiceOrientation("S", currentDiceInstance);
    // Process this final orientation and its 4 rotations.
    if (processDicePermutations(currentDiceInstance)) {
        return true; // Duplicate found
    }

    // If no duplicates were found across all 24 orientations and rotations for this dice instance.
    return false;
}

// --- Main Program Execution ---

// Read raw input from standard input as a string.
const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: trim leading/trailing whitespace and split into individual lines.
const inputLines = rawDataInput.trim().split("\n");

// The first line contains the number of test cases. Parse it as an integer.
const numberOfTestCases = parseInt(inputLines.shift(), 10);

// Input validation: Ensure the number of test cases is a valid non-negative number.
if (isNaN(numberOfTestCases) || numberOfTestCases < 0) {
    console.error("Error: Invalid number of test cases provided in the input.");
    process.exit(1); // Exit with an error code
}

// Iterate through each problem statement (dice instance).
for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    // Optimization: If a duplicate dice has already been found in a previous iteration,
    // there's no need to process subsequent dice instances.
    if (!finalVerificationStatus) {
        break;
    }

    // Parse the current dice configuration from the input line.
    // Each line is expected to contain 6 space-separated numbers.
    const currentDiceConfiguration = inputLines[caseIndex]
                                    .split(" ")
                                    .map(Number);

    // Input validation: Check if the parsed configuration is valid (6 numbers).
    if (currentDiceConfiguration.length !== 6 || currentDiceConfiguration.some(isNaN)) {
        console.error(`Error: Invalid dice configuration on input line ${caseIndex + 2}. Expected 6 numbers.`);
        finalVerificationStatus = false; // Mark as an error, which implies "No"
        break; // Stop processing further cases
    }

    // Explore all possible orientations and rotations for the current dice instance.
    // The `exploreAllOrientationsAndRotations` function will update `finalVerificationStatus`
    // if a duplicate is detected among its permutations.
    exploreAllOrientationsAndRotations(currentDiceConfiguration);
}

// Output the final result based on the global status flag.
// If `finalVerificationStatus` is true, it means all dice were unique ("Yes").
// Otherwise, a duplicate was found ("No").
console.log(finalVerificationStatus ? "Yes" : "No");