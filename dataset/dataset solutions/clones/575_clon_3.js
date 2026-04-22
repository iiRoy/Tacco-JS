const fileSystem = require('node:fs'); // Utilize Node.js file system for input operations.

// Define a constant for the standard input path, using an alternative descriptor.
const standardInputDescriptor = '/dev/fd/0';

// Read the complete input stream, ensuring UTF-8 decoding.
const rawInputStream = fileSystem.readFileSync(standardInputDescriptor, 'utf8');

// Process the raw input:
// 1. Remove any trailing whitespace (variation from original trim()).
// 2. Split the string into an array of lines.
// 3. Convert each line string into an integer using an explicit radix for robustness.
const numericalDataChunks = rawInputStream
    .trimEnd()
    .split('\n')
    .map(lineContent => parseInt(lineContent, 10));

// Define a sentinel value that indicates the termination of input processing.
const TEST_CASE_TERMINATOR = 0;

/**
 * Processes a single set of stone data according to the game's rules.
 * @param {number[]} dataSegments - The array containing the remaining numerical input.
 * @returns {number|null} The count of zero-valued stones in the final sequence,
 *                        or null if the terminator signal is encountered.
 */
function processStoneGame(dataSegments) {
    // Extract the number of stones for the current test scenario.
    // This consumes the first element from the input array.
    const currentScenarioSize = dataSegments.shift();

    // If the extracted size matches the terminator, signal the end of all test cases.
    if (currentScenarioSize === TEST_CASE_TERMINATOR) {
        return null;
    }

    // Initialize a container for the stones in this specific scenario.
    const scenarioStones = [];
    // Populate the stone container by drawing from the input data.
    // Using a standard loop for clarity, rather than a decrementing while loop.
    for (let currentStoneIndex = 0; currentStoneIndex < currentScenarioSize; currentStoneIndex++) {
        scenarioStones.push(dataSegments.shift());
    }

    // This array will hold the dynamically constructed sequence based on game logic.
    const resultantStoneSequence = [];

    // Iterate through each stone in the current scenario to apply the rules.
    // Using a traditional for loop instead of forEach for structural variation.
    for (let originalPosition = 0; originalPosition < scenarioStones.length; originalPosition++) {
        const currentElementValue = scenarioStones[originalPosition];
        // Determine if the current stone's 0-based index is even (which corresponds to an odd 1-based position).
        const isOddGamePosition = (originalPosition % 2) === 0;
        
        if (isOddGamePosition) {
            // For odd game positions (1st, 3rd, etc.), simply add the stone.
            resultantStoneSequence.push(currentElementValue);
        } else {
            // For even game positions (2nd, 4th, etc.), more complex rules apply.
            // Retrieve the last element in the sequence, using modern array access.
            const previousElementInSequence = resultantStoneSequence.at(-1);

            // If the current stone matches the last element, extend the sequence.
            if (previousElementInSequence === currentElementValue) {
                resultantStoneSequence.push(currentElementValue);
            } else {
                // If the current stone is different, perform a 'fill' operation.
                // First, append the new distinct stone to the sequence.
                resultantStoneSequence.push(currentElementValue);

                // Define a pointer to search backwards from the second-to-last element.
                // This avoids confusion with the 'originalPosition' of the main loop.
                let backwardScanIndex = resultantStoneSequence.length - 2;
                
                // Search backwards in the sequence for the first occurrence of 'currentElementValue'.
                // Rewriting the original 'while(true)' loop into a more explicit for loop.
                for (; backwardScanIndex >= 0; backwardScanIndex--) {
                    if (resultantStoneSequence[backwardScanIndex] === currentElementValue) {
                        // Matching stone found, terminate the backward search.
                        break;
                    }
                }

                // Determine the actual starting index for the fill operation.
                // Ensure it's not negative; if no match was found, start from the beginning.
                const effectiveFillStart = Math.max(0, backwardScanIndex);

                // Execute the fill operation: overwrite elements from 'effectiveFillStart'
                // up to (but not including) the last element added, with 'currentElementValue'.
                for (let fillTargetIndex = effectiveFillStart; fillTargetIndex < resultantStoneSequence.length - 1; fillTargetIndex++) {
                    resultantStoneSequence[fillTargetIndex] = currentElementValue;
                }
            }
        }
    }

    // Count how many times the zero-valued stone appears in the final sequence.
    let zeroStoneCounter = 0;
    // Using a for...of loop for iterating over array elements.
    for (const sequenceItem of resultantStoneSequence) {
        if (sequenceItem === TEST_CASE_TERMINATOR) {
            zeroStoneCounter++;
        }
    }
    
    return zeroStoneCounter;
}

// Array to accumulate the results from all processed test cases.
const collectedResults = [];
let outcomeForCurrentCase;

// Main loop to continuously process test cases until the terminator is hit.
// The result of 'processStoneGame' directly controls the loop.
while ((outcomeForCurrentCase = processStoneGame(numericalDataChunks)) !== null) {
    collectedResults.push(outcomeForCurrentCase);
}

// Output all collected results, each on a new line, as a single console operation.
console.log(collectedResults.join('\n'));