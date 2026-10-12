var parseInteger = val => parseInt(val, 10);

var parseIntegerArray = inputArray => inputArray.map(element => parseInteger(element));

var absoluteValue = numberValue => numberValue > 0 ? numberValue : -numberValue;

function findMinimum() {
    var argsCollection = arguments;
    var currentMin = argsCollection[0];
    for (var idx = 1; idx < argsCollection.length; idx++) {
        if (argsCollection[idx] < currentMin) {
            currentMin = argsCollection[idx];
        }
    }
    return currentMin;
}

function findMaximum() {
    var argsCollection = arguments;
    var currentMax = argsCollection[0];
    for (var idx = 1; idx < argsCollection.length; idx++) {
        if (argsCollection[idx] > currentMax) {
            currentMax = argsCollection[idx];
        }
    }
    return currentMax;
}

function calculateGCD() {
    var argsCollection = arguments;
    var resultGCD = argsCollection[0];

    // Helper function for calculating GCD of two numbers
    var recursiveGCD = (numA, numB) => numB ? recursiveGCD(numB, numA % numB) : numA;

    for (var idx = 1; idx < argsCollection.length; idx++) {
        resultGCD = recursiveGCD(resultGCD, argsCollection[idx]);
    }
    return resultGCD;
}

// Execute the main processing function with input from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Main function to process the input data and compute the result.
 * @param {string} rawData - The raw input string read from stdin.
 */
function ProcessInput(rawData) {
    // Split the input string into an array of lines
    var lines = rawData.split('\n');

    // Parse the first line to get the count of numbers
    var count = parseInteger(lines[0]);

    // Initialize an array to store the numbers
    var numberArray = [];

    // Populate the number array by parsing subsequent lines
    for (var loopIndex = 0; loopIndex < count; loopIndex++) {
        numberArray[loopIndex] = parseInteger(lines[loopIndex + 1]);
    }

    // Sort the array of numbers in ascending order
    numberArray.sort((valA, valB) => valA - valB);

    // Initialize two sum variables for calculation
    var sumX = 0;
    var sumY = 0;

    // Check if the count of numbers is even or odd
    if (count % 2 === 0) {
        // Case: Even number of elements
        for (var iter = 0; iter < count; iter++) {
            // Accumulate sumX based on element position relative to the middle
            sumX += iter >= count / 2 ? 2 * numberArray[iter] : -2 * numberArray[iter];
        }
        // Adjust sumX with specific middle elements
        sumX += numberArray[count / 2] - numberArray[count / 2 + 1];
    } else {
        // Case: Odd number of elements
        for (var idxVal = 0; idxVal < count; idxVal++) {
            // Accumulate sumX and sumY based on element position
            sumX += idxVal >= (count - 1) / 2 ? 2 * numberArray[idxVal] : -2 * numberArray[idxVal];
            sumY += idxVal > (count - 1) / 2 ? 2 * numberArray[idxVal] : -2 * numberArray[idxVal];
        }
        // Adjust sumX with specific middle elements
        sumX -= numberArray[(count - 1) / 2] + numberArray[(count + 1) / 2];
        // Adjust sumY with specific middle elements
        sumY += numberArray[(count - 1) / 2] + numberArray[(count - 3) / 2];
    }

    // Determine the maximum of the two calculated sums
    var finalResult = findMaximum(sumX, sumY);

    // Debugging: console.log(numberArray, otherArray); // This line was commented out in the original

    // Output the final computed result to the console
    console.log(finalResult);

    // Indicate successful execution
    return 0;
}
