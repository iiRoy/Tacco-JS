import { readFileSync } from 'node:fs'; // Utilize modern module imports for file system operations.

// Configuration constants for the card game logic.
const CARD_DESIGNATIONS = ['S', 'H', 'C', 'D']; // Standard playing card suits.
const MINIMUM_CARD_RANK = 1; // Lowest possible rank for a card.
const MAXIMUM_CARD_RANK = 13; // Highest possible rank for a card.
const SYSTEM_INPUT_LOCATION = '/dev/stdin'; // Path for standard input stream on POSIX systems.
const LINE_BREAK_DETECTOR = /\r?\n/; // Regular expression to handle various newline characters.

/**
 * Safely retrieves and processes all lines from the designated system input file.
 * Includes robust error handling for potential file access issues.
 * @returns {string[]} An array where each element is a trimmed line from the input.
 */
function obtainSystemInputData() {
    let completeFileContent = '';
    try {
        // Synchronously read the entire content from the specified input path.
        completeFileContent = readFileSync(SYSTEM_INPUT_LOCATION, { encoding: 'utf8' });
    } catch (accessError) {
        // If an error occurs during file reading, log it and return an empty collection.
        console.error(`ERROR: Failed to read from ${SYSTEM_INPUT_LOCATION}. Reason: ${accessError.message}`);
        return [];
    }

    // Split the content into individual lines, filtering out any empty strings that might result.
    const individualLines = completeFileContent.split(LINE_BREAK_DETECTOR).filter(segment => segment.trim() !== '');
    return individualLines;
}

/**
 * Generates an ordered sequence of integer numbers within a given inclusive range.
 * @param {number} startPoint - The initial integer in the sequence.
 * @param {number} endPoint - The final integer in the sequence.
 * @returns {number[]} An array containing all integers from startPoint to endPoint.
 */
function constructIntegerSequence(startPoint, endPoint) {
    // Validate the input range to prevent logical errors.
    if (startPoint > endPoint) {
        console.warn(`WARNING: Start value (${startPoint}) exceeds end value (${endPoint}). An empty array will be returned.`);
        return [];
    }
    // A modern JavaScript approach to generate an array of numbers.
    return Array.from({ length: endPoint - startPoint + 1 }, (_, index) => index + startPoint);
}

/**
 * Formats a card's suit and rank into a standardized string representation.
 * @param {string} cardSuitSymbol - The character representing the card's suit (e.g., 'S', 'H').
 * @param {number} cardRankValue - The numerical rank of the card (e.g., 1, 13).
 * @returns {string} The formatted card string, e.g., "S 1".
 */
function renderCardDisplayString(cardSuitSymbol, cardRankValue) {
    return `${cardSuitSymbol} ${cardRankValue}`;
}

// --- Primary Application Flow ---

// Initialize the complete set of 52 playing cards.
// Each suit is represented by a Set for efficient addition and removal of ranks.
const currentPlayingCardCollection = {};
for (const suitType of CARD_DESIGNATIONS) {
    currentPlayingCardCollection[suitType] = new Set(constructIntegerSequence(MINIMUM_CARD_RANK, MAXIMUM_CARD_RANK));
}

// Fetch all lines from the standard input.
const receivedInputRecords = obtainSystemInputData();

// If the input contains only one line or less, it means there are no card removal instructions
// (assuming the first line is typically a count, which we discard).
if (receivedInputRecords.length <= 1) {
    // This condition might indicate no operations, but the program will proceed gracefully.
}

// Iterate through the input lines, starting from the second line (index 1),
// as the first line is typically a count of operations and not card data.
for (let recordIndex = 1; recordIndex < receivedInputRecords.length; recordIndex++) {
    const currentRecordLine = receivedInputRecords[recordIndex];
    const cardSpecificationParts = currentRecordLine.trim().split(' ');

    // Validate the format of the input line.
    if (cardSpecificationParts.length !== 2) {
        console.warn(`SKIPPING: Malformed input line encountered: "${currentRecordLine}". Expected format: "SUIT RANK".`);
        continue; // Move to the next input line.
    }

    const designatedSuit = cardSpecificationParts[0].toUpperCase(); // Normalize suit to uppercase.
    const designatedRankString = cardSpecificationParts[1];
    const designatedRank = parseInt(designatedRankString, 10); // Convert rank string to integer.

    // Validate the extracted suit against known card designations.
    if (!CARD_DESIGNATIONS.includes(designatedSuit)) {
        console.warn(`SKIPPING: Invalid card suit specified: "${designatedSuit}" in line: "${currentRecordLine}"`);
        continue;
    }
    // Validate the extracted rank against the acceptable range.
    if (isNaN(designatedRank) || designatedRank < MINIMUM_CARD_RANK || designatedRank > MAXIMUM_CARD_RANK) {
        console.warn(`SKIPPING: Invalid card rank specified: "${designatedRankString}" in line: "${currentRecordLine}"`);
        continue;
    }

    // Attempt to remove the identified card from the collection.
    // Set.delete() returns true if the element was present and removed, false otherwise.
    const successfulRemoval = currentPlayingCardCollection[designatedSuit].delete(designatedRank);
    if (!successfulRemoval) {
        // This log can be useful for debugging duplicate removal attempts or non-existent cards.
        // console.log(`NOTICE: Card ${designatedSuit} ${designatedRank} was not found in the deck for removal.`);
    }
}

// Prepare a container to hold all the formatted output strings.
const collectedOutputStrings = [];

// Iterate through each suit in a predefined order to ensure consistent output.
for (const suitKey of CARD_DESIGNATIONS) {
    const ranksForThisSuit = currentPlayingCardCollection[suitKey];
    
    // Convert the Set of remaining ranks to an array, then sort them numerically.
    const orderedRanks = Array.from(ranksForThisSuit).sort((rankA, rankB) => rankA - rankB);

    // For each remaining rank, format it and add to the output collection.
    orderedRanks.forEach(rank => {
        collectedOutputStrings.push(renderCardDisplayString(suitKey, rank));
    });
}

// Finally, print all collected output lines, each on a new line.
if (collectedOutputStrings.length > 0) {
    console.log(collectedOutputStrings.join('\n'));
} else {
    // This branch executes if no cards remain or no initial cards were present.
    // console.log("The deck is entirely empty or no cards were initially present.");
}