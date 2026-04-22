/*
 * This JavaScript module processes a series of operations on a dynamic sequence of elements.
 * It reads configuration and commands from standard input.
 * Each command modifies the sequence based on specific rules.
 */

// Define constants for various character markers and special values used in the sequence.
const emptyIndicator = 0;       // Represents an empty slot in the sequence.
const boundaryMarker = "X";     // Marks the artificial boundaries of the sequence.
const alphaChar = "A";          // Specific marker character 'A'.
const betaChar = "B";           // Specific marker character 'B'.
const gammaChar = "C";          // Specific marker character 'C'.
const deltaChar = "D";          // Specific marker character 'D'.
const replacementChar = "#";    // Character used to represent empty slots in the final output.

/*
 * This routine attempts to fill the first available empty slot
 * within the sequence (excluding boundary markers) with a specified character.
 *
 * @param {string} markSymbol - The character to be placed in an empty slot.
 */
function placeFirstMarker(markSymbol) {
    // Iterate through the sequence from the second element up to the second-to-last.
    // These indices correspond to the actual data, ignoring the 'X' sentinels.
    for (var currentPos = 1; currentPos < valueSequence.length - 1; currentPos++) {
        // If an empty slot is found (indicated by emptyIndicator),
        // fill it with the provided markSymbol and then terminate the function.
        if (valueSequence[currentPos] == emptyIndicator) {
            valueSequence[currentPos] = markSymbol;
            return;
        }
    }
}

/*
 * This function attempts to place the 'B' marker in a specific empty slot
 * based on conditions involving its neighbors, scanning from right to left.
 * If no such slot is found, it defaults to using the general 'placeFirstMarker' function.
 */
function fillAdjacentSpace() {
    // Scan the sequence from right to left, starting from the second-to-last
    // element and ending at the second element, effectively skipping the boundary markers.
    for (var idxBackward = valueSequence.length - 2; idxBackward >= 1; idxBackward--) {
        // Check for a specific pattern:
        // 1. The element immediately preceding the current position is NOT 'A'.
        // 2. The current position itself IS empty.
        // 3. The element immediately succeeding the current position is NOT 'A'.
        if (valueSequence[idxBackward - 1] != alphaChar && valueSequence[idxBackward] == emptyIndicator && valueSequence[idxBackward + 1] != alphaChar) {
            valueSequence[idxBackward] = betaChar; // If conditions met, place 'B' marker.
            return; // Exit the function immediately after placing the marker.
        }
    }
    // If the loop completes without placing a 'B' marker (i.e., no suitable slot found),
    // fall back to placing 'B' in the first available empty slot using the general routine.
    placeFirstMarker(betaChar);
}

/*
 * This routine attempts to extend existing markers by placing a 'C' marker
 * into an adjacent empty slot. If no extension is possible, it places 'C'
 * at a calculated central position.
 */
function extendMarksAround() {
    // Iterate through the main part of the sequence, excluding the boundary markers.
    for (var iterIndex = 1; iterIndex < valueSequence.length - 1; iterIndex++) {
        // First condition: If the current slot is not empty AND the next slot IS empty,
        // place 'C' in the next slot.
        if (valueSequence[iterIndex] != emptyIndicator && valueSequence[iterIndex + 1] == emptyIndicator) {
            valueSequence[iterIndex + 1] = gammaChar;
            return; // Operation completed, exit.
        }
        // Second condition: If the current slot is not empty AND the previous slot IS empty,
        // place 'C' in the previous slot.
        if (valueSequence[iterIndex] != emptyIndicator && valueSequence[iterIndex - 1] == emptyIndicator) {
            valueSequence[iterIndex - 1] = gammaChar;
            return; // Operation completed, exit.
        }
    }

    // If the loop finishes without placing a 'C' (i.e., no extension was possible),
    // place 'C' at a position relative to the middle of the original sequence length.
    if (arrayLength % 2 == 1) {
        // For odd-length sequences, place 'C' just after the center.
        valueSequence[(arrayLength - 1) / 2 + 1] = gammaChar;
    } else {
        // For even-length sequences, place 'C' just after the first of the two center elements.
        valueSequence[arrayLength / 2 + 1] = gammaChar;
    }
}

/*
 * Identifies the largest contiguous empty segment within the sequence
 * that is bounded by boundary markers ('X') or existing 'ABCD' markers.
 * It then places a 'D' marker in the starting position of this largest gap.
 * If no such gap is found, it defaults to placing 'D' in the first available empty slot.
 */
