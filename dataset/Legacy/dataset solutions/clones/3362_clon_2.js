var inputData = [];
var unusedVar; // A placeholder variable, not actively used in the logic

const nodeReadline = require("readline"); // Import the readline module
const inputReader = nodeReadline.createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout, // Standard output stream (not used for direct output here)
});

// Event listener for each line of input received
inputReader.on("line", function (currentLine) {
    inputData.push(currentLine); // Store the received line in our array
});

// Event listener for when the input stream closes
inputReader.on("close", function () {
    // Process the first line to get L and N
    const initialValues = inputData.shift().split(" ");
    const totalLength = Number(initialValues[0]); // Parse L as a number
    const numPoints = Number(initialValues[1]); // Parse N as a number

    // Initialize an array to store point coordinates
    const pointCoordinates = Array(numPoints);
    // Populate the point coordinates array from subsequent input lines
    for (let idx = 0; idx < numPoints; idx++) {
        pointCoordinates[idx] = Number(inputData[idx]);
    }
    // Sort the point coordinates in ascending order
    pointCoordinates.sort(function (valA, valB) {
        return (valA - valB);
    });

    let finalScore = 0; // Accumulator for the total score
    let currentPosition = 0; // Represents the current center point
    let rightPointer = 0; // Index for the rightmost point considered
    let leftPointer = numPoints - 1; // Index for the leftmost point considered

    // Calculate initial distances to the ends of the segment
    let distToLeft = totalLength - pointCoordinates[leftPointer];
    let distToRight = pointCoordinates[rightPointer];

    // Loop through all points to determine the optimal path
    for (let iterationCount = 0; iterationCount < numPoints; iterationCount++) {
        // This block handles movement towards the left side
        // (Original comment: leftに動いた場合)
        // console.log(pointCoordinates[leftPointer], currentPosition, pointCoordinates[rightPointer], " ", distToLeft, distToRight); // Debugging line, commented out
        if (distToRight <= distToLeft) {
            finalScore += distToLeft; // Add the distance to the total score
            currentPosition = pointCoordinates[leftPointer]; // Update current position
            leftPointer--; // Move the left pointer inwards
            distToLeft = currentPosition - pointCoordinates[leftPointer]; // Recalculate distance to new left
            distToRight = totalLength - (currentPosition - pointCoordinates[rightPointer]); // Recalculate distance to new right
        }
        // This block handles movement towards the right side
        // (Original comment: rightに動いた場合)
        else {
            finalScore += distToRight; // Add the distance to the total score
            currentPosition = pointCoordinates[rightPointer]; // Update current position
            rightPointer++; // Move the right pointer inwards
            distToLeft = totalLength - (pointCoordinates[leftPointer] - currentPosition); // Recalculate distance to new left
            distToRight = pointCoordinates[rightPointer] - currentPosition; // Recalculate distance to new right
        }
    }
    console.log(finalScore); // Output the final calculated score
});
