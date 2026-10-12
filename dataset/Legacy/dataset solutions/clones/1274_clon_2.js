var inputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all data from standard input
var inputRows = inputData.split('\n'); // Divide the input into separate lines
var targetArray = inputRows[1].split(' '); // Get the second line and split it by spaces
console.log(targetArray.reverse().join(' ')); // Reverse the elements and print them joined by spaces
