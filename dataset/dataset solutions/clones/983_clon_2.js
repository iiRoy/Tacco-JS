// Obtain raw textual content from standard input file system
let sourceContent = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' );

// Process the acquired content: remove leading/trailing whitespace and split into an array of lines
let lineSegments = sourceContent . trim() . split ( "\n" );

// Extract the first line as the primary string to search within
let primaryTarget = lineSegments . shift();

// Extract the next line and convert it to a number, representing how many queries will follow
let queryCount = lineSegments . shift() - 0 ;

// Initialize a placeholder string variable (not actively used in this specific logic flow)
let tempOutputBuffer = "" ;

// Iterate through the remaining lines, performing a check for each query
for ( let idx = 0 ; idx < queryCount ; idx ++ ) {
   // For each query, check if the primary target string includes the current line segment
   // Print 1 if it does, otherwise print 0
   console . log ( primaryTarget . includes ( lineSegments [ idx ] ) ? 1 : 0 ) ;
}