const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let dataLines = rawData.trim().split("\n"); // Split input into an array of lines

const sequenceLength = dataLines.shift() - 0; // Get the length of the sequence, convert to number

const [firstTerm, commonDifference] = dataLines.shift().split(" ").map(Number); // Get initial term and common difference

let resultArray = []; // Initialize an array to hold the generated sequence

// Generate the arithmetic sequence
for (let idx = 0; idx < sequenceLength; idx++) {
    resultArray.push(firstTerm + idx * commonDifference);
}

const operationCount = dataLines.shift() - 0; // Get the number of operations to perform

// Process each operation
for (let opIdx = 0; opIdx < operationCount; opIdx++) {
    const [operationType, firstIndex, secondIndex] = dataLines.shift().split(" ").map(Number); // Parse operation details

    // Perform swap or assignment based on operation type
    if (operationType === 0) {
        // Swap elements at (firstIndex - 1) and (secondIndex - 1)
        [resultArray[firstIndex - 1], resultArray[secondIndex - 1]] = [resultArray[secondIndex - 1], resultArray[firstIndex - 1]];
    } else {
        // Assign value from (secondIndex - 1) to (firstIndex - 1)
        resultArray[firstIndex - 1] = resultArray[secondIndex - 1];
    }
}

const targetIndex = dataLines.shift() - 0; // Get the final index to retrieve

console.log(resultArray[targetIndex - 1]); // Output the element at the specified index
