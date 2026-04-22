// Import Node.js file system module for reading input
const fileSystem = require('fs');

// Helper function to safely update the minimum value
const updateMinimumPath = (currentMin, candidatePath) => {
    return Math.min(currentMin, candidatePath);
};

// Read raw input from standard input (usually a file in competitive programming)
// This simulates reading from /dev/stdin
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the input string: trim whitespace and split into individual lines
const inputLines = rawInputData.trim().split("\n");

// Extract initial configuration parameters from the first line
// The line is expected to contain three space-separated numbers: N, M, P
const initialParameters = inputLines.shift().split(" ").map(Number);

// Assign parsed parameters to descriptive variables
const maxRange = initialParameters[0];      // Represents 'n' in the original code
const countOfPoints = initialParameters[1]; // Represents 'm' in the original code
const targetValue = initialParameters[2];   // Represents 'p' in the original code

// Initialize an array to store relevant data points
let collectedPoints = [];

// Populate the 'collectedPoints' array with 'countOfPoints' values from subsequent input lines
// Only add points that are NOT equal to the targetValue initially, to ensure 'targetValue' is added once.
for (let pointIndex = 0; pointIndex < countOfPoints; pointIndex++) {
    // Convert the string line to a number
    const currentPointFromInput = Number(inputLines.shift());
    
    // If the current point is not the target value, add it to our collection
    if (currentPointFromInput !== targetValue) {
        collectedPoints.push(currentPointFromInput);
    }
}

// Ensure the targetValue is always present in the collection exactly once
// It was explicitly excluded if it appeared in the input, and now added.
collectedPoints.push(targetValue);

// Sort the collected points in ascending numerical order
collectedPoints.sort((valueA, valueB) => valueA - valueB);

// Initialize the variable to hold the shortest calculated path cost
// Use a very large number to ensure any valid path will be smaller
let shortestPathCost = Infinity;

// Get the index of the last element for boundary checks to improve readability
const lastElementIndex = collectedPoints.length - 1;

// Iterate through each point in the sorted array to calculate potential path costs
for (let currentIndex = 0; currentIndex < collectedPoints.length; currentIndex++) {
    const currentPointInArray = collectedPoints[currentIndex];

    // Case 1: The current point is less than the target value
    if (currentPointInArray < targetValue) {
        // This calculation requires a previous element to be valid (i.e., not the first element)
        if (currentIndex !== 0) {
            const previousPoint = collectedPoints[currentIndex - 1];
            // Calculate path cost based on distance to target, wrap-around distance from target, and previous point
            const pathOption1 = (targetValue - currentPointInArray) * 2 + (maxRange - targetValue + 1) + previousPoint;
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption1);
        }
    } 
    // Case 2: The current point IS the target value
    else if (currentPointInArray === targetValue) {
        // Sub-case 2.1: Target value is the first element in the sorted array
        if (currentIndex === 0) {
            const lastPoint = collectedPoints[lastElementIndex];
            // Path cost: distance from the last point to the target point
            const pathOption2a = lastPoint - targetValue;
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption2a);
        }
        // Sub-case 2.2: Target value is the last element in the sorted array
        if (currentIndex === lastElementIndex) {
            const firstPoint = collectedPoints[0];
            // Path cost: distance from the target point to the first point
            const pathOption2b = targetValue - firstPoint;
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption2b);
        }
        // Sub-case 2.3: Target value is NOT the last element (implies there's a next point)
        if (currentIndex !== lastElementIndex) {
            const nextPoint = collectedPoints[currentIndex + 1];
            // Path cost: target value + (total range - next point + 1)
            const pathOption2c = targetValue + maxRange - nextPoint + 1;
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption2c);
        }
        // Sub-case 2.4: Target value is NOT the first element (implies there's a previous point)
        if (currentIndex !== 0) {
            const previousPoint = collectedPoints[currentIndex - 1];
            // Path cost: (total range - target value + 1) + previous point
            const pathOption2d = maxRange - targetValue + 1 + previousPoint;
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption2d);
        }
    } 
    // Case 3: The current point is greater than the target value
    else { // currentPointInArray > targetValue
        // This calculation requires a next element to be valid (i.e., not the last element)
        if (currentIndex !== lastElementIndex) {
            const nextPoint = collectedPoints[currentIndex + 1];
            // Calculate path cost based on distance from target, target value, and wrap-around distance from next point
            const pathOption3 = (currentPointInArray - targetValue) * 2 + targetValue + (maxRange - nextPoint + 1);
            shortestPathCost = updateMinimumPath(shortestPathCost, pathOption3);
        }
    }
}

// Output the final calculated minimum path cost, multiplied by 100
console.log(shortestPathCost * 100);