var inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var dataStore;
var receivedLines = [];

inputProcessor.on('line', function(singleLine){
    receivedLines.push(singleLine);
});

inputProcessor.on('close', function() {
    dataStore = initializeParser(receivedLines);
    console.error('\n'); // Output a newline for console formatting

    var startTime = Date.now();
    ExecutePrimaryLogic();
    var elapsedTime = Date.now() - startTime;

    logError('duration : ' + elapsedTime + 'ms');
    logError('memory_usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

// Creates a deep duplicate of an object or Set structure.
function deepCopy(sourceObject) {
    if (sourceObject instanceof Set) {
        return new Set(Array.from(sourceObject));
    } else {
        return JSON.parse(JSON.stringify(sourceObject));
    }
}

// Retrieves the next input token and casts it to an integer.
function retrieveInteger() {
    return convertInput(getNextToken(), 1);
}

// Retrieves the next input token and splits it into a string array.
function retrieveStringArray() {
    return convertInput(getNextToken(), 2);
}

// Retrieves the next input token, splits it, and converts elements to numbers.
function retrieveIntegerArray() {
    return convertInput(getNextToken(), 4);
}

// Retrieves the next input token and splits it into individual characters.
function retrieveCharacterArray() {
    return convertInput(getNextToken(), 6);
}

// Fetches the subsequent data token from the global data store.
function getNextToken() {
    return dataStore.getNext();
}

// Verifies if there are additional tokens available for processing.
function hasMoreTokens() {
    return dataStore.hasMore();
}

// Sets up the input parsing mechanism with the provided array of input lines.
function initializeParser(inputData) {
    return {
        tokenList : inputData,
        currentIndex : 0,
        maximumIndex : inputData.length,

        // Checks for the existence of further input items.
        hasMore : function() {
            return (this.currentIndex < this.maximumIndex);
        },

        // Retrieves the next input item and advances the pointer.
        getNext : function() {
            if (this.hasMore()) {
                return this.tokenList[this.currentIndex++];
            } else {
                throw 'DataRetrievalError: No further input available';
            }
        }
    };
}

// Outputs a given result to the standard console.
function printOutput(result) {
    console.log(result);
}

// Dispatches a debugging or tracing message to the error stream.
function logError(message) {
    console.error('trace:' + require('util').inspect(message, false, null));
}

// This function performs various data type conversions based on the specified type code.
// conversionType descriptions:
// 1: Parses input as an integer.
// 2: Splits a string by spaces into an array of strings.
// 4: Splits a string by spaces and maps elements to numbers.
// 6: Splits a string into an array of single characters.
// 7: Splits a string into characters and maps them to numbers.
// 8: Joins array elements with a space character.
// 9: Joins array elements with a newline character.
// 0: Joins array elements without any separator.
// Default: Returns the original input value unchanged.
function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(' ');
            case 4:
                return inputValue.split(' ').map(Number);
            case 6:
                return inputValue.split('');
            case 7:
                return inputValue.split('').map(Number);
            case 8:
                return inputValue.join(' ');
            case 9:
                return inputValue.join('\n');
            case 0:
                return inputValue.join('');
            default:
                return inputValue;
        }
    } catch (error) {
        return inputValue;
    }
}

// -----------------------------------------------------------------------------------
// Main application logic begins here.

// Solves the primary problem by calculating optimal jumps.
function ExecutePrimaryLogic() {
    var firstLineData = retrieveIntegerArray();
    var totalSteps = firstLineData[0];
    var maxJump = firstLineData[1];
    var stepSequence = getNextToken();

    var resultPath = [];
    var currentPosition = totalSteps;

    // Loop until the starting point (0) is reached or an impossible state is identified.
    while (true) {
        logError(currentPosition); // Log the current location for debugging.

        var isValidMoveFound = false;
        var optimalJumpDistance = 0;
        var attemptCount = 0;

        // Iterate backwards from the current position to find the furthest valid jump.
        for (let stepIndex = currentPosition - 1;
             stepIndex > (currentPosition - maxJump - 1) && stepIndex >= 0;
             stepIndex--)
        {
            attemptCount++; // Count how many steps back we've checked.
            if (stepSequence[stepIndex] === "0") {
                isValidMoveFound = true;
                optimalJumpDistance = attemptCount; // Store the distance of this valid jump.
            }
        }

        currentPosition -= optimalJumpDistance; // Move the current position by the found jump distance.

        // If no valid step was found within the allowed jump range.
        if (!isValidMoveFound) {
            printOutput(-1); // Indicate failure.
            return; // Exit the function.
        } else {
            resultPath.push(optimalJumpDistance); // Record the successful jump distance.
        }

        // Check if the starting point has been reached.
        if (currentPosition === 0) {
            break; // Terminate the loop.
        }
    }

    // Sort the collected path in reverse order.
    resultPath.sort(function() { return -1; });
    // Output the final path as a space-separated string.
    printOutput(convertInput(resultPath, 8));
}