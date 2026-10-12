function ProcessInput(rawData) {
    // Split the raw input into lines and then parse the first line for dimensions.
    const dimensions = rawData.split('\n')[0].split(' ');
    const gridHeight = parseInteger(dimensions[0]);
    const gridWidth = parseInteger(dimensions[1]);

    // Handle a specific edge case where the width is 1.
    if (gridWidth === 1) {
        return console.log('Yes');
    }

    // Process the remaining input to count character frequencies.
    // This creates a map of each character to its total occurrences.
    const charFrequencies = rawData.split('\n').slice(1).join('').split('').reduce(function(frequencyMap, character) {
        if (frequencyMap[character] === void 0) {
            frequencyMap[character] = 0;
        }
        frequencyMap[character]++;
        return frequencyMap;
    }, {});


    // Case 1: Both grid dimensions are even.
    if (gridHeight % 2 === 0 && gridWidth % 2 === 0) {
        // Count characters whose frequencies are not multiples of 4.
        const nonQuadrupleCount = Object.keys(charFrequencies).filter(function(keyChar) {
            return charFrequencies[keyChar] % 4 !== 0;
        }).length;

        // If all character frequencies are multiples of 4, it's a 'Yes'.
        if (nonQuadrupleCount === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Case 2: Both grid dimensions are odd.
    if (gridHeight % 2 !== 0 && gridWidth % 2 !== 0) {
        // Sum the counts of characters whose frequencies are not multiples of 4.
        const oddRemainderSum = Object.keys(charFrequencies).filter(function(keyChar) {
            return charFrequencies[keyChar] % 4 !== 0;
        }).reduce(function(currentSum, keyChar) {
            return currentSum + parseInteger(charFrequencies[keyChar]);
        }, 0);

        // If the total sum of these non-quadruple counts is odd, it's a 'Yes'.
        if (oddRemainderSum % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Case 3: One dimension is even, the other is odd.
    // Sum the counts of characters whose frequencies are odd.
    const oddFrequencySum = Object.keys(charFrequencies).filter(function(keyChar) {
        return charFrequencies[keyChar] % 2 !== 0;
    }).reduce(function(currentSum, keyChar) {
        return currentSum + parseInteger(charFrequencies[keyChar]);
    }, 0);

    // Based on the original logic, this case always results in 'No'.
    if (oddFrequencySum === 0) {
        return console.log('No');
    } else {
        return console.log('No');
    }
}

// Helper function to convert a string to an integer.
function parseInteger(valueString) {
    return parseInt(valueString, 10);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
