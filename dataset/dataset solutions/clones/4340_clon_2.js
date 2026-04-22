/*
 * This module processes raw input data to determine a specific grid property.
 * It checks character frequencies within a grid structure based on its dimensions.
 */
function ProcessInput(rawData) {
    // Extract grid dimensions from the first line of the input
    const sizeComponents = rawData.split('\n')[0].split(' ');

    // Parse height and width values
    const gridHeight = retrieveInt(sizeComponents[0]);
    const gridWidth = retrieveInt(sizeComponents[1]);

    // Special case: if grid width is 1, it always satisfies the condition
    if (gridWidth === 1) {
        return console.log('Yes');
    }

    // Process the rest of the input to build a frequency map of characters
    // The input after the first line represents the grid content
    const characterFrequencies = rawData.split('\n').slice(1).join('').split('').reduce(function(frequencyMap, currentSymbol) {
        // Initialize count if character is encountered for the first time
        if (frequencyMap[currentSymbol] === undefined) {
            frequencyMap[currentSymbol] = 0;
        }
        // Increment character count
        frequencyMap[currentSymbol]++;
        return frequencyMap;
    }, {}); // Initialize with an empty object

    // Condition block 1: Both dimensions are even
    if (gridHeight % 2 === 0 && gridWidth % 2 === 0) {
        // Count characters whose frequencies are not multiples of 4
        const unevenCount = Object.keys(characterFrequencies).filter(function(symbolKey) {
            return characterFrequencies[symbolKey] % 4 !== 0;
        }).length;

        // If no such characters exist, the condition is met
        if (unevenCount === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Condition block 2: Both dimensions are odd
    if (gridHeight % 2 !== 0 && gridWidth % 2 !== 0) {
        // Calculate the sum of frequencies for characters whose counts are not multiples of 4
        const totalIrregularCount = Object.keys(characterFrequencies).filter(function(symbolKey) {
            return characterFrequencies[symbolKey] % 4 !== 0;
        }).reduce(function(currentSum, freqKey) {
            return currentSum + retrieveInt(characterFrequencies[freqKey]); // Summing up the actual counts
        }, 0);

        // If the total sum of these irregular counts is odd, the condition is met
        if (totalIrregularCount % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Condition block 3: One dimension is even, the other is odd (mixed parity)
    // Calculate the sum of frequencies for characters whose counts are not multiples of 4
    const finalIrregularSum = Object.keys(characterFrequencies).filter(function(symbolKey) {
        return characterFrequencies[symbolKey] % 4 !== 0;
    }).reduce(function(currentSum, symbolKey) {
        return currentSum + retrieveInt(characterFrequencies[symbolKey]); // Summing up the actual counts
    }, 0);

    // If this final sum is zero, the condition is met
    if (finalIrregularSum === 0) {
        return console.log('Yes');
    } else {
        return console.log('No');
    }
}

/*
 * Helper function to safely parse a string into an integer.
 * Ensures base 10 conversion.
 */
function retrieveInt(stringValue) {
    return parseInt(stringValue, 10);
}

// Entry point: Read input from standard input and pass to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));