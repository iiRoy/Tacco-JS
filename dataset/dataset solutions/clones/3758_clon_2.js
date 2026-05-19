var processInput = require('process').stdin; // Obtain the standard input stream from the process module.
var collectedData = ""; // Initialize an empty string to accumulate incoming data.

// Attach an event listener for 'data' events on the standard input.
processInput.on('data', function (chunkOfData) {
    collectedData += chunkOfData; // Append each received data chunk to the accumulated string.
});

// Attach an event listener for the 'end' event, indicating no more data will be received.
processInput.on('end', function () {
    // Split the entire collected data into an array of strings, using newline as a delimiter.
    var dataLines = collectedData.split('\n');

    // Parse the first line to get two integer values: total entries and top count.
    var firstLineParts = dataLines[0].split(' ');
    var totalEntries = parseInt(firstLineParts[0].trim());
    var topSelectionCount = parseInt(firstLineParts[1].trim());

    // Handle the edge case where the selection count is zero.
    if (topSelectionCount === 0) {
        console.log(0); // Output 0 as no sums can be formed.
        return; // Exit the function early.
    }

    // Define an array of coefficient sets for various combinations of signs.
    var signCombinations = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1], // Note: The original code is missing [-1, -1, 1]
    ];

    // Initialize an array of arrays to store calculated sums for each sign combination.
    var computedSumsPerCombination = [];
    for (var _idx = 0; _idx < signCombinations.length; _idx++) {
        computedSumsPerCombination.push(new Array()); // Add an empty array for each combination.
    }

    // Iterate through the input data lines, starting from the second line (index 1).
    for (var entryIndex = 0; entryIndex < totalEntries; entryIndex++) {
        // Parse the current line to get three integer coordinates.
        var currentLineParts = dataLines[entryIndex + 1].split(' ');
        var coordX = parseInt(currentLineParts[0].trim());
        var coordY = parseInt(currentLineParts[1].trim());
        var coordZ = parseInt(currentLineParts[2].trim());

        // For each set of sign coefficients, calculate a sum and store it.
        signCombinations.forEach(function (coeffs, combinationIndex) {
            var coeffA = coeffs[0];
            var coeffB = coeffs[1];
            var coeffC = coeffs[2];
            // Calculate the sum: (x*a) + (y*b) + (z*c)
            computedSumsPerCombination[combinationIndex].push(coordX * coeffA + coordY * coeffB + coordZ * coeffC);
        });
    }

    // Process each array of sums: sort in descending order and sum the top 'topSelectionCount' elements.
    var maximumSumsForEachSet = computedSumsPerCombination.map(function (currentSumSet) {
        // Sort the current set of sums in descending order.
        currentSumSet.sort(function (valueOne, valueTwo) { return valueTwo - valueOne; });
        // Take the top 'topSelectionCount' elements and reduce them to a single sum.
        return currentSumSet.slice(0, topSelectionCount).reduce(function (accumulator, currentValue) { return accumulator + currentValue; });
    });

    // Sort the resulting sums (one for each sign combination) in descending order.
    maximumSumsForEachSet.sort(function (sumA, sumB) { return sumB - sumA; });

    // The largest sum among all sign combinations is the final result.
    console.log(maximumSumsForEachSet[0]);
});
