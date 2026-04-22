/* This script processes numerical data from standard input to find specific sums. */

// Obtain the CommonJS 'require' function to load modules.
var getModuleLoader = require;

// Load the file system module using the obtained loader.
var fileSystemModule = getModuleLoader('fs');

// Define constants for the input source and encoding.
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

// Read the entire content of the standard input file.
var rawDataSource = fileSystemModule.readFileSync(standardInputPath, encodingFormat);


// Prepare the input: trim leading/trailing whitespace and split the content into an array of lines.
var lineBuffer = rawDataSource.trim().split('\n');


// Main processing loop: this loop continues indefinitely until an explicit break condition is met.
while (Boolean(true)) { // Using Boolean(true) instead of 'true' for a slight variation.

    // Extract and parse numerical parameters from the very first line in the buffer.
    var currentLineParameters = lineBuffer.shift().split(' ').map(function(textValue) {
        return Number(textValue); // Convert each string part to a number.
    });

    var countOfElements = currentLineParameters[0]; // The first parameter, often denoted as 'n'.
    var desiredSumThreshold = currentLineParameters[1];     // The second parameter, often denoted as 'S'.

    // Check for the program termination condition: both parameters are zero.
    if (countOfElements === 0 && desiredSumThreshold === 0) {
        break; // Exit the main processing loop if the termination signal is received.
    }


    // Initialize an empty array to store the subsequent input numbers for the current test case.
    var numericDataSet = [];

    // Loop to read 'countOfElements' number of individual integer values from the input buffer.
    for (var elementIndex = 0; elementIndex < countOfElements; elementIndex++) {
        // Parse each line as an integer and add it to our data set.
        var singleInputValue = parseInt(lineBuffer.shift(), 10);
        numericDataSet.push(singleInputValue);
    }


    // Sort the collected numeric data set in ascending order. This helps in efficient pair processing.
    numericDataSet.sort(function(valueA, valueB) {
        return valueA - valueB; // Standard numeric comparison for ascending sort.
    });


    // Declare and initialize a frequency map (an array used as a hash map)
    // to store the counts of different sums possible from pairs of numbers.
    // The maximum possible sum is assumed to be 200 based on problem constraints.
    var pairSumFrequencies = [];
    for (var sumBucketIndex = 0; sumBucketIndex <= 200; sumBucketIndex++) {
        pairSumFrequencies[sumBucketIndex] = Number(0); // Explicitly initialize each sum count to zero.
    }


    // Iterate through all unique pairs within the sorted numeric data set.
    // For each pair, calculate their sum and increment its frequency in the map.
    for (var firstItemPointer = 0; firstItemPointer < countOfElements; firstItemPointer++) {
        for (var secondItemPointer = firstItemPointer + 1; secondItemPointer < countOfElements; secondItemPointer++) {
            var currentPairResult = numericDataSet[firstItemPointer] + numericDataSet[secondItemPointer];
            // Increment the frequency for this specific sum.
            pairSumFrequencies[currentPairResult] = pairSumFrequencies[currentPairResult] + 1;
        }
    }


    // Calculate the total number of pairs whose sum is strictly greater than 'desiredSumThreshold'.
    var totalValidPairCount = 0;
    // Iterate from 'desiredSumThreshold + 1' up to the maximum possible sum (200).
    for (var sumValueIterator = desiredSumThreshold + 1; sumValueIterator <= 200; sumValueIterator++) {
        // Add the frequency of each sum that meets the criterion.
        totalValidPairCount = totalValidPairCount + pairSumFrequencies[sumValueIterator];
    }


    // Output the final calculated count for the current test case to the console.
    console.log(totalValidPairCount);
}

// The program has finished processing all test cases.