/*
 * This script processes a series of strings, analyzing their parenthesis balance.
 * It determines if a specific transformation can be applied successfully.
 */

// Declare a variable to hold the total number of items to process.
var      itemCount;

// An array to store the initial string inputs.
var stringInputs = [ ];

// An array to store the calculated balance pairs for each string.
var balancePairs = [ ] ;


/**
 * @function calculateBalance
 * @param {string} inputString - The string to analyze for parenthesis balance.
 * @returns {number[]} An array containing two numbers:
 *                     [0] - count of unmatched opening parentheses on the left.
 *                     [1] - count of unmatched closing parentheses on the right.
 */
function calculateBalance(inputString)
{
    // Initialize a local array to track the balance.
    // [0] represents unmatched '(', [1] represents unmatched ')'
    var currentBalance = [0, 0];

    // Iterate through each character of the provided string.
    iterateWithBreak(inputString.length, function(charIndex) {
        // If the current character is an opening parenthesis...
        if ( inputString.charAt(charIndex) === '(' )
        {
            // Increment the count of unmatched opening parentheses.
            ++currentBalance[1] ;
        }
        else // If the character is a closing parenthesis...
        {
            // If there's an open parenthesis that can be matched...
            if ( currentBalance[1] > 0 )
            {
                // Decrement the count of unmatched opening parentheses.
                --currentBalance[1];
            }
            else // Otherwise, this is an unmatched closing parenthesis.
            {
                // Increment the count of unmatched closing parentheses on the left.
                ++currentBalance[0];
            }
        }
    });
    // Return the final balance counts.
    return currentBalance;
}



/**
 * @function executeProcessing
 * This is the main entry point for the program logic.
 * It orchestrates input reading, processing, sorting, and final validation.
 */
function executeProcessing( )
{
    // Read the total count of items from the input.
    itemCount = readNumericToken();

    // Populate the stringInputs array with string tokens.
    iterateWithBreak(itemCount, function(idx) {
        stringInputs[idx] = readTextToken();
    });
    
    // Calculate balance pairs for each string and store them.
    iterateWithBreak(itemCount, function(idx) {
        balancePairs[idx] = calculateBalance(stringInputs[idx]);
    });

    /*
     * Sort the balancePairs array based on a custom comparison logic.
     * This logic prioritizes pairs that are "more balanced" or have
     * specific unmatched characteristics.
     */
    balancePairs.sort(function(firstPair, secondPair) {
        // Calculate the difference between unmatched left and right parentheses for the first pair.
        var firstDiff = firstPair[1] - firstPair[0];
        // Calculate the difference for the second pair.
        var secondDiff = secondPair[1] - secondPair[0];

        // Special handling for cases where both differences are negative (more unmatched right parentheses).
        if (firstDiff < 0 && secondDiff < 0) {
            // If the number of unmatched right parentheses are equal, compare based on the difference.
            if (firstPair[0] === secondPair[0]) {
                return secondDiff - firstDiff; // Sort in descending order of difference.
            }
            else {
                // Otherwise, sort by the number of unmatched right parentheses in descending order.
                return secondPair[0] - firstPair[0];
            }
        }
        // For other cases, sort by the difference in descending order.
        return secondDiff - firstDiff;
    });

    // Display the sorted balance pairs (for debugging or intermediate output).
    displayOutput(balancePairs);

    // Initialize a running score and a flag for overall possibility.
    var currentScore = 0;
    var isPossible = true;

    // Outer loop: Try to process each item.
    iterateWithBreak(itemCount, function() {
        var wasUpdated = false; // Flag to track if any item was processed in the inner loop.
        
        // Inner loop: Find an item that can be processed.
        iterateWithBreak(itemCount, function(idx) {
            /*
             * If the current item is not null (hasn't been processed yet)
             * AND the current score is greater than or equal to its unmatched left parentheses count...
             */
            if (balancePairs[idx] !== null && currentScore >= balancePairs[idx][0]) {
                // Update the score by adding the net balance of the current item.
                currentScore += (balancePairs[idx][1] - balancePairs[idx][0]);
                // Mark this item as processed.
                balancePairs[idx] = null;
                wasUpdated = true; // Indicate that an update occurred.
                return false;      // Break out of the inner loop (found an item to process).
            }
        });

        // If no item was processed in the inner loop, it means we're stuck.
        if (!wasUpdated) {
            isPossible = false;   // Mark the overall process as impossible.
            return false;         // Break out of the outer loop.
        }
    });
    // Display the final result: 'Yes' if possible and final score is zero, 'No' otherwise.
    displayOutput(isPossible && currentScore === 0 ? 'Yes' : 'No');
}


/**
 * @function iterateWithBreak
 * A flexible loop function that allows for a custom start, end, and callback.
 * It also supports breaking the loop early by returning `false` from the callback.
 * @param {number} startValue - The starting index of the loop (inclusive).
 * @param {number|Function} endValueOrCallback - If a number, it's the exclusive end index.
 *                                               If a function, it's the callback and startValue is 0.
 * @param {Function} [callbackFn] - The function to call for each iteration.
 */
function iterateWithBreak(startValue, endValueOrCallback, callbackFn) {
    // Check if the callback function is not provided, implying default startValue of 0.
    if (callbackFn === undefined) {
        callbackFn = endValueOrCallback; // The second argument is actually the callback.
        endValueOrCallback = startValue; // The first argument is actually the end value.
        startValue = 0;                  // Default start value is 0.
    }
    // Loop from the start value up to (but not including) the end value.
    for (var loopCounter = startValue; loopCounter < endValueOrCallback; ++loopCounter) {
        // Execute the callback function. If it returns false, break the loop.
        if (callbackFn(loopCounter) === false) {
            break;
        }
    }
}
 
// Configure standard input for reading data.
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
// Global variable to accumulate all incoming raw input.
var rawInputData = '';
// Pointer to track the current position in the processed input array.
var dataPointer = 0;
 
/**
 * @function readNumericToken
 * Reads and parses the next token from the input as a number.
 * @returns {number} The parsed numeric value.
 */
function readNumericToken() {
    return +rawInputData[dataPointer++];
}

/**
 * @function readTextToken
 * Reads the next token from the input as a string.
 * @returns {string} The raw string token.
 */
function readTextToken() {
    return rawInputData[dataPointer++];
}
 
/**
 * @function displayOutput
 * Prints the given value to the console.
 * @param {*} outputValue - The value to be printed.
 */
function displayOutput(outputValue) {
    console.log(outputValue);
}
 
// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function(dataChunk) {
    rawInputData += dataChunk; // Append the chunk to the accumulated input data.
});

// Event listener for the end of standard input.
process.stdin.on('end', function() {
    // Trim whitespace and split the entire input into an array of tokens.
    rawInputData = rawInputData.trim().split(/\s+/);
    // Execute the main program logic.
    executeProcessing();
});