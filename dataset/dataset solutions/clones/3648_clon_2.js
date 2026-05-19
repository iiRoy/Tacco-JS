let inputStr; // Variable to hold the input line read from standard input
let finalCount = 0; // Accumulator for the total count of valid subsequences

let charArray; // Stores the input string as an array of characters
const targetChars = ["A", "B", "C"]; // The specific characters forming the target subsequence

const moduloVal = 1000000007; // The modulo constant (10^9 + 7) for calculations

// Import the 'readline' module for handling input
const standardReadline = require('readline');

// Create an interface for reading input line by line
const inputReader = standardReadline.createInterface({
    input: process.stdin, // Read from standard input stream
    output: process.stdout, // Output to standard output stream (not directly used for printing here)
});

// Event listener for when a line of input is received
inputReader.on('line', function (currentLine) {
    inputStr = currentLine; // Assign the received line to our input string variable
});

// Event listener for when the input stream is closed
inputReader.on('close', function () {
    charArray = inputStr.split(""); // Split the input string into an array of individual characters
    exploreCombinations(0, []); // Begin the recursive depth-first search to generate combinations
    console.log(finalCount); // Print the final accumulated count to the console
});

/**
 * Recursively explores all possible combinations of characters for the input string,
 * replacing '?' with 'A', 'B', or 'C'.
 * @param {number} currentIndex - The current index in the character array being processed.
 * @param {string[]} currentCombination - The array representing the current character combination.
 */
function exploreCombinations(currentIndex, currentCombination) {
    // Base case: If we have processed all characters in the input string
    if (currentIndex === charArray.length) {
        calculateSubsequences(currentCombination); // Calculate the number of subsequences for this complete combination
        return; // Terminate this recursive branch
    }

    // Check if the current character is a wildcard '?'
    if (charArray[currentIndex] === "?") {
        // If it's a '?', try all three possibilities ('A', 'B', 'C')
        currentCombination[currentIndex] = "A";
        exploreCombinations(currentIndex + 1, currentCombination); // Recurse with 'A'

        currentCombination[currentIndex] = "B";
        exploreCombinations(currentIndex + 1, currentCombination); // Recurse with 'B'

        currentCombination[currentIndex] = "C";
        exploreCombinations(currentIndex + 1, currentCombination); // Recurse with 'C'
    } else {
        // If it's a fixed character, just use it and continue
        currentCombination[currentIndex] = charArray[currentIndex];
        exploreCombinations(currentIndex + 1, currentCombination); // Recurse with the fixed character
    }
}

/**
 * Calculates the number of "ABC" subsequences within a given character combination using dynamic programming.
 * @param {string[]} currentCombination - The character combination to analyze.
 */
function calculateSubsequences(currentCombination) {
    // Initialize a 2D dynamic programming array.
    // dynamicProgression[i][j] will store the count of subsequences of targetChars[0...j] ending at index i.
    const dynamicProgression = Array(charArray.length).fill(null).map(() => Array(3).fill(0));

    // Base case for the first character of the subsequence ('A')
    if (currentCombination[0] === targetChars[0]) {
        dynamicProgression[0][0] = 1; // If the first character is 'A', we have one 'A' subsequence
    }

    // Fill the DP table for the first character of the subsequence ('A')
    for (let idx = 1; idx < charArray.length; idx++) {
        if (currentCombination[idx] === targetChars[0]) {
            // If current char is 'A', it can form a new 'A' subsequence or extend previous 'A' subsequences
            dynamicProgression[idx][0] = dynamicProgression[idx - 1][0] + 1;
        } else {
            // If not 'A', carry over the count from the previous position
            dynamicProgression[idx][0] = dynamicProgression[idx - 1][0];
        }
    }

    // Initialize the first row for the second and third target characters ('B' and 'C') to 0,
    // as they cannot start a subsequence at index 0.
    for (let idx = 1; idx < targetChars.length; idx++) {
        dynamicProgression[0][idx] = 0;
    }

    // Fill the DP table for the remaining subsequence characters ('B' and 'C')
    for (let subsequenceIdx = 1; subsequenceIdx < 3; subsequenceIdx++) {
        const charOccurrences = {}; // Tracks occurrences of characters for the current subsequence part
        for (let idx = 1; idx < charArray.length; idx++) {
            // Ensure the counter exists for the current character in the combination
            if (charOccurrences[currentCombination[idx]] === undefined) {
                charOccurrences[currentCombination[idx]] = 0;
            }

            // If the current character matches the target character for this subsequence part (e.g., 'B' for subsequenceIdx=1)
            // AND there's a valid count from the previous subsequence part (e.g., 'A' for subsequenceIdx-1)
            if (currentCombination[idx] === targetChars[subsequenceIdx] && dynamicProgression[idx - 1][subsequenceIdx - 1] !== 0) {
                // The count is the sum of:
                // 1. The count of previous subsequences ending at idx-1 (e.g., "A" ending at idx-1)
                // 2. The number of times the current character has appeared before in this combination (for this subsequence part)
                dynamicProgression[idx][subsequenceIdx] = (dynamicProgression[idx - 1][subsequenceIdx - 1] + charOccurrences[currentCombination[idx]]);
                charOccurrences[currentCombination[idx]]++; // Increment count for this character
            } else {
                // Otherwise, carry over the value from the previous position for this subsequence part
                dynamicProgression[idx][subsequenceIdx] = dynamicProgression[idx - 1][subsequenceIdx];
            }
        }
    }

    // Add the count of "ABC" subsequences (which is dynamicProgression[charArray.length - 1][2])
    // to the total final count, applying modulo to the value being added.
    finalCount += (dynamicProgression[charArray.length - 1][2] % moduloVal);
}
