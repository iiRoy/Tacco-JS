(function (rawDataContent) {
  // Normalize input: trim any leading/trailing whitespace (including newlines)
  // and then split the content into individual lines, representing distinct hands.
  const dataEntries = rawDataContent.trim().split('\n');
  const numberOfEntries = dataEntries.length;

  // Process each line (hand) from the input data.
  // We use a standard for loop with an index to iterate through the entries
  // without modifying the original 'dataEntries' array, unlike 'shift()'.
  for (let entryIndex = 0; entryIndex < numberOfEntries; entryIndex++) {
    const currentEntryLine = dataEntries[entryIndex];

    // Basic input validation: skip lines that are empty or contain only whitespace.
    if (!currentEntryLine || currentEntryLine.trim() === '') {
      console.log('Skipped empty or invalid input line.');
      continue; // Move to the next entry
    }

    // Parse the comma-separated string into an array of numbers.
    // Includes an inline validation to ensure all components are valid numbers.
    const numericValues = currentEntryLine.split(',').map(item => {
      const parsedNum = Number(item.trim());
      // If a non-numeric value is encountered, log a warning and return null
      // to filter it out later.
      if (isNaN(parsedNum)) {
        console.warn(`Warning: Found non-numeric value "${item.trim()}" in line "${currentEntryLine}".`);
        return null;
      }
      return parsedNum;
    }).filter(val => val !== null); // Remove any nulls resulting from invalid number parsing.

    // A valid poker hand typically consists of exactly 5 cards (numbers).
    // If the parsed input does not match this, it's considered an invalid hand.
    if (numericValues.length !== 5) {
      console.log('Invalid hand: Requires exactly 5 numbers. Result: null');
      continue; // Move to the next entry
    }

    // Generate a frequency map for the numbers in the current hand.
    // This Map stores each unique number as a key and its occurrence count as the value.
    const valueFrequencies = new Map();
    for (const cardValue of numericValues) {
      valueFrequencies.set(cardValue, (valueFrequencies.get(cardValue) || 0) + 1);
    }

    // Group the numbers by their frequency count.
    // 'frequenciesGrouped' is an array where the index represents the frequency,
    // and the value at that index is an array of numbers that appeared with that frequency.
    // Example: [undefined, [1, 5], [2, 3]] means 1 and 5 appeared once, 2 and 3 appeared twice.
    const frequenciesGrouped = [];
    for (const [value, count] of valueFrequencies.entries()) {
      if (!frequenciesGrouped[count]) {
        frequenciesGrouped[count] = []; // Initialize array if this frequency count is new
      }
      frequenciesGrouped[count].push(value);
    }

    // Evaluate the type of the current hand based on its frequency distribution
    // and output the determined hand type.
    console.log(evaluatePokerHand(frequenciesGrouped));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input stream

/**
 * Determines if a sorted array of 5 unique numbers constitutes a straight.
 * Handles both standard consecutive straights and the specific Ace-high straight (1, 10, 11, 12, 13).
 *
 * @param {number[]} sortedUniqueNumbers - An array of 5 unique, numerically sorted card values.
 * @returns {boolean} True if the numbers form a straight, false otherwise.
 */
function isFiveCardStraight(sortedUniqueNumbers) {
  // A straight must consist of exactly 5 unique cards.
  if (sortedUniqueNumbers.length !== 5) {
    return false;
  }

  // Check for the specific "Ace-high" straight: [1, 10, 11, 12, 13].
  // This pattern is explicitly checked to match the original code's behavior for such hands.
  if (sortedUniqueNumbers[0] === 1 && sortedUniqueNumbers[1] === 10 &&
      sortedUniqueNumbers[2] === 11 && sortedUniqueNumbers[3] === 12 &&
      sortedUniqueNumbers[4] === 13) {
    return true;
  }

  // Check for a standard consecutive straight (e.g., [2,3,4,5,6] or [9,10,11,12,13]).
  for (let idx = 0; idx < 4; idx++) {
    if (sortedUniqueNumbers[idx] + 1 !== sortedUniqueNumbers[idx + 1]) {
      return false; // If any two consecutive cards are not sequential, it's not a standard straight.
    }
  }
  return true; // If all checks pass, it's a standard consecutive straight.
}

/**
 * Evaluates a given card distribution to identify the poker hand type.
 * The evaluation proceeds in a specific order, from strongest to weakest hands,
 * to ensure correct classification (e.g., a Full House is not misclassified as Three of a Kind).
 *
 * @param {Array<Array<number>>} distributionByFrequency - An array where `distributionByFrequency[n]`
 *   contains an array of card values that appeared `n` times in the hand.
 * @returns {string} A string describing the identified poker hand (e.g., 'four card', 'full house', 'null').
 */
function evaluatePokerHand(distributionByFrequency) {
  // Initial validation: ensure the input distribution is a valid array.
  if (!distributionByFrequency || !Array.isArray(distributionByFrequency)) {
    return 'null'; // Return 'null' for invalid input distribution.
  }

  // Use descriptive constants for better readability and to avoid direct magic number indexing.
  const hasQuadruplet = !!distributionByFrequency[4]; // Presence of four cards of the same rank.
  const hasTriplet = !!distributionByFrequency[3];   // Presence of three cards of the same rank.
  const hasPair = !!distributionByFrequency[2];       // Presence of at least one pair.
  const countOfPairs = distributionByFrequency[2] ? distributionByFrequency[2].length : 0; // Number of distinct pairs.
  const hasSingletons = !!distributionByFrequency[1]; // Presence of cards appearing only once.
  const countOfSingletons = distributionByFrequency[1] ? distributionByFrequency[1].length : 0; // Number of unique single cards.

  // 1. Check for Four of a Kind (e.g., AAAA, K)
  if (hasQuadruplet) {
    return 'four card';
  }

  // 2. Check for Full House (e.g., AAA, BB) - requires both a triplet and a pair.
  if (hasTriplet && hasPair) {
    return 'full house';
  }

  // 3. Check for Straight (five unique, consecutive cards).
  // This condition specifically applies when all five cards are unique (i.e., five singletons).
  if (hasSingletons && countOfSingletons === 5) {
    // Collect and sort the unique card values to check for consecutiveness.
    const uniqueAndSortedCards = distributionByFrequency[1].map(Number).sort((valA, valB) => valA - valB);

    // Original code's specific "null" condition: If the lowest card is 10 or higher,
    // it cannot form a 5-card straight within typical card values (e.g., 1-13).
    // For example, [10,11,12,13,14] would be invalid as '14' is not a standard card.
    // This acts as an early exit for hands that are too high to be a valid straight.
    if (uniqueAndSortedCards[0] > 9) {
      return 'null';
    }

    // Utilize the helper function to determine if the sorted unique cards form a straight.
    if (isFiveCardStraight(uniqueAndSortedCards)) {
      return 'straight';
    }
  }

  // 4. Check for Three of a Kind (e.g., AAA, B, C) - if not already part of a Full House.
  if (hasTriplet) {
    return 'three card';
  }

  // 5. Check for Two Pair (e.g., AA, BB, C) - requires exactly two distinct pairs.
  if (hasPair && countOfPairs === 2) {
    return 'two pair';
  }

  // 6. Check for One Pair (e.g., AA, B, C, D) - if not already part of a Full House or Two Pair.
  if (hasPair) {
    return 'one pair';
  }

  // If none of the above poker hand types are found, the hand is classified as 'null' (high card hand).
  return 'null';
}