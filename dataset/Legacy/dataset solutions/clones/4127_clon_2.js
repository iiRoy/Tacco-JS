var inputData = []; // Stores all lines read from standard input.
var inputReader = require('readline'); // Module for reading input line by line.

// Create an interface for reading input and writing output.
var ioHandler = inputReader.createInterface({
    input: process.stdin, // Standard input stream.
    output: process.stdout, // Standard output stream.
});

// Event listener for each line received.
ioHandler.on('line', function (currentLineContent) {
    inputData.push(currentLineContent); // Add the line to our collection.
});

// Event listener for when the input stream closes.
ioHandler.on('close', function () {
    // Parse the first line to get the total number of queries.
    var numberOfQueries = Number(inputData[0]);
    inputData.shift(); // Remove the first line as it's processed.

    // Process remaining lines to get query ranges.
    // Each line is split by space, and parts are converted to numbers.
    var queryRanges = inputData.map(strItem => strItem.split(" ").map(strPart => Number(strPart)));

    // Create a copy of queryRanges, sort it in descending order based on the second element of each pair.
    var descendingRanges = queryRanges.concat().sort((firstPair, secondPair) => secondPair[1] - firstPair[1]);
    // Determine the maximum value needed for our calculations from the sorted ranges.
    var maximumValue = descendingRanges[0][1];

    // Initialize an array to store prefix sums, filled with zeros.
    var prefixSums = Array(maximumValue + 1).fill(0);

    // Set initial values for small numbers.
    prefixSums[0] = 0;
    prefixSums[1] = 1;
    prefixSums[2] = 2;
    prefixSums[3] = 3;

    // Calculate prefix sums for numbers from 4 up to maximumValue.
    // This loop identifies numbers 'i' where (i+1)/2 is prime.
    for (var currentNumber = 4; currentNumber <= maximumValue; currentNumber++) {
        // Inner loop to check for primality of (currentNumber + 1) / 2.
        for (var potentialDivisor = 2; potentialDivisor <= Math.sqrt(currentNumber); potentialDivisor++) {
            // If currentNumber is divisible by potentialDivisor, it's not prime (or (currentNumber+1)/2 is not prime in a specific way).
            if (currentNumber % potentialDivisor === 0) {
                break; // Exit inner loop, currentNumber is not a candidate.
            }
            // Check if ((currentNumber + 1) / 2) is divisible by potentialDivisor.
            if (((currentNumber + 1) / 2) % potentialDivisor === 0) {
                break; // Exit inner loop, (currentNumber+1)/2 is not prime.
            }
            // If potentialDivisor reaches the floor of sqrt(currentNumber) without breaking,
            // it implies (currentNumber+1)/2 is prime (and currentNumber is also prime, or a specific type of number).
            if (potentialDivisor === Math.floor(Math.sqrt(currentNumber))) {
                prefixSums[currentNumber]++; // Increment count for this number.
            }
        }
        // Add the previous prefix sum to the current one to maintain cumulative counts.
        prefixSums[currentNumber] += prefixSums[currentNumber - 1];
    }
    
    // Process each query.
    for (var queryIterator = 0; queryIterator < numberOfQueries; queryIterator++) {
        // If the start and end of the range are the same, the count is 1.
        if (queryRanges[queryIterator][1] === queryRanges[queryIterator][0]) {
            console.log(1);
        }
        // Otherwise, calculate the difference in prefix sums for the given range.
        else {
            console.log(prefixSums[queryRanges[queryIterator][1] - 1] - prefixSums[queryRanges[queryIterator][0] - 1]);
        }
    }
});
