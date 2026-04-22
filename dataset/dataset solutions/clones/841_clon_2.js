var rawData=require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw text data from standard input.
var lineFragments=(rawData .trim( ) ) .split("\n") ; // Split input into an array of lines after trimming.
var numQueries=Number(lineFragments .shift ( ) ) ; // Extract the first line as the number of processing tasks.

var frequencyMap = { } ; // Initialize an empty object to store number frequencies.

// Populate the map with initial counts for a predefined range.
for( var currentVal = 2 ; currentVal <= 100001 ; currentVal++ ) {
   frequencyMap[ currentVal ] = 1 ;
}

// Process each query to update the frequency map.
for ( var queryIndex = 0 ; queryIndex < numQueries ; queryIndex++ ) {
   // Parse range bounds from the current line fragment.
   var rangeBounds = ( lineFragments .shift( ) ) .split ( " " ) .map ( Number ) ;
   // Increment counts for all numbers within the specified range.
   for ( var numIterator = rangeBounds[ 0 ] ; numIterator <= rangeBounds[ 1 ] ; numIterator++ ) {
      frequencyMap[ numIterator ] ++ ;
   }
}

var largestCandidate = 1 ; // Initialize variable to store the maximum qualifying number.

// Iterate through the numbers in the map to find the largest qualifying one.
for ( var checkValue = 2 ; checkValue <= 100001 ; checkValue++ ) {
   // Check if the frequency of the number is greater than or equal to itself.
   if ( frequencyMap[ checkValue ] >= checkValue ) {
      largestCandidate = checkValue ; // Update the largest candidate if condition is met.
   }
}

console .log ( largestCandidate - 1 ) ; // Output the final result, which is one less than the largest candidate.