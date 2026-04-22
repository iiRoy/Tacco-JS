// This module facilitates interactions with the file system.
const fileSystemModule = require('fs');

// Procure the entire content from the standard input stream.
// The designated input path is '/dev/stdin', utilizing 'utf8' for character encoding.
let fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Decompose the retrieved content into an array of distinct string segments,
// using the newline character as the primary delimiter.
let inputSegments = fileContent.split('\n');


// Extract the inaugural segment, convert it to a numerical representation,
// and assign it as the total quantity of processing cycles required.
let testCaseCount = +inputSegments.shift();

// Initiate an iterative process to handle each individual test case.
for ( let currentIteration = 0; currentIteration < testCaseCount; currentIteration++ )
{

    // Obtain the subsequent line from the collection of input segments,
    // then subdivide it into an array of strings using space characters as separators.
    let coordinateValues = inputSegments.shift().split(' ');

    // Parse and explicitly assign eight distinct numerical coordinates.
    // These define two separate line segments.
    // The first segment extends from (pointOneX, pointOneY) to (pointTwoX, pointTwoY).
    let pointOneX   = +coordinateValues[0];
    let pointOneY   = +coordinateValues[1];
    let pointTwoX   = +coordinateValues[2];
    let pointTwoY   = +coordinateValues[3];

    // The second segment spans from (pointThreeX, pointThreeY) to (pointFourX, pointFourY).
    let pointThreeX = +coordinateValues[4];
    let pointThreeY = +coordinateValues[5];
    let pointFourX  = +coordinateValues[6];
    let pointFourY  = +coordinateValues[7];


    // Compute the components of the direction vectors for both line segments.
    let firstVectorXComponent  = pointTwoX - pointOneX;
    let firstVectorYComponent  = pointTwoY - pointOneY;
    let secondVectorXComponent = pointFourX - pointThreeX;
    let secondVectorYComponent = pointFourY - pointThreeY;

    // Evaluate if the two line segments are parallel.
    // This is determined by comparing the cross product of their direction vectors.
    // Floating point comparisons necessitate using `toFixed` for consistent results.
    if ( ( firstVectorXComponent * secondVectorYComponent ).toFixed(12) == ( secondVectorXComponent * firstVectorYComponent ).toFixed(12) )
    {
        // If the segments are parallel, emit a confirmation message.
        console.log('YES');
    }
    else
    {
        // Otherwise, indicate that they are not parallel.
        console.log('NO');
    }
}