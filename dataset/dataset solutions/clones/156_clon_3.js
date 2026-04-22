// This script processes poker hand data provided via standard input.
// Each line of input is expected to represent a single poker hand,
// with five card ranks separated by commas (e.g., "7,7,7,2,2" or "A,K,Q,J,10").
// It determines and outputs the poker hand classification for each input line.
// For simplicity, card ranks are assumed to be numeric, where Ace can be 1 or 14
// depending on context, but here we treat '1' as Ace for the 5-high straight check.

// Helper function to sort numerical values in descending order.
const valueComparator = (firstElement, secondElement) => secondElement - firstElement;

/**
 * Determines if a given array of five card ranks constitutes a straight.
 * Assumes the input `cardRankSequence` is already sorted in descending order.
 * @param {number[]} cardRankSequence - An array of five sorted card ranks.
 * @returns {boolean} True if the hand is a straight, false otherwise.
 */
const evaluateForStraight = (cardRankSequence) => {
    // Check for a standard consecutive straight (e.g., 9,8,7,6,5).
    // The difference between the highest and lowest card must be 4.
    const isStandardConsecutive = (cardRankSequence[0] - cardRankSequence[4] === 4);

    // Check for an Ace-low straight (A,2,3,4,5).
    // Given descending sorted ranks, this would appear as [5,4,3,2,1].
    const isFiveHighStraight = (
        cardRankSequence[0] === 5 &&
        cardRankSequence[1] === 4 &&
        cardRankSequence[2] === 3 &&
        cardRankSequence[3] === 2 &&
        cardRankSequence[4] === 1
    );

    return isStandardConsecutive || isFiveHighStraight;
};

// Read all incoming data from the standard input stream.
// Decode it as UTF-8 text, then trim any extraneous whitespace.
const completeInputBuffer = require("fs").readFileSync(process.stdin.fd, "utf8").trim();

// Split the entire input into an array of individual hand strings,
// where each string corresponds to one line from the input.
const individualHandStrings = completeInputBuffer.split('\n');

// Iterate through each hand string and classify it.
individualHandStrings.forEach(function(currentHandEntry) {
    // Convert the comma-separated string of card ranks into an array of numbers.
    // Ensure each rank is parsed as an integer and trim potential whitespace.
    // Then, sort these numerical ranks in descending order.
    const processedCardRanks = currentHandEntry
        .split(',')
        .map(rankText => parseInt(rankText.trim(), 10))
        .sort(valueComparator);

    // Create a frequency map to count how many times each unique card rank appears.
    const rankFrequencyMap = new Map();
    processedCardRanks.forEach(function(singleRankValue) {
        rankFrequencyMap.set(singleRankValue, (rankFrequencyMap.get(singleRankValue) || 0) + 1);
    });

    // Extract all frequency counts from the map and sort them in descending order.
    // This allows easy identification of the highest and second-highest occurring ranks.
    const sortedFrequencyValues = Array.from(rankFrequencyMap.values()).sort(valueComparator);

    // Determine the highest and second-highest frequencies present in the hand.
    const topFrequency = sortedFrequencyValues[0];
    const nextFrequency = sortedFrequencyValues[1]; // Will be undefined if only one distinct rank

    // Initialize the hand classification to a default 'high card'.
    let finalHandCategory = "high card";

    // Classify the poker hand based on the observed frequencies.
    if (topFrequency === 4) {
        finalHandCategory = "quads"; // Four cards of the same rank
    } else if (topFrequency === 3) {
        if (nextFrequency === 2) {
            finalHandCategory = "full house"; // Three of a kind and a pair
        } else {
            finalHandCategory = "trips"; // Only three of a kind
        }
    } else if (topFrequency === 2) {
        if (nextFrequency === 2) {
            finalHandCategory = "two pair"; // Two distinct pairs
        } else {
            finalHandCategory = "a pair"; // Only one pair
        }
    } else if (topFrequency === 1) { // All five cards have distinct ranks
        // If all ranks are distinct, check if they form a straight sequence.
        if (evaluateForStraight(processedCardRanks)) {
            finalHandCategory = "straight";
        }
        // If not a straight, it remains "high card" as initially set.
    }

    // Print the determined classification for the current hand.
    console.log(finalHandCategory);
});