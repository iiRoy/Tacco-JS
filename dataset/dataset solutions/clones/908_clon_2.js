let countOfStrings;
const stringCollection = [];
const balancePairs = [];

/**
 * Calculates the balance of parentheses for a given string.
 * Returns an array [openNeeded, closeAvailable].
 * openNeeded: Number of opening parentheses required to balance the string.
 * closeAvailable: Number of closing parentheses available to balance subsequent strings.
 * @param {string} inputStr The string to analyze.
 * @returns {number[]} An array representing the balance state.
 */
function calculateBalance(inputStr) {
    // balanceArr[0] stores the count of unmatched ')' (open parentheses needed)
    // balanceArr[1] stores the count of unmatched '(' (close parentheses available)
    const balanceArr = [0, 0];

    // Iterate through each character of the input string
    iterateRange(inputStr.length, function(charIdx) {
        if (inputStr.charAt(charIdx) === '(') {
            // If an opening parenthesis is found, increment available closing count
            ++balanceArr[1];
        } else {
            // If a closing parenthesis is found
            if (balanceArr[1] > 0) {
                // If there's an available opening parenthesis, match it
                --balanceArr[1];
            } else {
                // Otherwise, this ')' is unmatched, so we need an opening parenthesis
                ++balanceArr[0];
            }
        }
    });
    return balanceArr;
}

/**
 * Main function to execute the program logic.
 * Reads input, processes strings, sorts them, and determines if they can be balanced.
 */
function executeProgram() {
    // Read the total number of strings
    countOfStrings = readNumber();

    // Read all strings into the collection
    iterateRange(countOfStrings, function(strIdx) {
        stringCollection[strIdx] = readString();
    });

    // Calculate balance for each string and store in balancePairs
    iterateRange(countOfStrings, function(strIdx) {
        balancePairs[strIdx] = calculateBalance(stringCollection[strIdx]);
    });

    // Sort the balance pairs based on a custom comparison logic
    balancePairs.sort(function(firstPair, secondPair) {
        // Calculate the net balance difference for each pair
        const diffA = firstPair[1] - firstPair[0]; // (close_available - open_needed) for firstPair
        const diffB = secondPair[1] - secondPair[0]; // (close_available - open_needed) for secondPair

        // If both strings require opening parentheses (i.e., have a negative net balance)
        if (diffA < 0 && diffB < 0) {
            // Sort by the number of open parentheses needed in descending order
            // (strings needing more open parentheses come first)
            return secondPair[0] - firstPair[0];
        }
        // Otherwise, sort by the net balance difference in descending order
        // (strings with a larger positive net balance or less negative net balance come first)
        return diffB - diffA;
    });

    // Initialize current balance and a flag for overall possibility
    let currentBalance = 0;
    let isPossible = true;

    // Iterate through the sorted balance pairs to try and combine them
    iterateRange(countOfStrings, function() {
        let didUpdate = false; // Flag to check if any string was processed in this pass

        // Inner loop to find a suitable string to process
        iterateRange(countOfStrings, function(strIdx) {
            // Check if the string hasn't been processed yet (not null)
            // and if the current balance is sufficient to cover its 'openNeeded'
            if (balancePairs[strIdx] !== null && currentBalance >= balancePairs[strIdx][0]) {
                // Update the current balance by adding its net balance
                currentBalance += (balancePairs[strIdx][1] - balancePairs[strIdx][0]);
                // Mark this string as processed
                balancePairs[strIdx] = null;
                didUpdate = true;
                // Break the inner loop as one string has been processed
                return false;
            }
        });

        // If no string could be processed in this pass, it's impossible to balance
        if (!didUpdate) {
            isPossible = false;
            // Break the outer loop
            return false;
        }
    });

    // Output the final result based on the possibility flag and final balance
    outputResult(isPossible && currentBalance === 0 ? 'Yes' : 'No');
}

/**
 * A generic utility function for iterating over a range.
 * Can be called with (end, callback) or (start, end, callback).
 * @param {number} startVal The starting index (inclusive) or the ending index (exclusive).
 * @param {number} endVal The ending index (exclusive) or the callback function.
 * @param {Function} [callbackFn] The function to call for each iteration.
 */
function iterateRange(startVal, endVal, callbackFn) {
    // Adjust parameters if only two arguments are provided
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    // Loop from startVal up to (but not including) endVal
    for (let loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
        // If the callback returns false, break the loop
        if (callbackFn(loopCounter) === false) {
            break;
        }
    }
}

// Standard input/output setup for Node.js
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawData = ''; // Accumulates all input data
let dataPointer = 0; // Pointer to the current element in the parsed input array

/**
 * Reads and returns the next number from the parsed input.
 * @returns {number} The next number.
 */
function readNumber() {
    return +rawData[dataPointer++];
}

/**
 * Reads and returns the next string from the parsed input.
 * @returns {string} The next string.
 */
function readString() {
    return rawData[dataPointer++];
}

/**
 * Prints a value to the console.
 * @param {*} valueToLog The value to be printed.
 */
function outputResult(valueToLog) {
    console.log(valueToLog);
}

// Event listener for incoming data chunks
process.stdin.on('data', function(inputChunk) {
    rawData += inputChunk;
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
    // Trim whitespace and split the input into an array of strings by any whitespace
    rawData = rawData.trim().split(/\s+/);
    // Execute the main program logic
    executeProgram();
});
