var processInput = function(rawInput) {
    rawInput = rawInput.split('\n');
    var lengthIndicator = rawInput.shift();
    var fullSequence = rawInput.join();

    var effectiveLength = Number(lengthIndicator);

    // The original code's string slicing (S.slice(0,i) and S.slice(i+1,N))
    // implicitly limits the string to the first 'N' characters for processing.
    // We replicate this by taking a substring of the full joined sequence.
    var targetSequence = fullSequence.slice(0, effectiveLength);

    // Initialize arrays to store prefix sums of 'E's and suffix sums of 'W's.
    // eastwardAccumulations[k] will store the count of 'E's in targetSequence[0...k-1].
    // westwardAccumulations[k] will store the count of 'W's in targetSequence[k...effectiveLength-1].
    var eastwardAccumulations = new Array(effectiveLength + 1).fill(0);
    var westwardAccumulations = new Array(effectiveLength + 1).fill(0);

    // Populate the eastwardAccumulations array.
    // This loop calculates how many 'E's are encountered from the beginning up to each position.
    for (let charPosition = 0; charPosition < effectiveLength; charPosition++) {
        eastwardAccumulations[charPosition + 1] = eastwardAccumulations[charPosition] + (targetSequence[charPosition] === 'E' ? 1 : 0);
    }

    // Populate the westwardAccumulations array.
    // This loop calculates how many 'W's are encountered from the end back to each position.
    for (let charPosition = effectiveLength - 1; charPosition >= 0; charPosition--) {
        westwardAccumulations[charPosition] = westwardAccumulations[charPosition + 1] + (targetSequence[charPosition] === 'W' ? 1 : 0);
    }

    var minimalObstacles = 300000; // Initialize with a sufficiently large value, matching original scale.

    // Iterate through all possible division points, similar to the original loop's 'i'.
    // 'divisionPoint' represents the index of the character that is excluded from both segments.
    // Left segment: targetSequence[0...divisionPoint-1]
    // Right segment: targetSequence[divisionPoint+1...effectiveLength-1]
    for (let divisionPoint = 1; divisionPoint < effectiveLength; divisionPoint++) {
        // Count 'E's in the left segment using the precomputed prefix sums.
        var currentEastCount = eastwardAccumulations[divisionPoint];

        // Count 'W's in the right segment using the precomputed suffix sums.
        var currentWestCount = westwardAccumulations[divisionPoint + 1];

        // The total number of obstacles for the current division point.
        var totalCurrentObstacles = currentEastCount + currentWestCount;

        // Update the minimum if a smaller count is found.
        // The original code checks for -0, which is numerically equivalent to 0.
        if (totalCurrentObstacles === 0 || totalCurrentObstacles === -0) {
            minimalObstacles = 0;
            break; // If 0 obstacles are found, it's the absolute minimum, so we can stop.
        } else if (totalCurrentObstacles < minimalObstacles) {
            minimalObstacles = totalCurrentObstacles;
        }
    }

    console.log(minimalObstacles);
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
