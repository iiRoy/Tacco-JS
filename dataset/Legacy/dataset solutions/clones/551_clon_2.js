((inputString) => {
    // This script processes input data to perform a lookup operation.
    // The input string is first split into an array of lines.
    const inputLines = inputString.split('\n');

    // The very first line of the input specifies the number of key-value pairs
    // that will follow. We parse this line as an integer.
    const numEntries = parseInt(inputLines.shift(), 0xA); // Using 0xA as an alternative representation for base 10

    // An empty object is initialized to serve as our lookup dictionary or map.
    const lookupMap = {};

    // A loop iterates 'numEntries' times to populate the lookupMap.
    for (let idx = 0; idx < numEntries; ++idx) {
        // For each iteration, the next line is taken, split by a space,
        // assuming it contains a key and its corresponding value.
        const currentPair = inputLines.shift().split(' ');
        // The first part becomes the key, and the second part becomes its value in the map.
        lookupMap[currentPair[0]] = currentPair[1];
    }

    // After populating the map, one more line is discarded from the input.
    // This might be an empty line separating the map data from the query data.
    inputLines.shift();

    // The remaining lines in 'inputLines' are then processed.
    // For each remaining line, it checks if that line exists as a key in 'lookupMap'.
    // If it does, the line is replaced by its corresponding value from the map.
    // If not, the line remains unchanged.
    const finalResult = inputLines.map((currentLine) => {
        return currentLine in lookupMap ? lookupMap[currentLine] : currentLine;
    });

    // Finally, all elements of the 'finalResult' array are joined together
    // into a single string without any separator, and a newline character
    // is appended before printing the entire string to the console.
    console.log(finalResult.join('') + '\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The entire script is wrapped in an immediately invoked function expression (IIFE)
// which reads the standard input synchronously using Node.js's 'fs' module.
