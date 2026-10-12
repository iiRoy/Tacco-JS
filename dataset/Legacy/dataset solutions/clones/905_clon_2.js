let countOfStrings; // Stores the total number of input strings
let stringCollection = []; // Array to hold the input strings
let balancePairs = []; // Array to store the calculated balance for each string

/**
 * Calculates the balance of parentheses for a given string.
 * A balance is represented as an array [unmatched_open, unmatched_close].
 * For example, "())(" would result in [1, 1] (one unmatched open, one unmatched close).
 *
 * @param {string} inputStr The string to analyze.
 * @returns {number[]} An array [unmatched_open, unmatched_close].
 */
function calculateBalance(inputStr) {
    let currentBalance = [0, 0]; // [unmatched_open_needed, unmatched_close_available]

    // Iterate through each character of the input string
    iterateRange(inputStr.length, function(idx) {
        if (inputStr.charAt(idx) === '(') {
            // If an opening parenthesis is found, increment the available close count
            ++currentBalance[1];
        } else {
            // If a closing parenthesis is found
            if (currentBalance[1] > 0) {
                // If there's an available opening parenthesis to match, use it
                --currentBalance[1];
            } else {
                // Otherwise, this is an unmatched closing parenthesis
                ++currentBalance[0];
            }
        }
    });
    return currentBalance;
}

/**
 * Main function to process the input and determine the result.
 */
function processInput() {
    countOfStrings = readNumber(); // Read the number of strings
    
    // Read all strings into the collection
    iterateRange(countOfStrings, function(idx) {
        stringCollection[idx] = readString();
    });
    
    // Calculate the balance for each string
    iterateRange(countOfStrings, function(idx) {
        balancePairs[idx] = calculateBalance(stringCollection[idx]);
    });

    let currentOpenBalance = 0; // Represents the current balance of open parentheses
    let resultFlag = true; // Flag to track if a valid sequence can be formed

    // Attempt to process all strings in a specific order
    iterateRange(countOfStrings, function() {
        let wasUpdated = false; // Flag to check if any string was processed in this iteration

        // Find a string that can be processed with the current balance
        iterateRange(countOfStrings, function(idx) {
            // Check if the string is not yet processed and its required open parentheses
            // can be satisfied by the current balance
            if (balancePairs[idx] !== null && currentOpenBalance >= balancePairs[idx][0]) {
                // Update the current balance by adding the net balance of the processed string
                currentOpenBalance += (balancePairs[idx][1] - balancePairs[idx][0]);
                balancePairs[idx] = null; // Mark this string as processed
                wasUpdated = true;
                return false; // Break the inner loop to start a new outer iteration
            }
        });

        // If no string could be processed in this iteration, it's impossible to form a valid sequence
        if (!wasUpdated) {
            resultFlag = false;
            return false; // Break the outer loop
        }
    });

    // Output the final result based on the flag and the final balance
    outputValue(resultFlag && currentOpenBalance === 0 ? 'Yes' : 'No');
}

/**
 * A utility function for iterating through a range.
 * Can be called with (end, callback) or (start, end, callback).
 *
 * @param {number} startVal The starting index (or end if only two arguments).
 * @param {number} endVal The ending index (exclusive).
 * @param {Function} callbackFn The function to call for each iteration.
 */
function iterateRange(startVal, endVal, callbackFn) {
    // Handle the case where startVal is omitted (defaults to 0)
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    // Loop from startVal up to (but not including) endVal
    for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
        // If the callback returns false, break the loop
        if (callbackFn(loopIndex) === false) {
            break;
        }
    }
}
 
// Standard input/output setup for Node.js
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputData = ''; // Accumulates all input chunks
let inputDataPointer = 0; // Pointer to the current position in the processed input array
 
/**
 * Reads the next number from the processed input array.
 * @returns {number} The parsed number.
 */
function readNumber() {
    return +rawInputData[inputDataPointer++];
}

/**
 * Reads the next string from the processed input array.
 * @returns {string} The string.
 */
function readString() {
    return rawInputData[inputDataPointer++];
}
 
/**
 * Prints a value to the console.
 * @param {*} valueToPrint The value to be printed.
 */
function outputValue(valueToPrint) {
    console.log(valueToPrint);
}
 
// Event listener for incoming data chunks
process.stdin.on('data', function(chunk) {
    rawInputData += chunk;
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
    // Trim whitespace and split the input into an array of strings
    rawInputData = rawInputData.trim().split(/\s+/);
    processInput(); // Start the main processing logic
});
