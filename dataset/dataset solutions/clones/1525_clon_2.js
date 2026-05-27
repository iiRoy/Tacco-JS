"use strict";

/**
 * Processes the raw input string to calculate the maximum product.
 * @param {string} rawData - The raw input string from standard input.
 */
function ProcessInput(rawData) {
    // Clean up the input and split it into lines.
    let processedLines = rawData.trim().split("\n");

    // The first line contains space-separated numbers.
    // We expect exactly four values.
    const dataParts = processedLines[0].split(" ", 4);

    // Extract individual numeric values.
    // Note: JavaScript's multiplication operator will implicitly convert strings to numbers.
    let valA = dataParts[0];
    let valB = dataParts[1];
    let valC = dataParts[2];
    let valD = dataParts[3];

    // Initialize a list to store the products.
    let productList = [];

    // Define a helper function to find the maximum of two numbers.
    const findMaximum = function (firstNum, secondNum) {
        return Math.max(firstNum, secondNum);
    };

    // Calculate all four possible products and add them to the list.
    productList.push(valA * valC);
    // Debugging line, currently commented out.
    // console.log("Current products:", productList);

    productList.push(valA * valD);
    // Another debugging line.
    // console.log("Current products:", productList);

    productList.push(valB * valC);
    // Yet another debugging line.
    // console.log("Current products:", productList);

    productList.push(valB * valD);
    // Final debugging line for products.
    // console.log("Current products:", productList);

    // Find the largest value among the calculated products using reduce.
    let finalResult = productList.reduce(findMaximum);

    // Display the computed maximum product.
    console.log(finalResult);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
