"use strict";

/**
 * Calculates the total number of distinct ways to arrange a sequence of colored stones.
 * This function utilizes dynamic programming to count valid configurations,
 * considering rules about how colors can be placed based on their previous occurrences.
 *
 * @param {string} rawInputString - The raw string input, typically from stdin.
 *                                  Expected format: "N C1 C2 ... CN"
 *                                  where N is the total number of stones,
 *                                  and C1...CN are their respective color identifiers.
 */
function SolveStoneColoringProblem(rawInputString) {
    // Section A: Input Parsing and Initial Data Extraction
    // First, clean up the input string by removing leading/trailing whitespace
    // and then splitting it into individual parts based on whitespace.
    const inputSegments = rawInputString.trim().split(/\s+/);

    // The very first segment is the total count of stones in the sequence.
    // We convert it to a number.
    const totalStoneCount = Number(inputSegments.shift());

    // The remaining segments represent the colors of the stones.
    // We map each string segment to its numerical representation.
    const stoneColorSequence = inputSegments.map(colorValueStr => Number(colorValueStr));

    // Section B: Handle Edge Cases and Early Exits
    // If there are no stones to arrange, there are zero ways to do so.
    if (totalStoneCount === 0) {
        console.log(0);
        return; // Exit the function early.
    }

    // Section C: Initialization of Constants and Core Data Structures
    // A large prime number used as a modulus to keep results within integer limits
    // and prevent overflow, common in combinatorial problems.
    const PRIME_MODULO = 1000000007;

    // This array will store our dynamic programming states.
    // `waysToArrange[i]` will hold the count of distinct arrangements for stones from index 0 to `i`.
    const waysToArrange = new Array(totalStoneCount);

    // A Map is used to efficiently store and retrieve the last known index
    // at which a particular color appeared.
    // Key: The color identifier (e.g., 1, 5, 200).
    // Value: The last index in the `stoneColorSequence` where this color was found.
    const lastKnownColorPosition = new Map();

    // Section D: Establish the Base Case for Dynamic Programming
    // For the very first stone at index 0, there is only one fundamental way to arrange it.
    waysToArrange[0] = 1;

    // Record the position of the color of the first stone.
    lastKnownColorPosition.set(stoneColorSequence[0], 0);

    // Section E: Iterative Calculation through the Stone Sequence
    // We begin our iteration from the second stone (index 1) up to the last stone.
    for (let currentStoneIndex = 1; currentStoneIndex < totalStoneCount; ++currentStoneIndex) {
        // Identify the color of the stone currently being processed.
        const currentStoneColor = stoneColorSequence[currentStoneIndex];

        // Retrieve the number of ways computed for the arrangement ending just before the current stone.
        const waysForPreviousStone = waysToArrange[currentStoneIndex - 1];

        // Check if the current color has appeared previously in the sequence,
        // and if so, get the index of its most recent occurrence.
        const previousOccurrenceIndex = lastKnownColorPosition.get(currentStoneColor);

        // Section F: Apply Dynamic Programming Recurrence Relation
        // There are two primary scenarios for calculating `waysToArrange[currentStoneIndex]`:

        // Scenario 1: The current color is entirely new (first appearance)
        // OR the current color is identical to the stone immediately preceding it.
        if (previousOccurrenceIndex === undefined || previousOccurrenceIndex === currentStoneIndex - 1) {
            // In this scenario, the current stone simply extends the existing arrangements
            // without creating new branching possibilities related to its past occurrences.
            // Thus, the number of ways remains the same as for the previous stone.
            waysToArrange[currentStoneIndex] = waysForPreviousStone;
        }
        // Scenario 2: The current color has appeared before, and it is NOT the immediately preceding stone.
        else {
            // Here, we have two distinct ways to form arrangements ending at `currentStoneIndex`:
            // Option 1: Treat the `currentStoneColor` as a new, independent color.
            //           The number of ways is simply `waysForPreviousStone`.
            // Option 2: Connect the `currentStoneColor` back to its previous occurrence.
            //           The number of ways for this path is `waysToArrange[previousOccurrenceIndex]`.
            const waysFromLastMatch = waysToArrange[previousOccurrenceIndex];

            // Sum these two possibilities and apply the modulo to keep the result within bounds.
            waysToArrange[currentStoneIndex] = (waysForPreviousStone + waysFromLastMatch) % PRIME_MODULO;
        }

        // Section G: Update the Last Known Position Map
        // After processing the current stone's arrangements, update its most recent position
        // in the map for future calculations.
        lastKnownColorPosition.set(currentStoneColor, currentStoneIndex);
    }

    // Section H: Output the Final Result
    // The final answer, representing the total distinct ways to arrange all stones,
    // is stored at the last index of the `waysToArrange` array.
    console.log(waysToArrange[totalStoneCount - 1]);
}

// This is the standard entry point for competitive programming in Node.js.
// It reads the entire content of standard input, converts it to a string,
// and then passes it to our primary problem-solving function.
SolveStoneColoringProblem(require("fs").readFileSync("/dev/stdin", "utf8"));