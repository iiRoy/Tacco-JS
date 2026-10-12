let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input
let dataRows = rawData.split('\n'); // Divide the input string into an array of individual lines

// Initialize arrays to store numerical values
let pizzaPrices = [];
let juicePrices = [];

// Parse and store the first three lines as pizza prices
pizzaPrices[0] = Number(dataRows[0]);
pizzaPrices[1] = Number(dataRows[1]);
pizzaPrices[2] = Number(dataRows[2]);

// Parse and store the next two lines as juice prices
juicePrices[0] = Number(dataRows[3]);
juicePrices[1] = Number(dataRows[4]);

// Calculate the sum of the minimum pizza price and the minimum juice price, then print it
console.log(Math.min.apply(null, pizzaPrices) + Math.min.apply(null, juicePrices));
