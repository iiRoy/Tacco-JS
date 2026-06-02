var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineBuffer = rawData.trim().split("\n"); // Split input into an array of lines

while (true) {
    var currentLine = lineBuffer.shift(); // Get the next line from the input buffer

    // Check for the termination condition
    if (currentLine === "0 0 0 0 0 0") {
        break; // Exit the loop if the specific termination string is encountered
    }

    // Parse the current line into an array of numerical values
    var numericValues = currentLine.split(" ").map(Number);

    // Calculate initial sums for three distinct categories
    var firstCategorySum = numericValues[0] + numericValues[3];
    var secondCategorySum = numericValues[1] + numericValues[4];
    var thirdCategorySum = numericValues[2] + numericValues[5];

    var totalGroups = 0; // Initialize a counter for the total number of groups

    // Add groups formed by dividing each category's sum by three
    totalGroups += Math.floor(firstCategorySum / 3);
    totalGroups += Math.floor(secondCategorySum / 3);
    totalGroups += Math.floor(thirdCategorySum / 3);

    // Update category sums to their remainders after division by three
    firstCategorySum = firstCategorySum % 3;
    secondCategorySum = secondCategorySum % 3;
    thirdCategorySum = thirdCategorySum % 3;

    // Form additional groups by combining one item from each category, if available
    while (firstCategorySum >= 1 && secondCategorySum >= 1 && thirdCategorySum >= 1) {
        firstCategorySum--;  // Decrement count for the first category
        secondCategorySum--; // Decrement count for the second category
        thirdCategorySum--;  // Decrement count for the third category
        totalGroups++;       // Increment the total groups counter
    }

    // Output the final calculated total groups for the current line
    console.log(totalGroups);
}
