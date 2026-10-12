"use strict";
// Acquire input data from standard input
let dataStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens and initialize a token pointer
let tokenArray = dataStream.split(/ |\n/);
let tokenIndex = 0;

// Function to retrieve a single numeric token
const retrieveNumber = () => Number(tokenArray[tokenIndex++]);

// Function to retrieve a single string token
const retrieveString = () => tokenArray[tokenIndex++];

// Function to retrieve a single BigInt token
const retrieveBigInteger = () => BigInt(tokenArray[tokenIndex++]);

// Function to retrieve an array of `itemCount` elements.
// `isText` flag determines if elements should remain strings or be converted to numbers.
const retrieveArray = (itemCount, isText) =>
    isText
        ? tokenArray.slice(tokenIndex, (tokenIndex += itemCount))
        : tokenArray.slice(tokenIndex, (tokenIndex += itemCount)).map((item) => Number(item));

// Function to retrieve a 2D array (matrix) of `rows` rows and `cols` columns.
// `isText` flag determines if elements should remain strings or be converted to numbers.
const retrieveMatrix = (rows, cols, isText) => {
    let resultMatrix = [];
    let currentRow = 0;
    if (isText) {
        for (; currentRow < rows; currentRow++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)));
        }
    } else {
        for (; currentRow < rows; currentRow++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)).map((item) => Number(item)));
        }
    }
    return resultMatrix;
};

// Function to initialize a multi-dimensional array with a default value.
// `dimensions` is a list where the first element is the default value,
// and subsequent elements are the sizes of each dimension.
const initializeMultiDimArray = (...dimensions) => {
    let dimSpec = dimensions;
    let dimCount = dimSpec.length;
    let arrayCreationString = "Array(dimSpec[" + --dimCount + "]).fill().map(element => { return " + dimSpec[0] + "; })";
    while (--dimCount) {
        arrayCreationString = "Array(dimSpec[" + dimCount + "]).fill().map(element => " + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
};

// Output the result of the main computation.
console.log(entryPoint().toString());

// Main function encapsulating the problem's logic.
function entryPoint() {
    let numSwitches = retrieveNumber();
    let numBulbs = retrieveNumber();
    let bulbConnectionsCount = initializeMultiDimArray(0, numBulbs);
    let switchConfigurations = initializeMultiDimArray(0, numSwitches, numBulbs);

    for (let bulbIdx = 0; bulbIdx < numBulbs; bulbIdx++) {
        bulbConnectionsCount[bulbIdx] = retrieveNumber();
        switchConfigurations[bulbIdx] = retrieveArray(bulbConnectionsCount[bulbIdx]).map((originalIndex) => originalIndex - 1);
    }
    let desiredParity = retrieveArray(numBulbs);

    let validCombinations = 0;
    let switchStates = new Array(numSwitches);

    // Iterate through all possible states for the switches (2^N combinations)
    for (let currentCombination = 0; currentCombination < (1 << numSwitches); currentCombination++) {
        // Translate the combination integer into individual switch states (0 or 1)
        for (let switchIdx = 0; switchIdx < numSwitches; switchIdx++) {
            switchStates[switchIdx] = (currentCombination >> switchIdx) & 1;
        }

        let isSatisfied = true;
        // Check each bulb against the current switch states
        for (let bulbIdx = 0; bulbIdx < numBulbs; bulbIdx++) {
            let paritySum = 0;
            // Sum the states of switches connected to the current bulb
            for (let connIdx = 0; connIdx < bulbConnectionsCount[bulbIdx]; connIdx++) {
                paritySum += switchStates[switchConfigurations[bulbIdx][connIdx]];
            }

            // If the sum's parity does not match the desired parity for this bulb,
            // this combination of switch states is invalid.
            if (paritySum % 2 !== desiredParity[bulbIdx]) {
                isSatisfied = false;
                break;
            }
        }

        // If all bulbs are satisfied by this combination, increment the counter
        if (isSatisfied) {
            validCombinations++;
        }
    }
    return validCombinations;
}