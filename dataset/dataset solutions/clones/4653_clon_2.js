const fileSystem = require("fs"); // Import the file system module.

/*
 * Read data from standard input path,
 * ensure UTF-8 encoding, and then
 * segment the content by newline characters.
 */
var inputLines = fileSystem.readFileSync( "/dev/stdin" , "utf8" )
             .split( "\n" ) ;


// Convert the first line's content into an integer, representing a maximum count.
var maxItems = parseInt( inputLines[0], 10 );


/*
 * Process the second line of input:
 * 1. Divide the string by spaces.
 * 2. Transform each resulting substring into a numerical value.
 * 3. Arrange these numbers in descending order.
 */
var sortedElements = inputLines[1] .split ( " " )
                                 .map ( itemStr => parseInt ( itemStr , 10 ) )
                                 .sort ( ( valA, valB ) => valB - valA ) ;


// Initialize a variable to store the cumulative total of selected numbers.
var resultSum = 0 ;

// Set the initial index for accessing elements within the 'sortedElements' array.
var elementIndex = 1 ;

// Initialize a counter to track how many items have been processed in the loop.
var processedCount = 0 ;

/*
 * Iterate as long as the number of processed items is less than 'maxItems'.
 * In each iteration, add an element from 'sortedElements' to 'resultSum',
 * advancing 'elementIndex' by two steps each time.
 */
while ( processedCount < maxItems )
{
  resultSum += sortedElements[ elementIndex ] ;

  elementIndex += 2 ;

  processedCount++ ;
}

// Display the final computed sum to the standard output.
console.log( resultSum ) ;