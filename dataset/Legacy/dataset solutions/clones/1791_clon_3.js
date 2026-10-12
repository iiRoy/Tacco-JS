// This script is designed to process numerical input, typically from a standard input stream,
// to evaluate a specific condition related to positions of two entities over time.

// Utilize the Node.js file system module to interact with input sources.
const fsModule = require("node:fs");

// Define the path for standard input. In many competitive programming environments,
// '/dev/stdin' is the conventional path for reading standard input.
const standardInputPath = "/dev/stdin";

// Read the entire content of the standard input file.
// The 'utf8' encoding ensures proper interpretation of text data.
const rawContentBuffer = fsModule.readFileSync(standardInputPath, "utf8");

// Convert the buffer content to a string, remove any leading/trailing whitespace,
// and then split it into individual tokens using any sequence of whitespace characters.
// This creates a robust array of string tokens.
let inputTokenSequence = rawContentBuffer.toString().trim().split(/\s+/);

// Maintain an index to track the current position within the `inputTokenSequence` array.
let currentReadIndex = 0;

/**
 * Parses a specified number of consecutive tokens from the input sequence into numeric values.
 *
 * @param {number} count The number of tokens to extract and convert.
 * @returns {number[]} An array of numbers parsed from the input tokens.
 * @throws {Error} If there aren't enough tokens remaining in the stream.
 */
const extractAndConvertTokens = (count) => {
    // Ensure we don't attempt to read beyond the available tokens.
    if (currentReadIndex + count > inputTokenSequence.length) {
        throw new Error(`Insufficient tokens remaining to read ${count} values. Available: ${inputTokenSequence.length - currentReadIndex}`);
    }

    // Extract the relevant slice of tokens.
    const segmentToProcess = inputTokenSequence.slice(currentReadIndex, currentReadIndex + count);
    // Advance the global read index by the number of tokens processed.
    currentReadIndex += count;

    // Convert each extracted token string into a number.
    // Using Number() is a concise way to parse strings to numbers, handling both integers and floats.
    return segmentToProcess.map(strValue => Number(strValue));
};

/**
 * A utility function to standardize output.
 * @param {string} message The string to print to the console.
 */
const displayOutcome = (message) => {
    console.log(message);
};

// Retrieve the five primary numerical parameters from the input stream.
// These typically represent:
//  - initialPosOfEntityA: Starting coordinate for the first entity.
//  - speedOfEntityA: Velocity of the first entity.
//  - initialPosOfEntityB: Starting coordinate for the second entity.
//  - speedOfEntityB: Velocity of the second entity.
//  - totalSimulationDuration: The maximum time period for observation.
const [initialPosOfEntityA, speedOfEntityA, initialPosOfEntityB, speedOfEntityB, totalSimulationDuration] = extractAndConvertTokens(5);

// --- Transformed Logic for Initial Condition Check ---
// The original code included a loop to set a flag 'isSamePos':
// for (let i = 0; i < T; i++) {
//     if (A + V * i == A + W * i) {
//         isSamePos = true;
//     }
// }
// This condition simplifies to V * i == W * i.
// This equality holds true under two main circumstances:
// 1. When the time step 'i' is 0 (since V*0 == W*0 is always 0).
// 2. When velocities V and W are identical (V == W), in which case V*i == W*i for any 'i'.
//
// Consequently, if 'totalSimulationDuration' (T) is greater than 0, the loop will execute
// at least for i = 0. During this first iteration, 'V*0 == W*0' evaluates to true,
// causing 'isSamePos' to be set to true.
// If 'totalSimulationDuration' (T) is 0, the loop does not execute, and 'isSamePos' remains false.
// Therefore, the original 'isSamePos' flag is effectively true if T > 0, and false if T == 0.

// A boolean flag to represent if the initial condition (as per the original loop) was met.
let initialConditionMet = false;

// Guard clause: If the simulation duration is zero or negative, the initial condition (T > 0) is not met.
if (totalSimulationDuration <= 0) {
    // In this scenario, the original code would print 'NO' and exit.
    displayOutcome('NO');
    return; // Terminate execution early.
} else {
    // If totalSimulationDuration is positive, the original loop would have set 'isSamePos' to true.
    initialConditionMet = true;
}

// If we reach this point, it implies `initialConditionMet` is true, and `totalSimulationDuration > 0`.
// Now, calculate the final positions of both entities at the end of the `totalSimulationDuration`.
// Final Position = Initial Position + (Velocity * Time)
const finalPositionOfA = initialPosOfEntityA + speedOfEntityA * totalSimulationDuration;
const finalPositionOfB = initialPosOfEntityB + speedOfEntityB * totalSimulationDuration;

// Determine the final decision based on the comparison of the entities' final positions.
// The condition checks if entity A's final position is greater than or equal to entity B's final position.
let outcomeVerdict;
if (finalPositionOfA >= finalPositionOfB) {
    outcomeVerdict = 'YES';
} else {
    outcomeVerdict = 'NO';
}

// Output the final computed verdict.
displayOutcome(outcomeVerdict);