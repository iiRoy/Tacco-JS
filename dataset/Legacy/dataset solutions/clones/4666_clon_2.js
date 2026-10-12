function processInputData(rawData) {
    // Convert the incoming string data to a numerical format.
    const numericValue = +rawData;

    // Initialize an array to hold the calculated lengths.
    var resultLengths = [];

    // Loop through possible factors up to the square root of the numeric value.
    for (var divisorCandidate = 1; divisorCandidate * divisorCandidate <= numericValue; divisorCandidate++) {
        // Calculate the first factor.
        var quotientOne = numericValue / divisorCandidate;
        // Calculate the second factor, which is equivalent to the current divisorCandidate.
        var quotientTwo = numericValue / quotientOne;

        // Determine the maximum string length between the two factors and store it.
        resultLengths.push(Math.max(quotientOne.toString().length, quotientTwo.toString().length));
    }

    // Sort the collected lengths numerically in ascending order and output the smallest one.
    console.log(resultLengths.sort(function(valA, valB) {
        return valA - valB;
    })[0]);
}

// Execute the primary function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
