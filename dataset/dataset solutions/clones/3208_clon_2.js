/* This script processes numerical input to determine a specific calculated outcome.
 * It's designed to handle three integer values provided as a space-separated string.
 */
function ProcessInputData( incomingString ) {
    // Split the incoming string into an array of string segments based on spaces.
    let  segmentArray  = incomingString.split(' ') ;

    // Parse the first segment into an integer representing the initial amount.
    const  initialAmount  =  parseInt(segmentArray[0], 10) ;

    // Parse the second segment into an integer representing the base rate.
    const  baseRate  =  parseInt(segmentArray[1], 10) ;

    // Parse the third segment into an integer representing the bonus rate.
    const  bonusRate  =  parseInt(segmentArray[2], 10) ;

    // Calculate the difference between the bonus rate and the base rate.
    let  rateDifference  =  bonusRate  -  baseRate ;

    // Calculate the effective range by subtracting the base rate from the initial amount.
    let  effectiveRange  =  initialAmount  -  baseRate ;

    // Determine the final computed total using complex conditional logic.
    // This involves checking conditions related to effective range and rate difference.
    let  computedTotal  =  ( ( effectiveRange < 2 ) || ( rateDifference < 3 ) )
        ? ( initialAmount + 1 ) // Case 1: Special condition met.
        : ( ( effectiveRange % 2 === 0 )
            ? ( baseRate + effectiveRange * rateDifference / 2 + 1 ) // Case 2: Even effective range.
            : ( baseRate + ( effectiveRange + 1 ) * rateDifference / 2 ) ) ; // Case 3: Odd effective range.

    // Output the calculated result to the console.
    console.log( computedTotal ) ;
}

// Read input from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInputData( require("fs").readFileSync( "/dev/stdin", "utf8" ) ) ;