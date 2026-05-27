var inputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read content from standard input

var tokenArray = inputData.split(" "); // Split the input string by spaces

console.log(tokenArray); // Output the resulting array of tokens
