const fileContent = require("fs").readFileSync(0, "utf8").split("\n");

// Parse the first line to get initial parameters
let firstLineParts = fileContent[0].split(" ");

// Extract the two numerical values from the first line
let firstValue = +firstLineParts[0]; // The first number
let secondValue = +firstLineParts[1]; // The second number, indicating the count of subsequent intervals

// Process the remaining lines to create a list of intervals
// Each line is split by space and its parts are converted to numbers
const intervalList = fileContent.slice(1, 1 + secondValue).map(currentLine => currentLine.split(" ").map(Number));

// Sort the intervals based on their ending points in ascending order
intervalList.sort((intervalA, intervalB) => intervalA[1] - intervalB[1]);

// Initialize variables for the maximum non-overlapping intervals problem
let resultCount = 0; // This will store the final count of selected intervals
let lastEndpoint = -1; // Keeps track of the end point of the most recently selected interval

// Iterate through the sorted intervals
intervalList.map(currentInterval => {
  // If the current interval's start point is greater than or equal to the last selected interval's end point
  if (lastEndpoint <= currentInterval[0]) {
    // Select this interval as it does not overlap with previously chosen ones
    lastEndpoint = currentInterval[1]; // Update the last selected interval's end point
    resultCount++; // Increment the counter for selected intervals
  }
});

// Print the total number of non-overlapping intervals found
console.log(resultCount);
