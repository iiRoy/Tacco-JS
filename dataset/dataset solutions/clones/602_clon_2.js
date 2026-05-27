var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input string into an array of lines

var priceOptions = []; // Array to store price values
var juiceOptions = []; // Array to store juice values

// Assign numeric values from input lines to priceOptions array
priceOptions[0] = Number(dataRows[0]);
priceOptions[1] = Number(dataRows[1]);
priceOptions[2] = Number(dataRows[2]);

// Assign numeric values from input lines to juiceOptions array
juiceOptions[0] = Number(dataRows[3]);
juiceOptions[1] = Number(dataRows[4]);

// Calculate the minimum price, minimum juice, sum them, and subtract 50
console.log(Math.min.apply(null, priceOptions) + Math.min.apply(null, juiceOptions) - 50);
