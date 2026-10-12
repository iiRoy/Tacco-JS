process.stdin.resume();
process.stdin.setEncoding('utf8');

// Array to store all lines read from standard input
var collectedInputLines = [];

// Create an interface for reading input line by line
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input
inputProcessor.on('line', (currentInputLine) => {
  // Add the current line to our collection
  collectedInputLines.push(currentInputLine);
});

// Event listener for when the input stream closes
inputProcessor.on('close', () => {
    // Parse the first line for prices of different quantities
    // Q: price for 0.25L, H: price for 0.5L, S: price for 1L, D: price for 2L
    const [priceQuarterLiter, priceHalfLiter, priceSingleLiter, priceDoubleLiter] = collectedInputLines[0].split(" ").map(valStr => valStr - 0);

    // Parse the second line for the total required liters
    const requiredLiters = collectedInputLines[1] - 0;

    // Check if the required amount is zero (N/2 === 0 implies N === 0 for non-negative N)
    if (requiredLiters / 2 === 0) {
        // If N is 0, the cost is 0. The calculation N/2 * unit will result in 0.
        // Calculate the minimum cost to acquire 2 liters using various smaller units
        const minCostForTwoLiters = Math.min(
            priceQuarterLiter * 8, // 8 * 0.25L = 2L
            priceHalfLiter * 4,    // 4 * 0.5L = 2L
            priceSingleLiter * 2,  // 2 * 1L = 2L
            priceDoubleLiter       // 1 * 2L = 2L
        );
        // Output the total cost for 0 liters, which is 0
        console.log(requiredLiters / 2 * minCostForTwoLiters);
    } else {
        // If N is greater than 0, proceed with cost calculation
        // Determine the minimum cost to acquire 1 liter using smaller units
        const minCostForOneLiter = Math.min(
            priceQuarterLiter * 4, // 4 * 0.25L = 1L
            priceHalfLiter * 2,    // 2 * 0.5L = 1L
            priceSingleLiter       // 1 * 1L = 1L
        );
        // The direct cost for a 2-liter bottle
        const bulkCostForTwoLiters = priceDoubleLiter;

        // Compare buying two 1-liter equivalents versus one 2-liter bulk
        // If buying two 1-liter equivalents is cheaper than a 2-liter bulk bottle
        if (minCostForOneLiter * 2 < bulkCostForTwoLiters) {
            // It's always better to buy 1-liter equivalents
            console.log(requiredLiters * minCostForOneLiter);
        } else {
            // It's better to buy 2-liter bulk bottles for even parts, and 1-liter equivalent for the remainder
            // Calculate the number of 2-liter bottles needed (integer division)
            const numTwoLiterBottles = ~~(requiredLiters / 2);
            // Calculate the cost for the 2-liter bottles
            const costForBulkPart = numTwoLiterBottles * bulkCostForTwoLiters;
            // Calculate the cost for the remaining 1 liter (if N is odd)
            const costForRemainingLiter = (requiredLiters % 2) * minCostForOneLiter; // This will be 0 if N is even, or minCostForOneLiter if N is odd.
            // Output the total minimum cost
            console.log(costForBulkPart + costForRemainingLiter);
        }
    }
});
