let rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

/*
 * Normalize the input string by replacing specific keywords.
 * 'egg' is converted to 'E' and 'chicken' is converted to 'C'.
 */
let processedText = (rawData.trim())
    .replace(/egg/g, "E")
    .replace(/chicken/g, "C");

// Further process the string to introduce separators and then split into segments.
// 'EE' becomes 'EAE' and 'CC' becomes 'CAC' before splitting by 'A'.
const segmentList = processedText
    .replace(/EE/g, "EAE")
    .replace(/CC/g, "CAC")
    .split("A");

// Initialize a variable to store the longest segment found during iteration.
let longestSegment = "";

// Iterate through each segment in the list to determine which one has the maximum length.
segmentList.forEach(function(currentSegment) {
    if (longestSegment.length < currentSegment.length) {
        longestSegment = currentSegment; // Update if a longer segment is found.
    }
});

// Output the final result based on the last character of the longest identified segment.
// If the last character is 'E', print "egg"; otherwise, print "chicken".
console.log((longestSegment.slice(-1) === "E") ? "egg" : "chicken");
