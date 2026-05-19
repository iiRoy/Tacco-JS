var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
    rawData += dataSegment;
});
process.stdin.on('end', function() {
    processInputData(rawData);
});

function processInputData(fullInput) {
    var lineEntries = fullInput.trim().split('\n');

    for (var idx = 0; idx < lineEntries.length; idx++) {
        var numericPair = lineEntries[idx].split(' ').map(Number);
        var countDigits = numericPair[0];
        var targetSum = numericPair[1];

        if (!countDigits && !targetSum) {
            return;
        }
        console.log(calculateCombinations(countDigits, targetSum));
    }
}

function calculateCombinations(countDigits, targetSum) {
    const maxPossibleSum = 45; // Maximum sum for 10 distinct digits (0-9)
    const maxDigits = 10;     // Maximum number of distinct digits (0-9)

    // dpTable[k][s] stores the number of ways to choose k distinct digits
    // that sum up to s.
    // Initialize all entries with zero.
    const dpTable = Array(maxDigits + 1).fill(0).map(() =>
        Array(maxPossibleSum + 1).fill(0)
    );

    // Base case: There is 1 way to choose 0 digits that sum to 0 (the empty set).
    dpTable[0][0] = 1;

    // Iterate through each possible digit from 0 to 9.
    for (let currentDigit = 0; currentDigit <= 9; currentDigit++) {
        // Iterate k (number of digits chosen) downwards.
        // This ensures that each digit (currentDigit) is used at most once
        // for a given (k, s) state calculation.
        for (let k = countDigits; k >= 1; k--) {
            // Iterate s (current sum) downwards.
            // We only need to consider sums that are at least currentDigit
            // to be able to include currentDigit in the sum.
            for (let currentS = targetSum; currentS >= currentDigit; currentS--) {
                // If we include currentDigit in the combination:
                // We need to find (k-1) digits that sum to (currentS - currentDigit).
                // Add the number of ways from this previous state to the current state.
                dpTable[k][currentS] += dpTable[k - 1][currentS - currentDigit];
            }
        }
    }

    // The final result is the number of ways to choose 'countDigits' digits
    // that sum up to 'targetSum'.
    return dpTable[countDigits][targetSum];
}
