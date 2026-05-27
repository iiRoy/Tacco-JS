var countOfStrings;

var stringCollection = [];

var processedPairs = [];

function processStringBalance(inputStr) {
    var balanceTracker = [0, 0]; // [unmatched_closing_needed_open, unmatched_opening_needed_close]

    iterateRange(inputStr.length, function(charIndex) {
        if (inputStr.charAt(charIndex) === '(') {
            ++balanceTracker[1]; // Increment count of open parentheses that need a closing one
        } else { // Character is ')'
            if (balanceTracker[1] > 0) {
                --balanceTracker[1]; // Match an existing open parenthesis
            } else {
                ++balanceTracker[0]; // This ')' is unmatched, needs an opening one
            }
        }
    });
    return balanceTracker;
}

function executeProgram() {
    countOfStrings = readNumber();

    iterateRange(countOfStrings, function(idx) {
        stringCollection[idx] = readToken();
    });

    iterateRange(countOfStrings, function(idx) {
        processedPairs[idx] = processStringBalance(stringCollection[idx]);
    });

    processedPairs.sort(function(firstPair, secondPair) {
        var diffA = firstPair[1] - firstPair[0]; // Net balance for firstPair (open - close)
        var diffB = secondPair[1] - secondPair[0]; // Net balance for secondPair (open - close)

        if (diffA < 0 && diffB < 0) { // Both require opening parentheses
            if (firstPair[0] === secondPair[0]) {
                return diffB - diffA; // Sort by net balance difference (ascending)
            } else {
                return secondPair[0] - firstPair[0]; // Sort by required opening (descending)
            }
        }
        return diffB - diffA; // Sort by net balance difference (descending)
    });

    outputValue(processedPairs);

    var currentBalance = 0;
    var isPossible = true;

    iterateRange(countOfStrings, function() {
        var wasUpdated = false;
        iterateRange(countOfStrings, function(idx) {
            if (processedPairs[idx] !== null && currentBalance >= processedPairs[idx][0]) {
                currentBalance += (processedPairs[idx][1] - processedPairs[idx][0]);
                processedPairs[idx] = null;
                wasUpdated = true;
                return false; // Break inner loop
            }
        });
        if (!wasUpdated) {
            isPossible = false;
            return false; // Break outer loop
        }
    });
    outputValue(isPossible && currentBalance === 0 ? 'Yes' : 'No');
}

function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (var loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
        if (callbackFn(loopCounter) === false) {
            break;
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawData = '';
var dataPointer = 0;

function readNumber() {
    return +rawData[dataPointer++];
}

function readToken() {
    return rawData[dataPointer++];
}

function outputValue(val) {
    console.log(val);
}

process.stdin.on('data', function(chunk) {
    rawData += chunk;
});
process.stdin.on('end', function() {
    rawData = rawData.trim().split(/\s+/);
    executeProgram();
});
