// This function processes a multi-line string input to calculate a special total.
// It identifies the highest numerical value among the provided entries, halves it,
// and then adds this discounted portion to the sum of all other values.
function calculateAdjustedSum(fullInputContent) {
    // Step 1: Parse the raw input string into an array of individual lines.
    const allInputLines = fullInputContent.split('\n');

    // The very first line of the input usually signifies the count of data items that follow.
    // We parse it here for completeness, though its direct application in the subsequent
    // calculation logic is not always mandatory for the problem's core requirement.
    const expectedItemCount = parseInt(allInputLines[0], 10);

    // Step 2: Extract the actual data entries (price strings).
    // We skip the first line (which was the count) and filter out any lines that are empty or just whitespace.
    const initialPriceStrings = allInputLines.slice(1).filter(line => line.trim() !== '');

    // Step 3: Convert the extracted price strings into numerical values.
    // During this conversion, we also perform basic validation:
    // - Ensure the value is indeed a number (not NaN).
    // - Ensure the number is non-negative, as prices typically are.
    let numericPrices = initialPriceStrings
        .map(priceStr => Number(priceStr)) // Using Number() for conversion
        .filter(val => !isNaN(val) && val >= 0); // Filtering out invalid or negative entries

    // Step 4: Implement a guard clause for edge cases.
    // If, after parsing and validation, there are no valid numerical prices to process,
    // the result is 0. This prevents errors with empty arrays later.
    if (numericPrices.length === 0) {
        console.log(0);
        return;
    }

    // Step 5: Identify the highest price and its position within the array.
    // Instead of using Math.max() directly, we'll iterate to find it,
    // which also gives us its index for later removal.
    let dominantPriceValue = -1;       // Stores the highest price found so far.
    let dominantPricePosition = -1; // Stores the index of that highest price.

    for (let i = 0; i < numericPrices.length; i++) {
        const currentPriceElement = numericPrices[i];
        if (currentPriceElement > dominantPriceValue) {
            dominantPriceValue = currentPriceElement;
            dominantPricePosition = i;
        }
    }

    // Step 6: Create a new collection of prices, excluding the dominant one.
    // This is done by filtering the original array based on the identified position.
    const subordinatePrices = numericPrices.filter((_, index) => index !== dominantPricePosition);

    // Step 7: Calculate the sum of all prices in the 'subordinatePrices' collection.
    // Using the reduce method for a concise summation.
    const sumOfSubordinatePrices = subordinatePrices.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Step 8: Apply the special discount to the dominant price.
    // The problem specifies that the highest price is halved.
    const discountedDominantPortion = dominantPriceValue / 2;

    // Step 9: Combine the sum of subordinate prices with the discounted dominant portion.
    const preFinalSum = sumOfSubordinatePrices + discountedDominantPortion;

    // Step 10: Round down the final sum to the nearest whole number as required.
    const finalResultFloored = Math.floor(preFinalSum);

    // Step 11: Output the computed and rounded result to the console.
    console.log(finalResultFloored);
}

// The following section is boilerplate code to read input from standard input
// and invoke the primary data processing function. This part should remain unchanged.
calculateAdjustedSum(require("fs").readFileSync("/dev/stdin", "utf8"));