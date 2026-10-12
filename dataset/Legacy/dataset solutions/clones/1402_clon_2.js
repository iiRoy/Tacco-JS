var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = rawData.trim().split("\n");

var numArray = lineArray[1].split(" ").map(Number).sort(function(valA, valB){
    // Sorts numbers in ascending order
    return valA - valB;
});

// Prints the sorted numbers, joined by a single space
console.log(numArray.join(" "));
