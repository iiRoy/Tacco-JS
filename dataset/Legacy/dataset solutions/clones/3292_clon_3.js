'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to find the maximum value in an array
const findMaximum = (inputArray) => {
    let currentMaxVal = -Number.POSITIVE_INFINITY; // Use Number.POSITIVE_INFINITY for clarity
    // Iterate through the array to find the maximum element
    for (let currentIndex = 0; currentIndex < inputArray.length; currentIndex++) {
        if (inputArray[currentIndex] > currentMaxVal) {
            currentMaxVal = inputArray[currentIndex];
        }
    }
    return currentMaxVal;
};

// Helper function to find the minimum value in an array
const findMinimum = (inputArray) => {
    let currentMinVal = Number.POSITIVE_INFINITY; // Use Number.POSITIVE_INFINITY for clarity
    // Iterate through the array to find the minimum element
    for (let currentIndex = 0; currentIndex < inputArray.length; currentIndex++) {
        if (inputArray[currentIndex] < currentMinVal) {
            currentMinVal = inputArray[currentIndex];
        }
    }
    return currentMinVal;
};

// Helper to parse the number of elements from a string line
const parseNumElements = (lineContent) => parseInt(lineContent, 10); // Explicit radix for parseInt

// Helper to parse the heights array from a string line
const parseHeights = (lineContent) => lineContent.split(" ").map(Number);

// Helper to calculate absolute difference between two numbers
const calculateAbsoluteDifference = (valueA, valueB) => Math.abs(valueA - valueB);

// Helper to initialize the base costs for the dynamic programming problem
const initializeBaseCosts = (costsContainer, heightsData) => {
    if (costsContainer.length > 0) {
        costsContainer[0] = 0;
    }
    if (costsContainer.length > 1) {
        costsContainer[1] = calculateAbsoluteDifference(heightsData[0], heightsData[1]);
    }
};

// Main processing function for the input data
const processInputData = (rawDataString) => {
    const inputLines = rawDataString.split("\n");

    // Parse the number of elements (N) from the first line
    const numElements = parseNumElements(inputLines[0]);

    // Parse the array of heights (h) from the second line
    const heightsArr = parseHeights(inputLines[1]);

    // Initialize the cost array (c) with positive infinity
    // Using Array.from for a slightly different array creation method
    const costArray = Array.from({ length: numElements }, () => Number.POSITIVE_INFINITY);

    // Initialize the base cases for the cost array
    initializeBaseCosts(costArray, heightsArr);

    // Output the heights array as per original behavior
    console.log(heightsArr);

    // Calculate minimum costs using dynamic programming
    // Iterate from the third element (index 2) up to N-1
    for (let currentStepIndex = 2; currentStepIndex < numElements; currentStepIndex++) {
        // Define indices for previous steps to improve readability
        const previousStepOneIndex = currentStepIndex - 1;
        const previousStepTwoIndex = currentStepIndex - 2;

        // Retrieve costs from previous steps
        const costFromPreviousOne = costArray[previousStepOneIndex];
        const costFromPreviousTwo = costArray[previousStepTwoIndex];

        // Retrieve heights for current and previous steps
        const currentHeight = heightsArr[currentStepIndex];
        const heightAtPreviousOne = heightsArr[previousStepOneIndex];
        const heightAtPreviousTwo = heightsArr[previousStepTwoIndex];

        // Calculate jump costs using the helper function
        const jumpCostToPreviousOne = calculateAbsoluteDifference(currentHeight, heightAtPreviousOne);
        const jumpCostToPreviousTwo = calculateAbsoluteDifference(currentHeight, heightAtPreviousTwo);

        // Calculate total costs for each possible path
        const totalCostPathOne = costFromPreviousOne + jumpCostToPreviousOne;
        const totalCostPathTwo = costFromPreviousTwo + jumpCostToPreviousTwo;

        // Store the minimum of the two paths in the current step's cost
        costArray[currentStepIndex] = Math.min(totalCostPathOne, totalCostPathTwo);
    }

    // Output the final cost array and the cost for the last element
    console.log(costArray, costArray[numElements - 1]);
};

// Read input from stdin and pass to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
