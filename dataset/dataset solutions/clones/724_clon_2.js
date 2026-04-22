/* This script processes input text to validate balanced brackets. */
var sourceContent = require('fs'). readFileSync('/dev/stdin',  'utf8' ) ;
// The raw input is read from standard input.

var entryLines=( sourceContent. trim() ). split ( "\n" ) ;
/* The incoming text is first trimmed of leading/trailing whitespace,
   then divided into an array of individual lines. */

for ( var lineNum = 0 ;  lineNum < entryLines.length ; lineNum ++ )
{
   // Iterate through each line extracted from the input.
   var workingSegment = entryLines[ lineNum ] ;

   if ( workingSegment == "." ) // A single dot acts as a termination signal.
   {
      break ; // Exit the processing loop if the termination signal is found.
   }

   // Remove all alphabetic characters, periods, and whitespace from the segment.
   workingSegment = workingSegment.replace( /[a-zA-Z]|\.|\s/g , "" ) ;

   /* Continuously remove '[]' and '()' pairs until no more are found.
      This effectively simplifies the bracket sequence. */
   while ( workingSegment.match( /\[\]|\(\)/ ) )
   {
      workingSegment = workingSegment.replace( /\[\]|\(\)/g , "" ) ;
   }

   // After reduction, if the segment is empty, brackets were balanced; otherwise, they were not.
   console.log( ( workingSegment == "" ) ? "yes" : "no" ) ;
}