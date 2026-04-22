// Utility function to convert string to an integer
function parseInteger(stringValue) {
    return parseInt(stringValue, 10);
}

// Primary program entry point
function ProcessInputData(rawData) {

    // Extract dimensions from the first line of input
    const dimensionsArray = rawData.split('\n')[0].split(' ');
    const heightVal = parseInteger(dimensionsArray[0]);
    const widthVal = parseInteger(dimensionsArray[1]);

    // Special case for width being 1
    if (widthVal === 1) return console.log('Yes');

    // Count character frequencies from the grid data
    const charCountsMap = rawData.split('\n').slice(1).join('').split('').reduce(function(currentMap, character) {
        // Initialize count if character is new
        if (currentMap[character] === undefined) {
            currentMap[character] = 0;
        }
        currentMap[character]++; // Increment character count
        return currentMap;
    }, {});


    // Case: Both dimensions are even
    if (heightVal % 2 === 0 && widthVal % 2 === 0) {
        const oddFourCount = Object.keys(charCountsMap).filter(function(keyName) {
            return charCountsMap[keyName] % 4 !== 0; // Find characters whose counts are not multiples of 4
        }).length;

        if (oddFourCount === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Case: Both dimensions are odd
    if (heightVal % 2 !== 0 && widthVal % 2 !== 0) {
        const paritySum = Object.keys(charCountsMap).filter(function(keyName) {
            return charCountsMap[keyName] % 4 !== 0; // Filter counts not divisible by 4
        }).reduce(function(accumulator, currentKey) {
            return accumulator + parseInteger(charCountsMap[currentKey]); // Sum filtered counts
        }, 0);

        if (paritySum % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Case: One dimension is odd, the other is even (as previous cases cover both even or both odd)
    const oddTwoSum = Object.keys(charCountsMap).filter(function(charIdentifier) {
        return charCountsMap[charIdentifier] % 2 !== 0; // Filter counts that are odd
    }).reduce(function(totalCount, currentIdentifier) {
        return totalCount + parseInteger(charCountsMap[currentIdentifier]); // Sum odd counts
    }, 0);

    if (oddTwoSum === 0) {
        return console.log('No');
    } else {
        return console.log('No');
    }
}

// Execute the main processing function with data from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));