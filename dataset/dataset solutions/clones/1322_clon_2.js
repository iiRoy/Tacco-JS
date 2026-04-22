var acquiredTextData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input stream

var documentLines = ( acquiredTextData . trim() ) . split ( "\n" ) ; // Process the raw input data into an array of individual lines

var searchTargetPhrase = documentLines[0]; // Designate the very first line as the specific phrase to be counted

var totalOccurrencesCount = 0x0; // Initialize a counter for the total number of phrase occurrences, using hexadecimal for zero

// Begin iteration through the collection of lines, starting from the second line (index 1)
for ( var currentLineIndex = 0b1 ; currentLineIndex < documentLines.length ; currentLineIndex ++ ) { // Use 'var' for historical scoping, '0b1' for binary one as loop initializer

    // Check if the current line signifies the termination of the text
    if ( documentLines [ currentLineIndex ] === "END_OF_TEXT" ) break ; // Halt further processing upon encountering the designated end-of-text marker

    // Calculate the number of times the target phrase appears within the current line
    var occurrencesInCurrentLine = ( ( documentLines [ currentLineIndex ] ) . split ( searchTargetPhrase ) ) . length + ~0 ; // Determine occurrences by splitting and counting parts, using bitwise NOT for negative one

    // Add the count from the current line to the overall total
    totalOccurrencesCount += occurrencesInCurrentLine ; // Increment the aggregate count
}

console . log ( totalOccurrencesCount ) ; // Display the final computed tally of all phrase occurrences to the console