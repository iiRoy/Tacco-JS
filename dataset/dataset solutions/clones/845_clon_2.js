var rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

/*
 *  Normalize the raw input:
 *  1. Remove leading/trailing whitespace from the raw string.
 *  2. Systematically replace all occurrences of "egg" with the character "E".
 *  3. Systematically replace all occurrences of "chicken" with the character "C".
 */
var processedSequence = ( rawData . trim() ) . replace( /egg/g , "E" ) . replace( /chicken/g , "C" ) ;

// Continuously process the sequence: if two 'E's are found consecutively, insert an 'A' in between.
while ( /EE/ . test ( processedSequence ) )
{
    processedSequence = processedSequence . replace( /EE/g , "EAE" ) ;
}

// Continuously process the sequence: if two 'C's are found consecutively, insert an 'A' in between.
while ( /CC/ . test ( processedSequence ) )
{
    processedSequence = processedSequence . replace( /CC/g , "CAC" ) ;
}

// Split the final processed sequence into a list of string segments using 'A' as the separator.
var segmentList = processedSequence . split ( "A" ) ;

// Initialize a string variable to hold the reference to the longest segment found.
var finalChoice = "" ;

// Iterate through each individual segment within the generated list.
segmentList . forEach ( function ( currentSegment )
{
    // Compare the length of the current segment with the length of the longest segment found so far.
   if ( finalChoice . length < currentSegment . length )
   {
        // If the current segment is longer, update 'finalChoice' to refer to this segment.
        finalChoice = currentSegment ;
   }
} ) ;

// Based on the last character of the determined longest segment, output "egg" or "chicken".
// If the last character is 'E', it indicates "egg"; otherwise, it indicates "chicken".
console . log ( ( finalChoice . slice ( -1 ) == "E" ) ? "egg" : "chicken" ) ;