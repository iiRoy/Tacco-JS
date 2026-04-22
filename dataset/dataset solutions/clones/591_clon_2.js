var dataSource = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


    // Processing the raw data: trimming whitespace and splitting into an array of lines.
    // Each line is considered a data fragment.
var lineFragments = ( dataSource . trim ( ) ) . split ( "\n" ) ;

// Begin iterating through the array of data fragments.
// The mainIndex variable tracks the starting position for each block of processing.
for ( var mainIndex = 0 ; mainIndex < lineFragments . length ; mainIndex ++ )
{
    // Convert the current fragment (at mainIndex) into a numerical value.
    // This value will serve as the initial datum for comparison.
    var initialDatum = lineFragments [ mainIndex ] - 0 ;

    // If the initial datum is zero, it signals the end of input or a specific termination condition.
    // In such a case, the processing loop is exited prematurely.
    if ( initialDatum === 0 )
    {
        break ;
    }

    // Initialize a variable to accumulate the sum of subsequent data points.
    // This will hold the total for a segment of 10 values.
    var segmentSum = 0 ;

    // Inner loop to sum up ten consecutive numerical values starting from the current mainIndex.
    // blockOffset helps to navigate within this 10-element segment.
    for ( var blockOffset = 0 ; blockOffset < 10 ; blockOffset ++ )
    {
        segmentSum += ( lineFragments [ mainIndex + blockOffset ] - 0 ) ;
    }

    // Output the difference between the initial datum and the accumulated segment sum.
    // This represents a calculated result based on the processed block.
    console . log ( initialDatum - segmentSum ) ;

    // Advance the main index by 10 positions. This skips over the 10 elements
    // that were just processed by the inner loop, preparing for the next block.
    mainIndex += 10 ;
}