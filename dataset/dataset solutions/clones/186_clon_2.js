let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Sort the array of string numbers in descending order.
inputLines.sort(function(valA, valB) {
    return valB - valA; // Numeric descending sort
});

// Get the largest and smallest numbers (after removing decimal points),
// calculate their difference, and then divide by ten.
console.log((inputLines[0].replace('.', '') - inputLines[inputLines.length - 1].replace('.', '')) / 10);
