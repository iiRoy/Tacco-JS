// This function processes the raw input string.
function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    rawData = rawData.split('\n');

    // The second line contains space-separated price values.
    let priceStrings = rawData[1].split(' ');

    // Initialize a counter for prices that meet the condition.
    let validCount = 0;

    // Initialize the minimum price encountered so far to a very large number.
    let currentMinPrice = Number.MAX_SAFE_INTEGER;

    // The first line of input specifies the total number of items to process.
    // Loop through each item.
    for (let idx = 0; idx < rawData[0]; idx++) {
        // Get the current price string from the array.
        let currentPrice = priceStrings[idx];

        // If the current price is less than or equal to the running minimum,
        // increment the counter. JavaScript will implicitly convert currentPrice to a number for comparison.
        if (currentPrice <= currentMinPrice) {
            validCount++;
        }

        // If the current minimum price is greater than or equal to the current price,
        // update the running minimum. This effectively finds the minimum price encountered up to this point.
        if (currentMinPrice >= currentPrice) {
            currentMinPrice = currentPrice;
        }
    }

    // Display the final calculated count to standard output.
    console.log(validCount);
}

// Do not modify the following line; it handles standard input and calls the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
