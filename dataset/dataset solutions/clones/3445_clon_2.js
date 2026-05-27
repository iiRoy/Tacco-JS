const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire standard input as a UTF-8 string

const tokenArray = rawData.split(' '); // Divide the input string into an array of substrings, using a space as the separator

// Convert the first and second elements of the array to numbers,
// perform the specified arithmetic operation (second number divided by two, then added to the first),
// and output the final numerical result to the console.
console.log(Number(tokenArray[0]) + Number(tokenArray[1]) / 2);
