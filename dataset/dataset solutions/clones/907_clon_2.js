var numElements; // Stores the count of input strings
var stringArray = []; // Holds the input strings
var pairArray = []; // Stores processed balance pairs for each string

/**
 * Processes a string to determine its balance characteristics.
 * A pair [open_needed, close_available] is returned.
 * open_needed: number of opening parentheses needed to balance prefixes.
 * close_available: number of closing parentheses that can be matched.
 * @param {string} inputStr The string to simplify.
 * @returns {number[]} An array [open_needed, close_available].
 */
function processString(inputStr) {
    // balanceCounters[0] = needed open parens, balanceCounters[1] = available close parens
    var balanceCounters = [0, 0];
    // Iterate through each character of the input string
    iterateRange(inputStr.length, function(idx) {
        if (inputStr.charAt(idx) === '(') {
            // If an opening parenthesis is found, increment available close parens
            ++balanceCounters[1];
        } else {
            // If a closing parenthesis is found
            if (balanceCounters[1] > 0) {
                // If there's an available opening parenthesis to match, decrement it
                --balanceCounters[1];
            } else {
                // Otherwise, this closing parenthesis needs an opening one, increment needed open parens
                ++balanceCounters[0];
            }
        }
    });
    return balanceCounters;
}

/**
 * Main execution function for the program.
 * Reads input, processes strings, sorts them, and determines if a valid sequence can be formed.
 */
function executeProgram() {
    numElements = readNumber(); // Get the number of strings
    // Read all input strings
    iterateRange(numElements, function(idx) {
        stringArray[idx] = readToken();
    });

    // Process each string to get its balance pair
    iterateRange(numElements, function(idx) {
        pairArray[idx] = processString(stringArray[idx]);
    });

    // Sort the pairs based on a custom comparison logic
    // Prioritize pairs that reduce the balance (more closing than opening)
    // Then, for equal balance changes, prioritize those that require fewer opening parens
    pairArray.sort(function(firstPair, secondPair) {
        var diffA = firstPair[1] - firstPair[0]; // Balance change for first pair
        var diffB = secondPair[1] - secondPair[0]; // Balance change for second pair
        if (diffA !== diffB) {
            return diffB - diffA; // Sort descending by balance change
        }
        return secondPair[0] - firstPair[0]; // Sort descending by needed open parens
    });

    var currentBalance = 0; // Tracks the current balance of parentheses
    var isPossible = true; // Flag to indicate if a valid sequence is found

    // Attempt to combine the strings in the sorted order
    iterateRange(numElements, function() {
        var wasUpdated = false; // Flag to check if any pair was successfully added in this pass
        iterateRange(numElements, function(idx) {
            // If the pair hasn't been used yet and current balance can cover its needed open parens
            if (pairArray[idx] !== null && currentBalance >= pairArray[idx][0]) {
                // Update the current balance
                currentBalance += (pairArray[idx][1] - pairArray[idx][0]);
                pairArray[idx] = null; // Mark this pair as used
                wasUpdated = true; // Indicate that an update occurred
                return false; // Break from inner loop to re-evaluate with updated balance
            }
        });
        if (!wasUpdated) {
            // If no pair could be added in a pass, it's not possible to form a valid sequence
            isPossible = false;
            return false; // Break from outer loop
        }
    });
    // Output 'Yes' if possible and the final balance is zero, otherwise 'No'
    outputResult(isPossible && currentBalance === 0 ? 'Yes' : 'No');
}

/**
 * A generic loop utility function.
 * @param {number} startVal The starting index (inclusive).
 * @param {number} endVal The ending index (exclusive).
 * @param {Function} callbackFn The function to call for each iteration.
 *                              If it returns false, the loop breaks.
 */
function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (var idx = startVal; idx < endVal; ++idx) {
        if (callbackFn(idx) === false) {
            break;
        }
    }
}

// Standard input/output setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawData = ''; // Accumulates all input data
var tokenIndex = 0; // Current index for reading tokens from parsed input

/**
 * Reads and returns the next number from the parsed input.
 * @returns {number} The next number.
 */
function readNumber() {
    return +rawData[tokenIndex++];
}

/**
 * Reads and returns the next string token from the parsed input.
 * @returns {string} The next string token.
 */
function readToken() {
    return rawData[tokenIndex++];
}

/**
 * Prints a value to the console.
 * @param {*} valueToPrint The value to be printed.
 */
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

// Event listener for incoming data
process.stdin.on('data', function(chunk) {
    rawData += chunk;
});

// Event listener for end of input
process.stdin.on('end', function() {
    // Trim whitespace and split input into an array of tokens
    rawData = rawData.trim().split(/\s+/);
    executeProgram(); // Start the main program logic
});
