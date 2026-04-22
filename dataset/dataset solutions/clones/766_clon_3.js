const fileSystemModule = require('fs');

// Reads the entire content from standard input, decodes it as UTF-8,
// removes any leading or trailing whitespace, and then splits it into an array of strings,
// where each string represents a line of input.
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputBuffer.trim().split('\n');

// Initialize a pointer to keep track of the current line being processed from the input array.
let currentLinePointer = 0;

// Main loop to process each test case provided in the input.
// It continues as long as there are lines remaining in the input array.
while (currentLinePointer < processedInputLines.length) {
    // Extract the current line which contains the parameters for the test case.
    const currentParameterLine = processedInputLines[currentLinePointer];
    currentLinePointer++; // Advance the pointer to the next line for subsequent reads.

    // Parse the parameters (number of items and maximum allowed sum) from the current line.
    // Each part is trimmed to remove whitespace and then converted to an integer with base 10.
    const numericParameters = currentParameterLine.split(' ').map(strPart => parseInt(strPart.trim(), 10));

    const numberOfItems = numericParameters[0]; // Corresponds to 'n' in the original problem.
    const maximumPermittedValue = numericParameters[1]; // Corresponds to 'max' in the original problem.

    // Check for the termination condition: if both parameters are zero, exit the processing loop.
    if (numberOfItems === 0 && maximumPermittedValue === 0) {
        break; // End of input signal received.
    }

    // Initialize an array to store all valid sums of two item prices that meet the criteria.
    const collectedValidSums = [];

    // Safety check: ensure there's another line available for the item prices list.
    if (currentLinePointer >= processedInputLines.length) {
        // If no price list is found where expected, it indicates malformed input.
        // We can either skip this test case or break, depending on desired error handling.
        // For this clone, we'll break as it implies an incomplete final test case.
        break;
    }

    // Retrieve the line containing the list of item prices.
    const itemPriceStringList = processedInputLines[currentLinePointer];
    currentLinePointer++; // Advance pointer past the price list line.

    // Parse the individual item prices.
    // Each string part is converted to an integer, and any resulting NaN values (from invalid numbers) are filtered out.
    const itemValueArray = itemPriceStringList
        .split(' ')
        .map(priceStr => parseInt(priceStr.trim(), 10))
        .filter(parsedVal => !isNaN(parsedVal)); // Ensures only valid numbers are kept.

    // If no valid item prices were parsed, there's nothing to combine. Output 'NONE' and proceed to the next test case.
    if (itemValueArray.length === 0) {
        console.log('NONE');
        continue;
    }

    // Nested loops to calculate all possible sums of two distinct (or same) item prices.
    // The loops iterate up to 'numberOfItems', assuming 'numberOfItems' correctly reflects
    // the count of prices in 'itemValueArray'.
    for (let indexA = 0; indexA < numberOfItems; indexA++) {
        for (let indexB = 0; indexB < numberOfItems; indexB++) {
            // Guard against out-of-bounds access if 'numberOfItems' is greater than the actual
            // length of 'itemValueArray' (due to malformed input line for prices).
            if (indexA < itemValueArray.length && indexB < itemValueArray.length) {
                const currentCalculatedSum = itemValueArray[indexA] + itemValueArray[indexB];

                // If the calculated sum is within the permitted maximum value, add it to our collection.
                if (currentCalculatedSum <= maximumPermittedValue) {
                    collectedValidSums.push(currentCalculatedSum);
                }
            }
        }
    }

    // Determine the highest sum found among the valid combinations.
    // Initialize with a value that will be easily superseded by any valid sum.
    let highestAchievedSum = -1;

    // If any valid sums were collected, find the maximum among them.
    // The original code had a bug here (Math.max(single_element)), this corrects it.
    if (collectedValidSums.length > 0) {
        for (const sumOfPair of collectedValidSums) {
            if (sumOfPair > highestAchievedSum) {
                highestAchievedSum = sumOfPair;
            }
        }
    }

    // Prepare the final output message based on whether a valid highest sum was found.
    let finalResultString;
    if (highestAchievedSum !== -1) { // If highestAchievedSum was updated from -1, it means at least one valid sum exists.
        finalResultString = highestAchievedSum.toString();
    } else {
        finalResultString = 'NONE'; // No valid sums were found, or the list was empty.
    }

    // Print the result for the current test case.
    console.log(finalResultString);
}