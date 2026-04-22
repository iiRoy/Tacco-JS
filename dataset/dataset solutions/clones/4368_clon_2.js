// This module defines a function to calculate the total aggregated length
// of several inclusive numerical ranges provided as input.

function  ComputeAggregateLength ( incomingTextData )
{
    // The input is initially a single string; it is first processed
    // by splitting it into an array of strings, where each element
    // represents a distinct line from the original input source.
    incomingTextData  =  incomingTextData.split( '\n' );


    // A variable to store the running tally of the total length.
    // It is initialized to zero before any calculations begin.
    var  cumulativeValue  =  0 ;


    // We iterate through the array of lines, starting from the second element (index 1).
    // The first line is typically metadata (e.g., number of ranges) and is ignored
    // for the purpose of this specific length calculation.
    for  ( var  lineIndex  =  1 ;  lineIndex  <  incomingTextData.length ;  lineIndex ++ )
    {
        // For each relevant line, we parse it to extract the range boundaries.
        // The line is expected to contain two space-separated numbers.
        var  rangeBoundaryStrings  =  incomingTextData[ lineIndex ].split( ' ' );

        // We then add the calculated length of the current range to our
        // cumulative total. The length of an inclusive range [A, B] is (B - A + 1).
        // `parseInt` is used to ensure explicit numeric conversion from string parts.
        cumulativeValue  +=  ( parseInt(rangeBoundaryStrings[ 1 ], 10)  -  parseInt(rangeBoundaryStrings[ 0 ], 10)  +  1 );
    }

    // Finally, the calculated aggregate length is outputted to the standard console.
    console.log( cumulativeValue );
}


// The script's execution starts here.
// It reads all data from standard input,
// decodes it as UTF-8, trims any leading or trailing whitespace,
// and then invokes the primary function `ComputeAggregateLength`
// with this prepared textual content.
ComputeAggregateLength ( require('fs').readFileSync( '/dev/stdin',  'utf8' ).trim() );