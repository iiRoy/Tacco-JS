function processInputData(rawInputString) {
    // This routine is designed to process an input string containing two integer values,
    // separated by a single space character. The objective is to determine a specific
    // combinatorial sum based on these two numerical inputs.
    //
    // The problem context implies that the first integer (let's call it 'A') represents
    // a quantity of items that behave like 'even' numbers in a sum, and the second
    // integer (let's call it 'B') represents a quantity of items that behave like
    // 'odd' numbers.
    //
    // We are interested in finding the total count of ordered pairs (x, y) such that
    // if x and y were numbers, their sum (x + y) would be even.
    // This condition holds true if:
    //   1. Both x and y are 'even' items (Even + Even = Even)
    //   2. Both x and y are 'odd' items (Odd + Odd = Even)
    //
    // Pairs of (Even, Odd) or (Odd, Even) would result in an odd sum, so they are excluded.

    // First, divide the incoming string into its constituent parts using the space delimiter.
    const stringComponents = rawInputString.split(" ");

    // Convert the first string component to an integer, representing the count of 'even-like' items.
    // Explicitly using base 10 for parsing to ensure correct interpretation.
    const countOfEvenItems = parseInt(stringComponents[0], 10);

    // Convert the second string component to an integer, representing the count of 'odd-like' items.
    // Again, base 10 is specified for parsing consistency.
    const countOfOddItems = parseInt(stringComponents[1], 10);

    /**
     * Calculates the number of ordered pairs that can be selected from a given count of items.
     * If the count is less than 2, it's impossible to form a pair, so 0 is returned.
     * Otherwise, for 'n' items, there are 'n' choices for the first item and 'n-1' choices
     * for the second distinct item.
     *
     * @param {number} totalItems The total number of items available for selection.
     * @returns {number} The count of possible ordered pairs.
     */
    const computeOrderedPairCombinations = (totalItems) => {
        // A minimum of two items is required to form an ordered pair.
        if (totalItems < 2) {
            return 0; // No pairs can be formed from fewer than two items.
        }
        // The formula for ordered pairs (n * (n-1)) is applied.
        return totalItems * (totalItems - 1);
    };

    // Determine the number of ordered pairs that can be formed exclusively from 'even-like' items.
    const evenItemPairs = computeOrderedPairCombinations(countOfEvenItems);

    // Determine the number of ordered pairs that can be formed exclusively from 'odd-like' items.
    const oddItemPairs = computeOrderedPairCombinations(countOfOddItems);

    // The final result is the sum of ordered pairs from 'even' items and 'odd' items,
    // as these are the only scenarios that yield an 'even' sum type.
    const finalResultantCount = evenItemPairs + oddItemPairs;

    // Output the calculated total to the standard console.
    console.log(finalResultantCount);
}

// The following declaration ensures compatibility with standard competitive programming environments.
// It reads the entire input from '/dev/stdin' (standard input) as a UTF-8 string
// and then invokes the primary processing function with this data.
// This specific line should not be altered as per problem constraints.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));