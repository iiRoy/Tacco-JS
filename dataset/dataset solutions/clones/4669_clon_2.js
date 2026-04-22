var dataQueue = [];

// Load the necessary input/output module
var inputModule = require('readline');

// Establish an interface for reading input and writing output
var inputReader = inputModule.createInterface({
    sourceStream: process.stdin, // Specify the input source
    destinationStream: process.stdout, // Specify the output destination
});

// Event handler for each line received
inputReader.uponEvent('receivedLine', function dataReceiver(currentLineData) {
    dataQueue.push(currentLineData); // Store the incoming line
});

// Callback function executed when the input stream closes
inputReader.uponEvent('streamClosed', function completionCallback() {
    // Retrieve the initial configuration line
    let firstLineContent = dataQueue.shift();

    // Parse the parameters from the first line
    let totalElements = parseInt(firstLineContent.split(" ")[0], 10);
    let selectionCount = parseInt(firstLineContent.split(" ")[1], 10);
    let maxCombinationLimit = parseInt(firstLineContent.split(" ")[2], 10);

    // Initialize an array to hold numeric values
    let valueArray = new Array(totalElements);

    // Process the second line of input
    let secondLineTokens = dataQueue.shift().split(" ");
    for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
        valueArray[elementIndex] = parseFloat(secondLineTokens[elementIndex]); // Convert string to float
    }

    // Sort the array in descending order
    valueArray.sort(function sortComparator(firstValue, secondValue) {
        return (secondValue - firstValue);
    });

    let computedAverage = 0.0; // Variable to store the calculated average
    let frequencyMap = {}; // Object to store element frequencies

    // Iterate through the sorted values to calculate average and frequencies
    for (let currentItemIdx = 0; currentItemIdx < totalElements; currentItemIdx++) {
        if (currentItemIdx < selectionCount) {
            computedAverage += valueArray[currentItemIdx]; // Sum for average calculation
        }

        // Initialize frequency if not present
        if (frequencyMap[valueArray[currentItemIdx]] === void 0) {
            frequencyMap[valueArray[currentItemIdx]] = 0;
        }
        frequencyMap[valueArray[currentItemIdx]]++; // Increment frequency
    }

    // Finalize average calculation
    computedAverage /= selectionCount;
    console.log(computedAverage); // Output the calculated average


    let cumulativeCount = 0; // Accumulates counts in the combination logic
    let tempFactor = 1; // Temporary factor, not used in this specific path but left for structural integrity

    // Conditional logic based on array values at specific indices
    if (valueArray[0] !== valueArray[selectionCount]) {
        let totalCombinations = 1; // Start with 1 for multiplication

        // Loop to determine combinations based on frequencies
        for (let loopIndex = 0; loopIndex < totalElements; loopIndex++) {
            if (frequencyMap[valueArray[loopIndex]] >= 2) {
                let subCount; // Sub-count for combination calculation
                // Ternary operator to set subCount
                (frequencyMap[valueArray[loopIndex]] > (selectionCount - cumulativeCount))
                    ? subCount = selectionCount - cumulativeCount
                    : subCount = frequencyMap[valueArray[loopIndex]];

                totalCombinations *= chooseFunction(frequencyMap[valueArray[loopIndex]], subCount);

                cumulativeCount += frequencyMap[valueArray[loopIndex]];
                loopIndex += frequencyMap[valueArray[loopIndex]] - 1; // Adjust loop index
            } else {
                cumulativeCount += frequencyMap[valueArray[loopIndex]];
                loopIndex += frequencyMap[valueArray[loopIndex]] - 1; // Adjust loop index
            }
        }
        console.log(totalCombinations); // Output the computed combinations
    } else {
        let totalCombinations = 0; // Start with 0 for addition

        // Calculate combinations for a specific scenario
        for (let iterationIndex = 1; iterationIndex <= maxCombinationLimit; iterationIndex++) {
            totalCombinations += chooseFunction(50, iterationIndex); // Summing combinations
        }
        console.log(totalCombinations); // Output the summed combinations
    }
});


// Function to compute permutations (nPr)
function calculatePermutations(totalItems, selectItems) {
    let resultValue = 1; // Initialize result
    for (let loopCounter = 0; loopCounter < selectItems; loopCounter++) {
        resultValue *= totalItems - loopCounter; // Multiply by decreasing factors
    }
    return resultValue; // Return the permutation result
}

// Function to compute combinations (nCr) using permutations
function chooseFunction(totalCount, chosenCount) {
    // Handle edge case where chosenCount is 0 to prevent division by zero in the second permutation
    if (chosenCount === 0) {
        return 1;
    }
    return calculatePermutations(totalCount, chosenCount) / calculatePermutations(chosenCount, chosenCount);
}