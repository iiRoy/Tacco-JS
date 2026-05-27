const inputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read content from standard input

// Check if the input string contains any uppercase letter using a regular expression
// If it does, print 'A', otherwise print 'a'
console.log(/[A-Z]/.test(inputData) ? 'A' : 'a');
