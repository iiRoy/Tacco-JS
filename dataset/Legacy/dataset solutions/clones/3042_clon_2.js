"use strict";

// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // Initialize an instance of the custom data parser.
    let dataReader = new DataParser(rawData);

    // Extract the number of elements and the array of integers from the input.
    let elementCount = dataReader.retrieveInteger();
    let dataArray = dataReader.getIntArray(elementCount);

    // Define key constants used throughout the computation.
    const MaximumN = 305; // Represents the maximum possible value for 'n'.
    const moduloPrime = 998244353; // The prime modulus for all arithmetic operations.

    // Initialize an array to store prefix sums of the sorted dataArray.
    // It's 1-indexed, so the first element (index 0) is set to 0.
    let prefixSums = new Array(MaximumN);
    prefixSums[0] = 0;

    // Initialize two dynamic programming arrays, filled with zeros.
    // Their size is determined by the maximum possible sum (MaximumN * MaximumN).
    let dynamicProg = new Array(MaximumN * MaximumN).fill(0);
    let dynamicProgAlt = new Array(MaximumN * MaximumN).fill(0);

    // Helper function for performing modular addition.
    const sumModulo = (val1, val2) => (val1 % moduloPrime + val2 % moduloPrime) % moduloPrime;

    // Helper function for integer division by two.
    const halfValue = (val) => Math.floor(val / 2);

    // Helper function for general integer division (defined but not used in original logic).
    const integerDivision = (numerator, denominator) => Math.floor(numerator / denominator);

    // Sort the input data array in ascending order.
    // Prepend a zero to make it 1-indexed for easier prefix sum calculation.
    dataArray.sort((valA, valB) => valA - valB);
    dataArray.unshift(0); // Adds 0 at the beginning of the array.

    // Compute the prefix sums for the 1-indexed dataArray.
    for (let loopIndex = 1; loopIndex <= elementCount; loopIndex++) {
        prefixSums[loopIndex] = prefixSums[loopIndex - 1] + dataArray[loopIndex];
    }

    // Set the base cases for the dynamic programming arrays.
    // dynamicProg[0] represents 2^n ways (each element can either be included or excluded).
    // dynamicProgAlt[0] represents 1 way (the empty set).
    dynamicProg[0] = Math.pow(2, elementCount);
    dynamicProgAlt[0] = 1;

    // The modular multiplicative inverse of 2 modulo 998244353.
    // This is equivalent to 499122177.
    const modInverseOfTwo = (moduloPrime + 1) / 2;

    // Populate the dynamic programming arrays.
    // Iterate through each element of the sorted data array.
    for (let loopIndex = 1; loopIndex <= elementCount; loopIndex++) {
        // Iterate backwards from the current maximum possible sum down to the current element's value.
        for (let currentSum = prefixSums[loopIndex]; currentSum >= dataArray[loopIndex]; currentSum--) {
            // Update dynamicProg: add the ways to form (currentSum - dataArray[loopIndex]),
            // scaled by the modular inverse of 2.
            dynamicProg[currentSum] = sumModulo(dynamicProg[currentSum], modInverseOfTwo * dynamicProg[currentSum - dataArray[loopIndex]]);
            // Update dynamicProgAlt: add the ways to form (currentSum - dataArray[loopIndex]).
            dynamicProgAlt[currentSum] = sumModulo(dynamicProgAlt[currentSum], dynamicProgAlt[currentSum - dataArray[loopIndex]]);
        }
    }

    // Initialize the variable to store the final computed result.
    let finalResult = 0;

    // If the total sum of all elements is even, adjust finalResult.
    if (!(prefixSums[elementCount] % 2)) {
        finalResult += dynamicProg[halfValue(prefixSums[elementCount])] - dynamicProgAlt[halfValue(prefixSums[elementCount])];
    }

    // Sum up values from dynamicProg for sums greater than half the total sum.
    for (let loopIndex = halfValue(prefixSums[elementCount]) + 1; loopIndex <= prefixSums[elementCount]; loopIndex++) {
        finalResult = sumModulo(finalResult, dynamicProg[loopIndex]);
    }

    // Multiply the current result by 3 as per the algorithm.
    finalResult *= 3;

    // Apply the final formula: (3^n - finalResult) modulo moduloPrime.
    // The '+ moduloPrime) % moduloPrime' ensures the result is always positive.
    finalResult = ((Math.pow(3, elementCount) - finalResult) % moduloPrime + moduloPrime) % moduloPrime;

    // Output the final calculated answer to the console.
    console.log(finalResult);
}

// Custom class designed to parse input strings into various data types.
class DataParser {
    // Constructor takes the raw input string.
    constructor(sourceText) {
        // Initialize an index to keep track of the current token being processed.
        this.tokenIndex = 0;
        // Split the input string into an array of tokens using newlines or spaces as delimiters.
        this.tokenList = sourceText.split(/\n|\s/);
    }

    // Retrieves the next token from the list and converts it to an integer.
    retrieveInteger() {
        // The unary minus operator (`- 0`) is a concise way to convert a string to a number.
        return this.tokenList[this.tokenIndex++] - 0;
    }

    // Retrieves an array of integers of a specified length.
    getIntArray(count) {
        let resultArray = new Array(count);
        for (let idx = 0; idx < count; idx++) {
            resultArray[idx] = this.retrieveInteger();
        }
        return resultArray;
    }

    // Retrieves the next token from the list as a string.
    fetchString() {
        return this.tokenList[this.tokenIndex++];
    }

    // Retrieves an array of strings of a specified length.
    getStrArray(numStrings) {
        let stringCollection = new Array(numStrings);
        for (let k = 0; k < numStrings; k++) {
            stringCollection[k] = this.fetchString();
        }
        return stringCollection;
    }
}

// This block handles the execution environment.
// If the code is running in a Node.js environment (i.e., 'window' is undefined),
// it reads input from standard input and passes it to the main processing function.
if (typeof window == "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
