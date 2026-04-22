var sourceText = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all data from standard input as a string.

var lineFragments = sourceText.split('\n'); // Divide the raw input string into an array of individual lines.

// Loop through each line fragment obtained from the input.
// 'lineIndex' serves as the current iteration counter.
// 'totalFragments' holds the total count of lines to process.
for ( var lineIndex = 0, totalFragments = lineFragments.length; lineIndex < totalFragments; lineIndex++ )
{
    var displayCase = lineIndex + 1; // Compute the sequential case number for display, starting from 1.
    console.log( 'Case ' + displayCase + ': ' + lineFragments[lineIndex] ); // Present the formatted output for the current line.
}