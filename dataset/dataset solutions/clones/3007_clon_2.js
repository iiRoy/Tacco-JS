function CalculateNetBenefit(sourceContent) {
    // Split the raw input string into an array of individual lines
    const dataLines = sourceContent.split('\n');

    // Extract the first set of numeric values from the second line
    const firstSetOfValues = dataLines[1].split(' ');

    // Extract the second set of numeric values from the third line
    const secondSetOfValues = dataLines[2].split(' ');

    // Parse the total number of entries from the first line
    let totalEntries = parseInt(dataLines[0], 10);

    // Initialize an array to store the 'gain' values
    let gains = Array.from({ length: totalEntries });

    // Initialize an array to store the 'loss' values
    let losses = new Array(totalEntries);

    // Initialize a variable to accumulate the total positive difference
    let cumulativeProfit = 0;

    // Loop through the entries to populate the gain and loss arrays
    for (let currentIdx = 0; currentIdx < totalEntries; currentIdx++) {
        // Convert string values to integers for gains
        gains[currentIdx] = parseInt(firstSetOfValues[currentIdx], 10);

        // Convert string values to integers for losses
        losses[currentIdx] = parseInt(secondSetOfValues[currentIdx], 10);
    }

    // Loop through the arrays again to calculate the net benefit for each item
    for (let loopCounter = 0; loopCounter < totalEntries; loopCounter++) {
        // Calculate the difference between gain and loss for the current item
        const itemDifference = gains[loopCounter] - losses[loopCounter];

        // If the difference is positive, add it to the cumulative profit
        if (itemDifference > 0) {
            cumulativeProfit += itemDifference;
        }
    }

    // Output the final calculated cumulative profit
    console.log(cumulativeProfit);
}

// Call the main processing function with content read from standard input
CalculateNetBenefit(require("fs").readFileSync("/dev/stdin", "utf-8"));