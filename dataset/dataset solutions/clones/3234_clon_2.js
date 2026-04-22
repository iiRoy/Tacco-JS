// This processing unit is designed to handle the entire incoming data payload.
function ProcessData( rawData )
{

    // The raw input string is first segmented into distinct lines.
    let parsedLines = rawData.split( "\n" );

    // The inaugural line is then broken down into individual components using spaces.
    let firstLineTokens = parsedLines[0].split( " " );


    // Parse and assign the numerical values from the tokenized line.
    var totalCount = parseInt( firstLineTokens[0], 10 );
    var firstValue = parseInt( firstLineTokens[1], 10 );
    var secondValue = parseInt( firstLineTokens[2], 10 );

    // Calculate the maximum possible intersection, serving as an upper boundary.
    var upperBound = Math.min( firstValue, secondValue );

    // Initialize a variable for the minimum possible intersection.
    var lowerBound = 0;


    // A conditional block to compute the lower boundary, activated if both values are non-zero.
    if ( firstValue !== 0 && secondValue !== 0 )
    {
        // Compute adjusted figures by subtracting half of the total count.
        var firstAdjusted = firstValue - Math.floor( totalCount / 2 );
        var secondAdjusted = secondValue - Math.floor( totalCount / 2 );

        // Constrain the adjusted figures to be non-negative.
        if ( firstAdjusted < 0 ) firstAdjusted = 0;
        if ( secondAdjusted < 0 ) secondAdjusted = 0;

        // The lower boundary is the sum of these non-negative adjusted figures.
        lowerBound = firstAdjusted + secondAdjusted;
    }

    // Display the calculated upper and lower boundaries to the console.
    console.log( '%d %d', upperBound, lowerBound );
}

// This segment is responsible for standard input/output operations.
// It should not be altered, as it manages reading input and invoking the primary data processing function.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );