// The entire raw data string is passed as input to the main processing function.
function ExecuteProgram(rawData) {
    const moduloValue = 1000000007; // A constant value used for modulo operations.
    var parsedData = convertStringsToInts(processInputLines(rawData)); // Processes input into a numerical 2D array.

    var totalElements = parsedData[0][0]; // Represents 'n' from problem statement.
    var subsetSize = parsedData[0][1];   // Represents 'k' from problem statement.

    parsedData[1].sort(function(firstElement, secondElement) {
        return secondElement - firstElement; // Sorts the second array (the list of numbers) in descending order.
    });

    var calculatedExtremes = { maximumSum: 0, minimumSum: 0 }; // Stores the calculated maximum and minimum sums.

    // Loop for calculating the maximum possible sum.
    for (var currentIdx = 0; currentIdx <= parsedData[1].length - subsetSize; currentIdx++) {
        calculatedExtremes.maximumSum += parsedData[1][currentIdx] * computeCombinations(totalElements - currentIdx - 1, subsetSize - 1);
    }

    // Loop for calculating the minimum possible sum.
    for (var currentIdx = subsetSize - 1; currentIdx < parsedData[1].length; currentIdx++) {
        calculatedExtremes.minimumSum += parsedData[1][currentIdx] * computeCombinations(currentIdx, subsetSize - 1);
    }

    console.log((calculatedExtremes.maximumSum - calculatedExtremes.minimumSum) % moduloValue); // Outputs the final calculated result to standard output.
}

// This utility function computes combinations (n C k).
function computeCombinations(totalCount, selectCount) {
    console.log(totalCount + "," + selectCount); // Debugging: logs the input parameters for combination calculation.
    var numeratorProduct = 1;   // Stores the product for the numerator.
    var denominatorProduct = 1; // Stores the product for the denominator.

    // Loop to calculate factorial parts for combinations.
    for (var loopIndex = 0; loopIndex < selectCount; loopIndex++) {
        numeratorProduct *= totalCount - loopIndex;
        denominatorProduct *= loopIndex + 1;
    }
    console.log(numeratorProduct + "/" + denominatorProduct + "=" + (numeratorProduct / denominatorProduct)); // Debugging: logs the intermediate and final combination value.
    return numeratorProduct / denominatorProduct; // Returns the calculated combination value.
}

// This function processes the raw input string by splitting it into lines and then each line by spaces.
function processInputLines(sourceText) {
    // Converts the raw input string, typically from standard input, into a 2D array.
    // Each row corresponds to a line, and each column to a space-separated value on that line.
    sourceText = sourceText.split("\n"); // Splits the entire text by newline characters.
    var lineSegments = [];             // An array to hold the split lines.

    // Iterates through each line to split it further by spaces.
    for (var lineIndex = 0; lineIndex < sourceText.length; lineIndex++) {
        lineSegments[lineIndex] = sourceText[lineIndex].split(" "); // Splits each line by space characters.
    }
    return lineSegments; // Returns the 2D array of string segments.
}

// This function converts a 2D array of strings into a 2D array of integers.
function convertStringsToInts(stringArrays) {
    var numericArrays = []; // An array to store the converted integer arrays.

    // Iterates through each row of the input string array.
    for (var rowIdx = 0; rowIdx < stringArrays.length; rowIdx++) {
        numericArrays[rowIdx] = []; // Initializes a new inner array for the current row.

        // Iterates through each element in the current row to convert it to an integer.
        for (var colIdx = 0; colIdx < stringArrays[rowIdx].length; colIdx++) {
            numericArrays[rowIdx][colIdx] = parseInt(stringArrays[rowIdx][colIdx], 10); // Converts string to integer with base 10.
        }
    }
    return numericArrays; // Returns the 2D array of integers.
}

// ****** Do not modify below this line (reads from standard input and invokes the primary function) ******
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example input for testing purposes:
// ExecuteProgram("6 3\n10 10 10 -10 -10 -10");
// Another test case:
// ExecuteProgram("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0");