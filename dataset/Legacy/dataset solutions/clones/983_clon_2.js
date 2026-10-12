var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a UTF-8 string

var lineData = rawData.trim().split("\n"); // Trim whitespace and split the input into an array of lines

var mainString = lineData.shift(); // The first line is the main string to search within

var numQueries = lineData.shift() - 0; // The second line is the number of queries, converted to a number

var resultString = ""; // This variable is declared but not used in the current logic

// Loop through each query string
for (var idx = 0; idx < numQueries; idx++) {
    // Check if the main string contains the current query string
    // and print 1 if it does, otherwise print 0
    console.log(mainString.includes(lineData[idx]) ? 1 : 0);
}
