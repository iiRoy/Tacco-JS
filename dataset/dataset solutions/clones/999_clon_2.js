// Activate standard input stream processing
process.stdin.resume();

// Configure input encoding for characters
process.stdin.setEncoding('utf8');

/*
 * This section reads numerical data from standard input,
 * processes it, and then calculates the maximum difference
 * between any two distinct elements in the list.
 */
var   dataLines   =   require('fs') . readFileSync(   '/dev/stdin',   'utf8'   );
dataLines = dataLines  .  trim() . split('\n') . map(Number);

var   maxItems   = dataLines[0];

var dataPoints = dataLines.slice(1);

var maxDifference = 0; // Initialize variable for storing the largest difference found

for ( var firstIndex = 0 ; firstIndex < dataPoints.length ; firstIndex++ )
{
    // If the current index (plus one) matches the specified limit, stop processing.
    if ( ( firstIndex + 1 ) === maxItems ) {
        break;
    }

    for ( var secondIndex = 0 ; secondIndex < dataPoints.length ; secondIndex++ )
    {
        // Ensure we are comparing distinct elements from the array.
        if ( firstIndex === secondIndex ) {
            continue;
        }

        // Calculate the difference between the two selected data points.
        var currentDiff = dataPoints[firstIndex] - dataPoints[secondIndex];

        // Update the maximum difference if the current calculation is greater.
        if ( maxDifference < currentDiff ) {
            maxDifference = currentDiff;
        }
    }
}
// Output the computed maximum difference to the console.
console.log( maxDifference );