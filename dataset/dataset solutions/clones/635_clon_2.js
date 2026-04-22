const fileSystemUtility = require('fs'); // Access Node.js file system capabilities.

let rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8'); // Acquire all data from standard input as a UTF-8 string.

let processedTextLines = rawInputContent.trim().split('\n'); // Remove extra spaces, then split the content into an array of strings by newline characters.

processedTextLines.shift(); // Eliminate the first entry from the collection of lines.

processedTextLines.forEach(function(currentTextSegment) { // Iterate over each remaining textual segment.
    let outputDistances = []; // Initialize an empty array to store the computed distance values for the current segment.
    let segmentCharacters = currentTextSegment.split(''); // Break down the current segment into an array of individual characters.
    let charProximityCounter = -1; // Initialize a counter to track proximity to a specific character, starting at -1.

    for (let charIterator = 0; charIterator < segmentCharacters.length; charIterator++) { // Traverse through each character in the current segment.
        if (segmentCharacters[charIterator] === 'c') { // Check if the current character is 'c'.
            charProximityCounter = 0; // If 'c' is found, reset the proximity counter to zero.
        }
        outputDistances.push(charProximityCounter); // Append the current value of the proximity counter to the results array.
        if (charProximityCounter !== -1) { // If the proximity counter is not -1 (meaning 'c' has been encountered at least once).
            charProximityCounter++; // Increment the proximity counter.
        }
    }
    console.log(outputDistances.join(' ')); // Display the collected distance values, joined by single spaces, to standard output.
});