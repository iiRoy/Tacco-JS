process.stdin.resume();
process.stdin.setEncoding('utf8');

// Storage for all incoming lines
let inputData = [];

// Set up the interface for reading input
const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for each line received
inputProcessor.on('line', (currentLine) => {
    // Add the current line to our collection
    inputData.push(currentLine);
});

// Event listener for when input stream closes
inputProcessor.on('close', () => {
    // The first line contains a number, but it's not directly used in the final output logic
    const countVal = Number(inputData[0]);

    // Process the second line to sort elements based on their numeric value
    // and then output their original 1-based index.
    const finalOutput = inputData[1]
        .split(" ") // Split the string into an array of string numbers
        .map((itemStr, originalIndex) => {
            // Convert each string number to a number and store it with its original 1-based index
            return { sortKey: Number(itemStr), originalPos: originalIndex + 1 };
        })
        .sort((elementA, elementB) => {
            // Sort the objects based on their 'sortKey' property in ascending order
            return elementA.sortKey - elementB.sortKey;
        })
        .map(obj => obj.originalPos) // Extract only the 'originalPos' from the sorted objects
        .join(" "); // Join the resulting indices with spaces

    // Display the final sorted sequence of original positions
    console.log(finalOutput);
});
