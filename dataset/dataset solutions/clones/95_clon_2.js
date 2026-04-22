const   fileSystemModule = require ( 'fs' ) ; /* Include the Node.js File System utility */

/*
 *   Retrieve all data from the standard input stream.
 *   The input is expected to be UTF-8 encoded text.
 */
let     rawDataStream = fileSystemModule . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Pre-process the raw text: remove any trailing newline character, then split into an array of lines.
let     parsedInputLines = rawDataStream . replace ( /\n$/ , '' ) . split ( '\n' ) ;

// The first line of input specifies the total number of scenarios to process.
const   totalCaseCount = Number ( parsedInputLines . shift ( ) ) ;

// Begin iterating through each individual scenario.
for ( let   caseIndex = 0 ; caseIndex < totalCaseCount ; caseIndex++ )
{
    // Extract the current line of data, parse it by spaces, and convert each segment to a numerical value.
    let     currentCaseData = parsedInputLines . shift ( ) . split ( ' ' ) . map ( Number ) ;

    // Obtain the coordinates (x, y) and radius for the first geometric circle.
    const   firstCircleCoordX = currentCaseData . shift ( ) ;
    const   firstCircleCoordY = currentCaseData . shift ( ) ;
    const   firstCircleRadius = currentCaseData . shift ( ) ;

    // Obtain the coordinates (x, y) and radius for the second geometric circle.
    const   secondCircleCoordX = currentCaseData . shift ( ) ;
    const   secondCircleCoordY = currentCaseData . shift ( ) ;
    const   secondCircleRadius = currentCaseData . shift ( ) ;

    // Calculate the straight-line distance between the centers of the two circles using the Pythagorean theorem.
    const   distanceBetweenCenters = Math . sqrt (
        Math . pow ( secondCircleCoordX - firstCircleCoordX , 2 ) +
        Math . pow ( secondCircleCoordY - firstCircleCoordY , 2 )
    ) ;

    /*
     *   Determine the spatial relationship between the two circles
     *   and print the corresponding status code.
     */
    if ( distanceBetweenCenters <= firstCircleRadius + secondCircleRadius )
    {
        // The circles either intersect, touch, or one is contained within the other.
        if ( distanceBetweenCenters < secondCircleRadius - firstCircleRadius )
        {
            // The first circle is entirely enclosed within the second circle.
            console . log ( -2 ) ;
        }
        else if ( distanceBetweenCenters < firstCircleRadius - secondCircleRadius )
        {
            // The second circle is entirely enclosed within the first circle.
            console . log ( 2 ) ;
        }
        else
        {
            // The circles intersect at one or two points, or touch externally.
            console . log ( 1 ) ;
        }
    }
    else
    {
        // The circles are entirely separate and do not make contact.
        console . log ( 0 ) ;
    }
}