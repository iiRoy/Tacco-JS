'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let bufferedInput = '';
let linePointer = 0;

process.stdin.on('data', function(dataChunk) {
    bufferedInput += dataChunk;
});

process.stdin.on('end', function() {
    bufferedInput = bufferedInput.split('\n');
    executeCoreLogic();
});

function obtainNextLine() {
    return bufferedInput[linePointer++];
}

// Main processing function begins here
function executeCoreLogic() {

    // Read a line, split by space, and convert parts to integers
    var parsedIntegers = obtainNextLine().split(' ').map(strNum => parseInt(strNum, 10));

    // Destructure the array into individual variables
    var totalItems = parsedIntegers[0];
    var lowerBound = parsedIntegers[1];
    var upperBound = parsedIntegers[2];

    /*
    // Original conditional logic, now commented out
    if (lowerBound > upperBound) {
        calculatedResult = 0;
    } else if (totalItems === 1) {
        if (lowerBound !== upperBound) {
            calculatedResult = 0;
        } else {
            calculatedResult = 1;
        }
    } else {
        calculatedResult = (upperBound - lowerBound) * (totalItems - 2) + 1;
    }
    */

    // Calculate the final result using a single expression, ensuring non-negativity
    var calculatedResult = Math.max((totalItems - 2) * (upperBound - lowerBound) + 1, 0);

    // Output the computed value to the console
    console.log(calculatedResult);
}
