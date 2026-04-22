"use strict"; /* This directive enforces stricter parsing and error handling in the code. */


const performCalculation = ( rawInputData ) => { // The primary function designed to process the incoming data stream.

    // The raw input is expected to be a multi-line string.
    // We split it by newline characters to handle each line separately.
    rawInputData = rawInputData . split ( "\n" ) ;


    // For this specific problem, we are interested in the first line of input.
    // This line is further split by spaces to extract individual numeric components.
    const inputSegments = rawInputData [ 0 ] . split ( " " ) ;


    // The first segment represents a width or a span.
    // We convert it to an integer using base 10 for explicit parsing.
    const spatialBreadth = parseInt ( inputSegments [ 0 ] , 10 ) ;

    // The second segment denotes the starting point of the first interval.
    // Also parsed as an integer with a specified radix.
    const initialLocation = parseInt ( inputSegments [ 1 ] , 10 ) ;

    // The third segment indicates the starting point of the second interval.
    // Converted to an integer, ensuring numerical operations are correct.
    const finalLocation = parseInt ( inputSegments [ 2 ] , 10 ) ;


    // This conditional block checks for any overlap between the two intervals.
    // An overlap occurs if the first interval (initialLocation to initialLocation + spatialBreadth)
    // extends beyond the start of the second interval (finalLocation),
    // OR if the second interval (finalLocation to finalLocation + spatialBreadth)
    // extends beyond the start of the first interval (initialLocation).
    if ( ( initialLocation + spatialBreadth ) > finalLocation || ( finalLocation + spatialBreadth ) > initialLocation )
    {
        // If an overlap is detected, the distance between them is zero.
        console . log ( 0 ) ;
        return ; // Exit the function immediately as the result is determined.
    }


    // If there is no overlap, calculate the actual minimum distance separating the two intervals.
    // This is achieved by subtracting the end point of the 'smaller' interval from the start point of the 'larger' interval.
    // The 'smaller' interval is the one that starts earlier.
    console . log ( initialLocation < finalLocation ? finalLocation - ( initialLocation + spatialBreadth ) : initialLocation - ( finalLocation + spatialBreadth ) ) ;

} ; // Concludes the definition of the main processing function.


// This line initiates the execution of the program.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string,
// and then passes this string to our 'performCalculation' function for processing.
performCalculation ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;