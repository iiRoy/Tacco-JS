/**
 * Processes input data to calculate minimum coin counts for two distinct sets of denominations.
 * This function computes dynamic programming tables for two sequences of numbers.
 *
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
    // Parse the raw input string into an array of arrays, splitting by newlines and spaces.
    // Each line is expected to contain a single number, which will be the target for DP lookup.
    let processedData = rawData.trim().split("\n").map((element) => element.split(" "));

    // Define the first sequence of "coin" denominations.
    // These numbers represent the values for which we want to find the minimum count.
    const firstSequence = [1,4,10,20,35,56,84,120,165,220,286,364,455,560,680,816,969,1140,1330,1540,1771,2024,2300,2600,2925,3276,3654,4060,4495,4960,5456,5984,6545,7140,7770,8436,9139,9880,10660,11480,12341,13244,14190,15180,16215,17296,18424,19600,20825,22100,23426,24804,26235,27720,29260,30856,32509,34220,35990,37820,39711,41664,43680,45760,47905,50116,52394,54740,57155,59640,62196,64824,67525,70300,73150,76076,79079,82160,85320,88560,91881,95284,98770,102340,105995,109736,113564,117480,121485,125580,129766,134044,138415,142880,147440,152096,156849,161700,166650,171700,176851,182104,187460,192920,198485,204156,209934,215820,221815,227920,234136,240464,246905,253460,260130,266916,273819,280840,287980,295240,302621,310124,317750,325500,333375,341376,349504,357760,366145,374660,383306,392084,400995,410040,419220,428536,437989,447580,457310,467180,477191,487344,497640,508080,518665,529396,540274,551300,562475,573800,585276,596904,608685,620620,632710,644956,657359,669920,682640,695520,708561,721764,735130,748660,762355,776216,790244,804440,818805,833340,848046,862924,877975,893200,908600,924176,939929,955860,971970,988260];
    // Define the second sequence of "coin" denominations.
    const secondSequence = [1,35,165,455,969,1771,2925,4495,6545,9139,12341,16215,20825,26235,32509,39711,47905,57155,67525,79079,91881,105995,121485,138415,156849,176851,198485,221815,246905,273819,302621,333375,366145,400995,437989,477191,518665,562475,608685,657359,708561,762355,818805,877975,939929];

    // Initialize dynamic programming tables for both sequences.
    // `minCoinsA[k]` will store the minimum number of coins from `firstSequence` to make sum `k`.
    // `minCoinsB[k]` will store the minimum number of coins from `secondSequence` to make sum `k`.
    let minCoinsA = [];
    let minCoinsB = [];

    // Set the upper bound for the DP table size.
    const limitValue = 1000000;

    // Fill DP tables with a large value (infinity) initially, representing an unreachable state.
    for (let idx = 0; idx < limitValue; idx++) {
        minCoinsA[idx] = Infinity;
    }
    for (let idx = 0; idx < limitValue; idx++) {
        minCoinsB[idx] = Infinity;
    }

    // Base case: 0 coins are needed to make a sum of 0.
    minCoinsA[0] = 0;
    minCoinsB[0] = 0;

    // Populate the DP tables using a bottom-up approach.
    // For each possible sum `idx` from 0 up to `limitValue - 1`:
    for (let idx = 0; idx < limitValue; idx++) {
        // Calculate minimum coins for `firstSequence`.
        for (let subIdx = 0; subIdx < firstSequence.length; subIdx++) {
            // If the current sum `idx` is greater than or equal to the current coin denomination,
            // we can potentially use this coin.
            if (idx - firstSequence[subIdx] >= 0) {
                // Update `minCoinsA[idx]` with the minimum of its current value
                // and the value obtained by using one more coin (`firstSequence[subIdx]`)
                // plus the minimum coins needed for the remaining amount (`idx - firstSequence[subIdx]`).
                minCoinsA[idx] = Math.min(minCoinsA[idx - firstSequence[subIdx]] + 1, minCoinsA[idx]);
            }
        }

        // Calculate minimum coins for `secondSequence`.
        for (let subIdx = 0; subIdx < secondSequence.length; subIdx++) {
            // Similar logic as above, but for the second sequence of denominations.
            if (idx - secondSequence[subIdx] >= 0) {
                minCoinsB[idx] = Math.min(minCoinsB[idx - secondSequence[subIdx]] + 1, minCoinsB[idx]);
            }
        }
    }

    // Process each input number from the `processedData` array.
    // The loop continues until a '0' is encountered as the first element of a line.
    while (true) {
        // Get the next number from the processed input.
        let currentNum = processedData.shift();

        // Check for the termination condition.
        if (currentNum[0] === '0') {
            break;
        }

        // Output the minimum coin counts for the current number from both DP tables.
        // The numbers are concatenated with a space in between.
        console.log(minCoinsA[currentNum] + " " + minCoinsB[currentNum]);
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
