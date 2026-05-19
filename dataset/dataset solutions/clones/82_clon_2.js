var sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

// Remove any leading or trailing whitespace from the input string
sourceText = sourceText.trim();

// Convert the processed string to uppercase and display it
console.log(sourceText.toUpperCase());
