const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the initial input string by replacing specific patterns
let processedSequence = (rawData.trim()).replace(/egg/g, "E").replace(/chicken/g, "C");

// Repeatedly replace "EE" with "EAE" until no more "EE" exist
while ( /EE/.test(processedSequence) ) {
    processedSequence = processedSequence.replace(/EE/, "EAE");
}

// Repeatedly replace "CC" with "CAC" until no more "CC" exist
while ( /CC/.test(processedSequence) ) {
    processedSequence = processedSequence.replace(/CC/, "CAC");
}

// Split the modified sequence into segments using "A" as a delimiter
const segmentList = processedSequence.split("A");

// Initialize a variable to store the longest segment found
let longestSegment = "";

// Iterate through each segment to find the one with the maximum length
segmentList.forEach(function(currentPart) {
    if (longestSegment.length < currentPart.length) {
        longestSegment = currentPart;
    }
});

// Determine the final output based on the last character of the longest segment
console.log((longestSegment.slice(-1) === "E") ? "egg" : "chicken");
