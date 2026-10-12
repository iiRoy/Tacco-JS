let dataStream = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input stream

dataStream = dataStream.split('\n'); // Divide the input into an array of lines

const combinedString = dataStream[0] + dataStream[0]; // Create a doubled version of the first line
const patternString = dataStream[1]; // Extract the second line as the search pattern

// Check if the pattern string is a substring of the combined string
if (combinedString.indexOf(patternString) !== -1) {
    console.log('Yes'); // If found, print 'Yes'
} else {
    console.log('No'); // Otherwise, print 'No'
}
