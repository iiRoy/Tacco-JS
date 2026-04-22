const fileSystemModule = require('fs') ;

// Obtain raw content from standard input, using UTF-8 encoding.
let dataSource = fileSystemModule.readFileSync('/dev/stdin', 'utf8') ;

// Sanitize input: remove leading/trailing whitespace, then segment into an array of strings by newline characters.
const lineCollection = ( dataSource . trim() ) . split("\n");

// Process each individual entry within the collection.
lineCollection . forEach( function ( currentLineContent )
{
   // Parse the current line: split by spaces and convert each resulting string to a numerical type.
   var numericValues = currentLineContent . split(" ") . map( Number );
   
   // Initialize a counter for specific conditions.
   let matchCount = 0;
   
   // An immediately-invoked function expression (IIFE) to encapsulate coordinate comparison logic.
   // Parameters represent the coordinates (x1, y1, x2, y2) for two distinct rectangular areas.
   (function ( firstRectX1, firstRectY1, firstRectX2, firstRectY2, secondRectX1, secondRectY1, secondRectX2, secondRectY2 )
   {
      // Evaluate if there is an overlap along the horizontal axis between the two rectangles.
      if ( ( secondRectX2 >= firstRectX1 ) && ( secondRectX1 <= firstRectX2 ) )
      {
         matchCount ++ ; // Increment the counter upon detecting horizontal overlap.
      }
      
      // Evaluate if there is an overlap along the vertical axis between the two rectangles.
      if ( ( secondRectY2 >= firstRectY1 ) && ( secondRectY1 <= firstRectY2 ) )
      {
         matchCount ++ ; // Increment the counter upon detecting vertical overlap.
      }
   }) . apply( null, numericValues ); // Pass the parsed numeric data as arguments to the IIFE.
   
   // Based on the final count, print "YES" if both horizontal and vertical overlaps were found, otherwise "NO".
   console . log( ( matchCount === 2 ) ? "YES" : "NO" );
}
) ;