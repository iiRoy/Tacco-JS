"use strict";

// This function processes the input data to calculate a specific difference.
const executeProcessing = (inputLines) => {
    // Parse the first line to get the count of elements.
    const elementCount = parseInt(inputLines[0], 10);

    // Process the second line: split by space, convert to numbers.
    let sortedNumbers = inputLines[1].split(' ').map(strVal => Number(strVal));

    // Sort the array of numbers in ascending order.
    sortedNumbers = sortedNumbers.sort((firstNum, secondNum) => firstNum - secondNum);

    // Calculate and print the difference between the middle two elements.
    // For an even number of elements 'N', the middle elements are at indices N/2 and N/2 - 1.
    console.log(sortedNumbers[elementCount / 2] - sortedNumbers[elementCount / 2 - 1]);
};

// Read input from standard input, decode as UTF-8, and split by newline.
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
