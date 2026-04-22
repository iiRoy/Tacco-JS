/**
 * Processes a list of input rows to determine which standard playing cards were NOT mentioned.
 * It first initializes a full deck of cards, then marks cards mentioned in the input as 'seen'.
 * Finally, it prints all cards that remain 'unseen'.
 * @param {string[]} incomingDataRows - An array of strings, where each string (except the first)
 *                                    represents a card that has been 'seen'.
 */
function processCardData(incomingDataRows) {
  // Use a Map for better performance and flexibility over a plain object,
  // to store the availability status of each card in a standard deck.
  const deckStatus = new Map();

  // Define the standard suits and ranks for a playing card deck.
  const suitAbbreviations = ['S', 'H', 'C', 'D']; // Spades, Hearts, Clubs, Diamonds
  const minRankValue = 1; // Ace
  const maxRankValue = 13; // King

  // Helper function to create a consistent card identifier string.
  const createCardKey = (suitChar, rankNum) => `${suitChar} ${rankNum}`;

  // Step 1: Populate the deckStatus Map with all possible cards, initially marking them as available (true).
  for (let currentSuitIndex = 0; currentSuitIndex < suitAbbreviations.length; currentSuitIndex++) {
    const currentSuitAbbr = suitAbbreviations[currentSuitIndex];
    for (let currentRank = minRankValue; currentRank <= maxRankValue; currentRank++) {
      const cardIdentifier = createCardKey(currentSuitAbbr, currentRank);
      deckStatus.set(cardIdentifier, true); // Card is present in the initial deck
    }
  }

  // Add a simple guard clause for empty input data beyond the first (optional) header line.
  if (!incomingDataRows || incomingDataRows.length < 2) {
    // If there's no data beyond the (potential) first line, all cards are "unseen".
    // The original code would proceed and print all cards if lines.length <= 1.
    // We maintain that behavior by allowing the final loop to run if this guard isn't met.
    // If this guard *is* met, it means no cards were marked as false, so all will be printed.
  } else {
    // Step 2: Iterate through the input rows (starting from the second row, as per original logic)
    // and mark the mentioned cards as 'seen' (false) in our deckStatus.
    // The first line is typically a count, which the original code ignores.
    for (let rowIndex = 1; rowIndex < incomingDataRows.length; rowIndex++) {
      const inputCardString = incomingDataRows[rowIndex].trim(); // Remove leading/trailing whitespace

      // Only attempt to mark cards that actually exist in our predefined deck.
      // This prevents errors or unexpected behavior from malformed input.
      if (inputCardString && deckStatus.has(inputCardString)) {
        deckStatus.set(inputCardString, false); // Mark this card as 'seen' or 'used'
      }
    }
  }

  // Step 3: Iterate through the final state of the deckStatus Map.
  // Any card that is still marked as 'true' was not mentioned in the input and should be printed.
  for (const [cardKey, isStillAvailable] of deckStatus.entries()) {
    if (isStillAvailable) {
      console.log(cardKey);
    }
  }
}

// --- Standard input handling below ---

// An array to accumulate all incoming data chunks from standard input.
const receivedDataParts = [];

// Event listener for incoming data. Each time a piece of data is received,
// it's pushed into our accumulation array.
process.stdin.on('data', (dataFragment) => {
  receivedDataParts.push(dataFragment);
});

// Event listener for the 'end' of standard input.
// Once all data has been received, we process it.
process.stdin.on('end', () => {
  // Concatenate all data fragments into a single string.
  const completeInputString = receivedDataParts.join('');
  // Split the entire input string by newline characters to get individual rows.
  // Filter out any empty strings that might result from trailing newlines.
  const parsedInputLines = completeInputString.split('\n').filter(line => line.trim() !== '');

  // Invoke the main processing function with the prepared input lines.
  // Add an extra check for completely empty input to prevent calling with an empty array if filter removes all.
  if (parsedInputLines.length > 0) {
    processCardData(parsedInputLines);
  } else {
    // If no meaningful input was provided, we can optionally log a message or handle it.
    // For this clone, we'll let processCardData handle the empty input scenario gracefully
    // (it will just print all cards if incomingDataRows.length < 2).
    processCardData([]); // Call with an empty array to match original behavior for no input.
  }
});