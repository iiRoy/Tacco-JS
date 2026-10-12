let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineCollection = rawData.trim().split("\n"); // Separate input into distinct lines

lineCollection.shift(); // Remove the initial line, often a count or header

lineCollection.forEach(function(currentLine) {
    let resultValues = []; // Array to hold computed distances for the current line
    let charSequence = currentLine.split(""); // Break the line into individual characters

    let distanceTracker = -1; // Tracks distance from the last 'c'; -1 means no 'c' yet

    for (let charIndex = 0; charIndex < charSequence.length; charIndex++) {
        // If the character is 'c', reset distance and mark it as 0
        if (charSequence[charIndex] === "c") {
            resultValues.push(0);
            distanceTracker = 1; // Next character will be 1 unit away
        }
        // If it's a '.' and no 'c' has been found yet, keep -1
        else if (charSequence[charIndex] === "." && distanceTracker === -1) {
            resultValues.push(distanceTracker);
        }
        // If it's a '.' and a 'c' has been found, record current distance and increment
        else if (charSequence[charIndex] === "." && distanceTracker !== -1) {
            resultValues.push(distanceTracker);
            distanceTracker++; // Increment for the subsequent character
        }
    }

    console.log(resultValues.join(" ")); // Output the results, space-separated
});
