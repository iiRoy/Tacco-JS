// This function processes a given input string to perform a specific calculation.
function CalculateSum(rawInputString) {
    // Step 1: Split the entire input string into an array of lines, using the newline character as a delimiter.
    var inputData = rawInputString.split("\n");

    // Step 2: For each line obtained, split it further into an array of string numbers, using space as a delimiter.
    inputData = inputData.map(currentLine => currentLine.split(" "));

    // Step 3: Iterate through the nested arrays and convert all string numbers into actual integers (base 10).
    inputData = inputData.map(lineOfStrings => lineOfStrings.map(stringNumber => parseInt(stringNumber, 10)));

    // Initialize a variable to store the final computed result of the complex reduction operation.
    // The calculation is performed on the second line of the processed numeric data (index 1).
    var computedResult = inputData[1].reduce((accumulatorSum, currentValue, currentIndex, sourceCollection) => {
        // Create a sub-collection (subarray) starting from the current index up to the end of the source collection.
        var subCollection = sourceCollection.slice(currentIndex, sourceCollection.length);

        // Perform an inner reduction on the created sub-collection.
        // This inner reduction excludes the first element of the sub-collection and calculates
        // the sum of products of the first element with all subsequent elements in that sub-collection.
        var subCollectionProduct = subCollection.slice(1, subCollection.length).reduce((partialProductSum, nextValue) => {
            // Multiply the first element of the current sub-collection by the next element and add to the partial sum.
            return partialProductSum + subCollection[0] * nextValue;
        }, 0); // The initial value for this inner sum of products is zero.

        // Add the result of the inner reduction (subCollectionProduct) to the main accumulator sum.
        return accumulatorSum + subCollectionProduct;
    }, 0); // The initial value for the main accumulator sum is also zero.

    // Output the final computed result to the standard console.
    console.log(computedResult);
}

// Read the input from standard input using Node.js's built-in 'fs' module.
// The input file path is '/dev/stdin' and it's read with 'utf8' encoding.
// This raw input string is then passed to the 'CalculateSum' function for processing.
CalculateSum(require("fs").readFileSync("/dev/stdin", "utf8"));
