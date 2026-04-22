const fileData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read data from standard input path
const contentLines = fileData.trim().split("\n"); // Split input into an array of lines after trimming whitespace

const sizePair = contentLines.shift().split(" ").map(Number); // Get the first line, split by space, convert to numbers
const itemCount = sizePair[0]; // Extract the first dimension (n)
const categoryCount = sizePair[1]; // Extract the second dimension (m)

const productCosts = []; // Initialize an array to store product costs
for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    productCosts.push(Number(contentLines.shift())); // Populate product costs from subsequent lines
}

const selectionCosts = []; // Initialize an array for category selection costs
for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
    selectionCosts.push(Number(contentLines.shift())); // Populate category costs from remaining lines
}

// Initialize a 2D array for dynamic programming table
const costMatrix = [];
for (let rowIterator = 0; rowIterator <= categoryCount; rowIterator++) {
    costMatrix[rowIterator] = [];
    for (let colIterator = 0; colIterator <= itemCount; colIterator++) {
        costMatrix[rowIterator][colIterator] = Infinity; // Fill with a very large number initially
    }
}

costMatrix[0][0] = 0; // Base case: zero cost for zero categories and zero items

// Fill the dynamic programming table
for (let currentCategory = 0; currentCategory < categoryCount; currentCategory++) {
    for (let currentItem = 0; currentItem < itemCount; currentItem++) {
        // Option 1: Skip the current category (carry over cost from previous category for same items)
        costMatrix[currentCategory + 1][currentItem] = Math.min(
            costMatrix[currentCategory + 1][currentItem],
            costMatrix[currentCategory][currentItem]
        );

        // Option 2: Use the current category for the current item
        // Add the cost of the current item multiplied by the current category's weight
        costMatrix[currentCategory + 1][currentItem + 1] = Math.min(
            costMatrix[currentCategory + 1][currentItem + 1],
            costMatrix[currentCategory][currentItem] + selectionCosts[currentCategory] * productCosts[currentItem]
        );
    }
}

let overallMinimum = Infinity; // Variable to store the final minimum cost

// Find the minimum cost across all possible category selections that cover all items
for (let finalCategoryIter = 0; finalCategoryIter <= categoryCount; finalCategoryIter++) {
    overallMinimum = Math.min(overallMinimum, costMatrix[finalCategoryIter][itemCount]);
}

console.log(overallMinimum); // Output the calculated minimum cost