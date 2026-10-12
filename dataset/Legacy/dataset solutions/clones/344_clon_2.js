var productInfo = [
    // Each inner array represents a product category with:
    // [total_value_per_unit, total_cost_per_unit, max_quantity_to_consider]
    [500 * 3, 850 * 3 * 0.88, 4], // Category 0: Group of 3 items
    [300 * 4, 550 * 4 * 0.85, 5], // Category 1: Group of 4 items
    [200 * 5, 380 * 5 * 0.8, 6],  // Category 2: Group of 5 items
    [500, 850, 11],               // Category 3: Single item
    [300, 550, 17],               // Category 4: Single item
    [200, 380, 26]                // Category 5: Single item
];

/**
 * Calculates the minimum possible cost to achieve a specific target value
 * by combining items from different product categories.
 *
 * @param {number} targetValue The desired total value to reach.
 * @returns {number} The lowest price found for the target value, or a very large number if not achievable.
 */
var calculateMinCost = function (targetValue) {
    // Initialize the minimum price found so far to a very high value.
    var lowestPrice = 100000000;

    // Array to store the count of items taken from each product category.
    // There are 6 categories, so 6 counters.
    var itemCounts = [0, 0, 0, 0, 0, 0];

    // Nested loops to iterate through all possible combinations of item counts
    // for each product category. The loop bounds are defined by the third element
    // in each productInfo entry (max_quantity_to_consider).
    for (itemCounts[0] = 0; itemCounts[0] < productInfo[0][2]; itemCounts[0]++) {
        for (itemCounts[1] = 0; itemCounts[1] < productInfo[1][2]; itemCounts[1]++) {
            for (itemCounts[2] = 0; itemCounts[2] < productInfo[2][2]; itemCounts[2]++) {
                for (itemCounts[3] = 0; itemCounts[3] < productInfo[3][2]; itemCounts[3]++) {
                    for (itemCounts[4] = 0; itemCounts[4] < productInfo[4][2]; itemCounts[4]++) {
                        for (itemCounts[5] = 0; itemCounts[5] < productInfo[5][2]; itemCounts[5]++) {
                            // For each combination, calculate the total value and total price.
                            var currentSum = 0;
                            var currentPrice = 0;

                            // Iterate through all 6 product categories.
                            for (var idx = 0; idx < 6; idx++) {
                                // Accumulate total value based on item counts and category value.
                                currentSum += itemCounts[idx] * productInfo[idx][0];
                                // Accumulate total price based on item counts and category cost.
                                currentPrice += itemCounts[idx] * productInfo[idx][1];
                            }

                            // If the calculated total value matches the target value,
                            // update the lowest price if the current price is lower.
                            if (currentSum === targetValue) {
                                lowestPrice = Math.min(currentPrice, lowestPrice);
                            }
                        }
                    }
                }
            }
        }
    }
    // Return the minimum price found for the given target value.
    return lowestPrice;
};

// Array to store lines read from standard input.
var inputLines = [];

// Resume standard input stream to start listening for data.
process.stdin.resume();
// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function (dataChunk) {
    // Process each line in the data chunk:
    // 1. Trim whitespace from the chunk.
    // 2. Split the chunk into individual lines based on newline characters.
    // 3. For each resulting line, add it to the inputLines array.
    dataChunk.trim().split('\n').forEach(function (singleLine) {
        inputLines.push(singleLine);
    });
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function () {
    // Iterate through each collected input line.
    for (var lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        // Parse the current line as an integer after trimming whitespace.
        var parsedInput = parseInt(inputLines[lineIndex].trim());

        // If the parsed input is 0, it signifies the end of input processing,
        // so exit the program.
        if (parsedInput === 0) {
            return;
        }

        // Calculate the minimum cost for the current parsed input value
        // and print the result to the console.
        console.log(calculateMinCost(parsedInput));
    }
});