function locateLargestGap() {
    // `maxGapRecord` stores information about the largest gap found so far:
    // [index_of_the_start_of_the_gap, length_of_the_gap].
    var maxGapRecord = [0, 0];

    // Regular expression to test for any of the existing marker characters (A, B, C, D).
    const markerPattern = /[ABCD]/;

    // Iterate through the sequence, skipping the artificial boundary markers.
    for (var outerLoopIdx = 1; outerLoopIdx < valueSequence.length - 1; outerLoopIdx++) {
        // If the current position is not empty, it cannot be the start of a new empty gap,
        // so skip to the next position.
        if (valueSequence[outerLoopIdx] != emptyIndicator) {
            continue;
        }

        // Initialize pointers and a counter for the current potential empty segment.
        var leftScanPtr = outerLoopIdx;
        var rightScanPtr = outerLoopIdx;
        var currentGapSize = 0;

        // Expand outwards from the current empty slot to find its boundaries.
        while (true) {
            // Move the left pointer inwards if it hasn't hit a boundary marker.
            if (valueSequence[leftScanPtr] != boundaryMarker) {
                leftScanPtr--;
            }
            // Move the right pointer outwards if it hasn't hit a boundary marker.
            if (valueSequence[rightScanPtr] != boundaryMarker) {
                rightScanPtr++;
            }

            // If both pointers have reached boundary markers ('X'),
            // it means the current segment's extent has been fully determined by 'X's.
            if (valueSequence[leftScanPtr] == boundaryMarker && valueSequence[rightScanPtr] == boundaryMarker) {
                break; // Stop expanding for this segment.
            }

            // Check if either pointer has encountered an existing 'ABCD' marker.
            // If so, this segment is bounded by an existing marker, not just empty space.
            if (markerPattern.test(valueSequence[leftScanPtr]) || markerPattern.test(valueSequence[rightScanPtr])) {
                break; // Stop expanding if an existing marker is hit.
            }

            currentGapSize++; // Increment the size of the current empty gap.

            // Update the `maxGapRecord` if the current gap is larger than any found previously.
            if (maxGapRecord[1] < currentGapSize) {
                maxGapRecord = [outerLoopIdx, currentGapSize];
            }
        }
    }

    // After checking all possible starting points for gaps:
    // If a significant gap was found (i.e., its length is not 0),
    // place the 'D' marker at the recorded starting index of that gap.
    if (maxGapRecord[1] != 0) {
        valueSequence[maxGapRecord[0]] = deltaChar;
        return;
    }
    // If no significant gap was found (maxGapRecord[1] is still 0),
    // fall back to placing 'D' in the first available empty slot using the general routine.
    placeFirstMarker(deltaChar);
}

// Node.js specific code to read all input from standard input synchronously.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into an array of lines.
var processedLines = fileContent.trim().split("\n");

// Global declaration for the main sequence and its length, accessible by the functions above.
// These will be re-initialized for each test case.
var valueSequence;
var arrayLength;

// Main program loop: continues indefinitely until a specific termination condition is met.
while (true) {
    // Read the first line of the current input block, which contains N and M.
    // Split it by space, then convert both parts to numbers.
    var configParameters = processedLines.shift().split(" ").map(Number);
    arrayLength = configParameters[0];      // N: The number of elements in the array (excluding sentinels).
    var operationCount = configParameters[1];   // M: The number of operations to perform.

    // Termination condition: If both N and M are 0, exit the loop and end the program.
    if (arrayLength == 0 && operationCount == 0) {
        break;
    }

    // Initialize the main data sequence for the current test case.
    // It will contain `arrayLength` number of `emptyIndicator`s.
    valueSequence = [];
    for (var loopCounter = 0; loopCounter < arrayLength; loopCounter++) {
        valueSequence.push(emptyIndicator);
    }

    // Add artificial boundary markers ('X') to the start and end of the sequence.
    // These help simplify boundary checks in the processing functions.
    valueSequence.unshift(boundaryMarker);
    valueSequence.push(boundaryMarker);

    // Execute 'M' operations as specified by the input commands.
    for (var loopCounter = 0; loopCounter < operationCount; loopCounter++) {
        // Read the current command string (e.g., "A", "B", "C", "D").
        var commandString = processedLines.shift();

        // Call the appropriate function based on the command.
        if (commandString == alphaChar) {
            placeFirstMarker(alphaChar);
        }
        if (commandString == betaChar) {
            fillAdjacentSpace();
        }
        if (commandString == gammaChar) {
            extendMarksAround();
        }
        if (commandString == deltaChar) {
            locateLargestGap();
        }
    }

    // After all operations, remove the temporary boundary markers from the sequence.
    valueSequence.shift(); // Remove the leading 'X'.
    valueSequence.pop();   // Remove the trailing 'X'.

    // Join the remaining elements of the sequence into a single string,
    // then replace all `emptyIndicator`s (which are `0`) with the `replacementChar` ('#').
    // Finally, print the resulting string to the console.
    console.log(valueSequence.join("").replace(new RegExp(emptyIndicator, 'g'), replacementChar));
}