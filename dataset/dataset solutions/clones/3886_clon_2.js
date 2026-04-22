// This module handles file system operations for reading input
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// An immediately invoked function expression (IIFE) to process the input
(function (sourceLine) {
    // Parse the numerical values from the input string
    // The input string is trimmed, split by spaces, and each part converted to a number
    const [
        priceOfA,      // Cost per unit of item A
        priceOfB,      // Cost per unit of item B
        priceOfAB,     // Cost per two units (one A, one B) of combined item
        quantityOfA,   // Desired quantity of item A
        quantityOfB    // Desired quantity of item B
    ] = sourceLine.trim().split(' ').map(Number);

    // Calculate the total cost using different purchasing strategies

    // Strategy 1: Buy all items individually
    // Total cost = (quantity A * price A) + (quantity B * price B)
    const calcOption1 = priceOfA * quantityOfA + priceOfB * quantityOfB;

    // Strategy 2: Buy only combined items, enough to cover the maximum needed quantity
    // Each combined item provides 1 A and 1 B. So, to get max(A, B) of each, we need max(A, B) combined items.
    // Total cost = (price of AB * max(quantity A, quantity B) * 2)
    const calcOption2 = priceOfAB * Math.max(quantityOfA, quantityOfB) * 2;

    // Strategy 3: Buy combined items for the minimum common quantity, then individual items for the remainder
    // Remaining A = max(quantity A - quantity B, 0)
    // Remaining B = max(quantity B - quantity A, 0)
    // Common quantity = min(quantity A, quantity B)
    // Total cost = (remaining A * price A) + (remaining B * price B) + (common quantity * price AB * 2)
    const calcOption3 = priceOfA * Math.max(quantityOfA - quantityOfB, 0) +
                        priceOfB * Math.max(quantityOfB - quantityOfA, 0) +
                        priceOfAB * Math.min(quantityOfA, quantityOfB) * 2;

    // Output the minimum cost among the three calculated options
    console.log(Math.min(calcOption1, calcOption2, calcOption3));

})(fileContent); // Pass the raw file content to the processing function