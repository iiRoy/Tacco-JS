var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from the standard input stream

var dataRows = rawData.split('\n'); // Divide the raw input into an array of individual lines

var countVal = +dataRows.shift(); // Extract the first line, converting it to a numeric value (though this variable is not subsequently utilized)

var numberArray = dataRows.shift().split(' ').map(function(itemStr) {
    return +itemStr; // Convert each string item to a number
}); // Process the subsequent line: split by spaces and transform each part into a number

numberArray.sort(function(valA, valB) {
    return valA - valB; // Implement a numerical ascending sort
}); // Arrange the array of numbers in increasing order

console.log(numberArray.join(' ')); // Display the sorted numbers, separated by single spaces
