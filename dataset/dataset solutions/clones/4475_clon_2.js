"use strict";

// This is the main entry point function for processing the input data.
const ProcessInput = (rawData) => {
    // First, clean up the raw input string by trimming whitespace
    // and then splitting it into an array of individual lines.
    let linesArray = rawData.trim().split('\n');

    // Extract numerical parameters from the first line of input.
    // 'countItems' represents the total number of elements available.
    let countItems = Number(linesArray[0].split(' ')[0]);
    // 'numToSelect' indicates how many of the largest elements should be summed.
    let numToSelect = Number(linesArray[0].split(' ')[1]);

    // Initialize an empty array to hold the numeric values that will be processed.
    let dataList = [];

    // Iterate through the second line of input, splitting it by spaces,
    // and adding each resulting string (which represents a number) to 'dataList'.
    // The loop runs 'countItems' times, as specified by the first parameter.
    for (let idx = 0; idx < countItems; idx++) {
        dataList.push(linesArray[1].split(' ')[idx]);
    }

    // Define a custom comparison function for sorting.
    // This function is designed to sort elements in descending order.
    // When 'valA' is greater than 'valB', 'valA - valB' is positive,
    // causing 'valA' to be placed before 'valB' in the sorted array.
    const sortDescending = (valB, valA) => {
        return valA - valB;
    };

    // Apply the custom sorting function to 'dataList', arranging its elements
    // from largest to smallest.
    dataList.sort(sortDescending);

    // Initialize a variable to store the cumulative sum of the selected elements.
    let totalSum = 0;

    // Loop through the first 'numToSelect' elements of the now sorted 'dataList'.
    // Convert each element to a number and add it to 'totalSum'.
    for (let idx = 0; idx < numToSelect; idx++) {
        totalSum += Number(dataList[idx]);
    }

    // Print the final calculated sum to the standard output.
    console.log(totalSum);
};

// Read the entire content of standard input synchronously,
// decode it as UTF-8, and then pass it to the 'ProcessInput' function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
