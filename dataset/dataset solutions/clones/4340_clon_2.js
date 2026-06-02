function ProcessInput(rawData) {
    // Extract the dimensions (height and width) from the first line of the input.
    const dimensionsStr = rawData.split('\n')[0].split(' ');

    // Convert the string dimensions to integer values using a helper function.
    const heightVal = parseInteger(dimensionsStr[0]);
    const widthVal = parseInteger(dimensionsStr[1]);

    // Handle a specific edge case: if the width is 1, the condition is always met.
    if (widthVal === 1) {
        return console.log('Yes');
    }

    // Process the grid data (all lines after the first) to count character frequencies.
    const charCountsMap = rawData
        .split('\n') // Split input into lines
        .slice(1) // Discard the first line (dimensions)
        .join('') // Concatenate all grid lines into a single string
        .split('') // Split the string into an array of individual characters
        .reduce(function(currentMap, charKey) {
            // Initialize the count for a character if it's encountered for the first time.
            if (currentMap[charKey] === void 0) {
                currentMap[charKey] = 0;
            }
            // Increment the count for the current character.
            currentMap[charKey]++;
            return currentMap; // Return the updated map for the next iteration.
        }, {}); // Start with an empty object to accumulate character counts.


    // Scenario 1: Both height and width are even numbers.
    if (heightVal % 2 === 0 && widthVal % 2 === 0) {
        // Determine how many character counts are not perfectly divisible by 4.
        const nonQuadrupleCount = Object.keys(charCountsMap).filter(function(mapChar) {
            return charCountsMap[mapChar] % 4 !== 0;
        }).length; // Get the total number of such characters.

        // If all character counts are multiples of 4, output 'Yes'.
        if (nonQuadrupleCount === 0) {
            return console.log('Yes');
        } else {
            // Otherwise, output 'No'.
            return console.log('No');
        }
    }

    // Scenario 2: Both height and width are odd numbers.
    if (heightVal % 2 !== 0 && widthVal % 2 !== 0) {
        // Calculate the sum of counts for characters whose frequencies are not multiples of 4.
        const oddCountSum = Object.keys(charCountsMap).filter(function(mapChar) {
            return charCountsMap[mapChar] % 4 !== 0;
        }).reduce(function(currentSum, charIdentifier) {
            // Add the count of the current character to the running sum.
            return currentSum + parseInteger(charCountsMap[charIdentifier]);
        }, 0); // Initialize the sum to zero.

        // If the calculated sum is an odd number, output 'Yes'.
        if (oddCountSum % 2 === 1) {
            return console.log('Yes');
        } else {
            // Otherwise, output 'No'.
            return console.log('No');
        }
    }

    // Scenario 3: One dimension is even and the other is odd (mixed parity).
    // Calculate the sum of counts for characters whose frequencies are not multiples of 4.
    const remainingSum = Object.keys(charCountsMap).filter(function(mapChar) {
        return charCountsMap[mapChar] % 4 !== 0;
    }).reduce(function(currentSum, mapChar) {
        // Accumulate the count of the character into the sum.
        return currentSum + parseInteger(charCountsMap[mapChar]);
    }, 0); // Start the accumulation from zero.

    // If this accumulated sum is zero, output 'Yes'.
    if (remainingSum === 0) {
        return console.log('Yes');
    } else {
        // Otherwise, output 'No'.
        return console.log('No');
    }
}

// A utility function to parse a string into an integer, specifying base 10.
function parseInteger(valueStr) {
    return parseInt(valueStr, 0xA); // 0xA is the hexadecimal representation for the number 10.
}

// Read the entire input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
