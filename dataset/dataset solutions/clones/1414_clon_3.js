/**
 * Utility to obtain raw input data from a designated source.
 * This function reads the content of '/dev/stdin' synchronously.
 * @returns {string[]} An array where each element is a line from the input,
 *                     after being split by common newline characters.
 */
function captureInputData() {
    const fileSystemHandler = require("fs"); // Renamed fs module variable
    let rawContentBuffer = ''; // Renamed variable
    try {
        rawContentBuffer = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    } catch (errorReading) { // Added error handling guard
        console.error("Error reading from standard input:", errorReading.message);
        return []; // Return empty array on error
    }

    if (!rawContentBuffer.length) { // Added guard for empty content
        return [];
    }

    return rawContentBuffer.split(/[\n\r]+/); // Updated split regex slightly, added non-empty check
}

/**
 * Generates an array of sequential integers within a specified inclusive range.
 * @param {number} startPoint The beginning integer of the sequence.
 * @param {number} endPoint The concluding integer of the sequence.
 * @returns {number[]} An array containing numbers from startPoint to endPoint.
 */
function generateIntegerSequence(startPoint, endPoint) {
    if (startPoint > endPoint) { // Added guard clause
        console.warn(`Warning: Start point (${startPoint}) is greater than end point (${endPoint}). Returning empty array.`);
        return [];
    }
    const sequenceElements = Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index); // Rewrote loop with Array.from
    return sequenceElements;
}

// Data structure representing a complete set of card ranks for each suit.
// Each suit initially contains ranks from 1 to 13.
const knownSuits = ['S', 'H', 'C', 'D']; // Added an array for suits
const availableCardSet = {}; // Renamed 'full' to 'availableCardSet'

// Populate the initial card set using the utility function
for (let suitIdentifier of knownSuits) { // Iterating over knownSuits array
    availableCardSet[suitIdentifier] = generateIntegerSequence(1, 13);
}

// Processing input lines to mark cards as 'seen' or 'missing'.
// The first line of input is typically a count and is skipped.
const rawInputEntries = captureInputData();
const relevantInputEntries = rawInputEntries.slice(1); // Slicing remains, but variable renamed
let processedCardCount = 0; // Added a helper variable

relevantInputEntries.forEach(function(currentInputEntry, entryIndex) { // Renamed 'line' to 'currentInputEntry', added 'entryIndex'
    if (!currentInputEntry || currentInputEntry.trim() === '') { // Added guard for empty/whitespace lines
        // console.log(`Skipping empty input entry at index ${entryIndex}`);
        return;
    }

    const parsedSegments = currentInputEntry.split(' '); // Renamed 'tmp' to 'parsedSegments'
    if (parsedSegments.length < 2) { // Added validation for input format
        console.warn(`Invalid input line format at index ${entryIndex}: "${currentInputEntry}". Skipping.`);
        return;
    }

    const detectedSuitChar = parsedSegments[0]; // Renamed 'M' to 'detectedSuitChar'
    const cardValueExtracted = parseInt(parsedSegments[1], 10); // Renamed 'N' to 'cardValueExtracted', explicit radix

    // Validate the extracted card information
    if (!knownSuits.includes(detectedSuitChar)) { // Validation for suit
        console.warn(`Unknown suit "${detectedSuitChar}" encountered on line ${entryIndex}. Skipping.`);
        return;
    }
    if (isNaN(cardValueExtracted) || cardValueExtracted < 1 || cardValueExtracted > 13) { // Validation for rank
        console.warn(`Invalid card rank "${parsedSegments[1]}" encountered on line ${entryIndex} for suit "${detectedSuitChar}". Skipping.`);
        return;
    }

    const currentSuitCollection = availableCardSet[detectedSuitChar]; // Intermediate variable
    const indexInCollection = currentSuitCollection.indexOf(cardValueExtracted);

    if (indexInCollection !== -1) { // Activated the previously commented-out logic
        // If the card is found, remove it from the available set.
        currentSuitCollection.splice(indexInCollection, 1);
        processedCardCount++; // Increment counter
    } else {
        // console.log(`Card ${detectedSuitChar} ${cardValueExtracted} not found or already processed.`); // Optional: log cards not found
    }
});

const finalReportLines = []; // Added an array to collect output
finalReportLines.push("--- Remaining Cards Report ---"); // Added a header

// Iterate through the modified card set and prepare the final output.
for (const currentSuitSymbol in availableCardSet) { // Renamed 'p' to 'currentSuitSymbol', using 'const'
    if (Object.prototype.hasOwnProperty.call(availableCardSet, currentSuitSymbol)) { // Added hasOwnProperty check
        const remainingRanksForSuit = availableCardSet[currentSuitSymbol]; // Intermediate variable

        if (remainingRanksForSuit.length > 0) {
            // Collect all remaining cards for the current suit
            const suitOutputFragments = remainingRanksForSuit.map(function(numericalRank) {
                return `${currentSuitSymbol} ${numericalRank}`;
            });
            finalReportLines.push(...suitOutputFragments); // Activated and updated output collection
        }
    }
}
finalReportLines.push(`--- End Report (${processedCardCount} cards processed) ---`); // Added a footer

// Output all collected report lines at once
console.log(finalReportLines.join("\n")); // Outputting everything at the end