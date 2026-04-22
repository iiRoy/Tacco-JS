// This program is designed to extract and sum numerical values from a standard input stream.

var  rawData  =  require('fs') . readFileSync ( '/dev/stdin',  'utf8'  ) . trim ( ) ;

// The complete input string is broken down into separate lines.
var  textSegments  =  rawData . split ( '\n' ) ;


var  totalValue  =  0 ; // A variable to store the cumulative result.
var  currentSegment ;  // A placeholder for the line being processed in each iteration.

// Loop through each segment (line) obtained from the input.
while  (  currentSegment  =  textSegments . shift ( )  )
{
    /*
     * Within the current text segment, extract all sequences of digits.
     * Non-digit characters are used as separators.
     */
    var  numericParts  =  currentSegment . split ( /[^0-9]+/ ) ;

    // Add the sum of numbers found in the current segment to the overall total.
    totalValue  +=  numericParts . reduce ( ( previousAccumulator, currentNumberString )  =>  {
        // Convert the string representation of a number to an actual number before adding.
        return  previousAccumulator  +  Number(currentNumberString) ;
    },  0  ) ;
}

// Output the final accumulated sum to the console.
console . log ( totalValue ) ;