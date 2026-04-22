const fileSystem = require('fs');

// Read the entire input content from standard input synchronously.
// The content is expected to be UTF-8 encoded text.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and then split it into an array of lines.
// Each element in `inputDataLines` will represent a single line from the original input.
const inputDataLines = rawInputContent.trim().split('\n');

// Initialize a pointer to keep track of the current line being processed from `inputDataLines`.
let currentLineIndex = 0;

// Main processing loop: continues indefinitely until a specific termination condition is met.
while (true) {
    // Retrieve the next line which is expected to contain configuration parameters (N, M, P).
    // The `currentLineIndex` is incremented after retrieval.
    const configurationString = inputDataLines[currentLineIndex++];

    // If there are no more lines in the input, break the loop.
    if (!configurationString) {
        break;
    }

    // Parse the configuration string: split by space and convert each part to an integer.
    // This gives us an array of three numbers: [itemCount, targetPosition, discountRate].
    const currentDataSetParams = configurationString.split(' ').map(val => parseInt(val, 10));

    // Check for the termination condition: if all three parameters are zero, exit the loop.
    if (currentDataSetParams[0] === 0 && currentDataSetParams[1] === 0 && currentDataSetParams[2] === 0) {
        break;
    }

    // Extract the parameters for the current data set.
    // `numItems`: total number of items to be processed (N).
    // `targetItemZeroIndex`: the 0-based index of the item whose score will be used as the divisor (M-1).
    // `percentageOff`: the discount rate to be applied to the total sum (P).
    const numItems = currentDataSetParams[0];
    const targetItemZeroIndex = currentDataSetParams[1] - 1;
    const percentageOff = currentDataSetParams[2];

    // Initialize an array to store the scores of individual items.
    const itemScoreList = [];
    // Initialize a variable to accumulate the gross sum of weighted item scores.
    let weightedGrossSum = 0.0; // Using float for precision from the start.

    // Loop `numItems` times to read each item's score and update the sum.
    for (let i = 0; i < numItems; i++) {
        // Retrieve the line containing the current item's score.
        const scoreString = inputDataLines[currentLineIndex++];
        // Convert the string score to an integer.
        const itemValue = parseInt(scoreString, 10);

        // Add the item's score to our list.
        itemScoreList.push(itemValue);
        // Each item contributes `itemValue * 100` to the gross sum.
        weightedGrossSum += (itemValue * 100);
    }

    // Calculate the effective multiplier for the discount.
    // If percentageOff is P, then (100 - P)% of the sum remains.
    const discountMultiplier = (100 - percentageOff) / 100.0;

    // Apply the discount to the weighted gross sum to get the net sum.
    const weightedNetSum = weightedGrossSum * discountMultiplier;

    // Initialize the final calculated result for this data set.
    let finalResult = 0;

    // Check if the target item index is within the valid bounds of the `itemScoreList`.
    // Also, ensure the target item's score is not zero to prevent division by zero.
    if (targetItemZeroIndex >= 0 && targetItemZeroIndex < itemScoreList.length) {
        const divisorItemScore = itemScoreList[targetItemZeroIndex];

        // If the divisor is not zero, perform the division.
        if (divisorItemScore !== 0) {
            // Calculate the score by dividing the net sum by the target item's score.
            // Use Math.floor to get the integer part of the result.
            finalResult = Math.floor(weightedNetSum / divisorItemScore);
        }
        // If divisorItemScore is 0, finalResult remains 0, which is the desired behavior.
    } else {
        // If the target item index is out of bounds, the final result remains 0.
        // In a production system, one might log an error here.
    }

    // Output the computed final result for the current data set to the console.
    console.log(finalResult);
}