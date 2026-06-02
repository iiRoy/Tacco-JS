var rawData = require('fs')
    .readFileSync('/dev/stdin', 'utf8') // Read the entire input from standard input
    .trim(); // Remove any leading or trailing whitespace from the input

var dataRows = rawData.split('\n'); // Split the raw input string into an array of individual lines

var currentRow; // Declare a variable to hold the current line being processed
while ( (currentRow = dataRows.shift()) ) { // Loop as long as there are lines to process
    // For each line, split it into words, map each word, and then join them back
    var processedString = currentRow.split(' ').map(function(token) {
        // Check if the current token is 'Hoshino'
        return token == 'Hoshino' ? 'Hoshina' : token; // If it is, replace it with 'Hoshina', otherwise keep the original word
    }).join(' '); // Join the modified words back into a single string, separated by spaces

    console.log(processedString); // Print the processed string to the console
}
