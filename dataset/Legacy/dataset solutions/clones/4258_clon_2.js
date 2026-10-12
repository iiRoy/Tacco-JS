var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of lines
var dataRows = rawData.split('\n');

// Parse the first line to get the size of the arrays
var arraySize = Number(dataRows[0]);

// Split the subsequent lines into string arrays
var strArrA = dataRows[1].split(' ');
var strArrB = dataRows[2].split(' ');
var strArrC = dataRows[3].split(' ');

// Initialize numeric arrays
var numArrA = [];
var numArrB = [];
var numArrC = [];

// Populate the numeric arrays by converting string elements to numbers
for (var idx = 0; idx < arraySize; idx++) {
    numArrA.push(Number(strArrA[idx]));
    numArrB.push(Number(strArrB[idx]));
    numArrC.push(Number(strArrC[idx]));
}

// Helper function for ascending sort
function compareNumbers(val1, val2) {
    return val1 - val2;
}

// Sort all three numeric arrays in ascending order
numArrA.sort(compareNumbers);
numArrB.sort(compareNumbers);
numArrC.sort(compareNumbers);

// Initialize variables for the main calculation
var totalResult = 0;
var ptrA = 0; // Pointer for numArrA
var ptrC = 0; // Pointer for numArrC
var validCountA = 0; // Count of elements in A less than current B
var validCountC = 0; // Count of elements in C greater than current B

// Iterate through each element in numArrB
for (var ptrB = 0; ptrB < arraySize; ptrB++) {
    var currentBVal = numArrB[ptrB];

    // Find count of elements in numArrA that are strictly less than currentBVal
    for (var innerIdx = ptrA; innerIdx < arraySize; innerIdx++) {
        var currentAVal = numArrA[innerIdx];
        if (currentBVal <= currentAVal) {
            // If current B is less than or equal to current A,
            // then all subsequent A values will also be greater or equal.
            // So, we stop and update the pointer for A.
            break;
        } else {
            // currentAVal < currentBVal, so it's a valid 'a'
            ptrA = innerIdx;
            validCountA = innerIdx + 1;
        }
    }

    // Find count of elements in numArrC that are strictly greater than currentBVal
    for (var innerIdx = ptrC; innerIdx < arraySize; innerIdx++) {
        var currentCVal = numArrC[innerIdx];
        if (currentBVal < currentCVal) {
            // If current B is strictly less than current C,
            // then all subsequent C values will also be greater.
            // So, we stop and update the pointer for C.
            break;
        } else {
            // currentCVal <= currentBVal, so it's not a valid 'c' for this condition
            ptrC = innerIdx;
            validCountC = innerIdx + 1;
        }
    }

    // Add to the total result based on the counts found
    // (N - validCountC) gives the number of elements in C that are strictly greater than currentBVal
    totalResult += validCountA * (arraySize - validCountC);
}

// Output the final calculated sum
console.log(totalResult);
