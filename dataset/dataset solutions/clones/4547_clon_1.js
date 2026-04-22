function classify ( inputPoints ) {
    // This array will store points that are multiples of 10.
    var tenTimes = [ ] ;

    /*
     * This array will hold all other points
     * that are not multiples of 10.
     */
    var otherPoints = [ ] ;
    var tenTimesSum = 0 ; // Initialize sum for tenTimes points

    // Iterate over each point string provided in the input.
    inputPoints . forEach ( function ( pointString ) {
        // Convert the string representation of the point to a number.
        var point = Number ( pointString ) ;

        // Check if the current point is a multiple of 10.
        if ( point % 10 === 0 ) {
            tenTimes . push ( point ) ; // Add to tenTimes array
            tenTimesSum += point ;      // Accumulate sum
            return ;                    // Move to the next point
        }

        // If not a multiple of 10, add it to otherPoints.
        otherPoints . push ( point ) ;
    } ) ;

    // Return an object containing the categorized points and their sum.
    return {
        tenTimes : tenTimes ,
        tenTimesSum : tenTimesSum ,
        otherPoints : otherPoints ,
    } ;
}


function calcMaxPattern ( point , executeIndex , classifyResult ) {
    // This function calculates a pattern based on a given point and classification results.

    // It calls the 'calc' function, passing the point plus the sum of tenTimes points,
    // a filtered list of otherPoints (excluding the one at executeIndex), and an initial index of 0.
    return calc (
        point + classifyResult . tenTimesSum ,
        classifyResult . otherPoints . filter ( function ( point , index ) {
            // Filter out the point at the specified executeIndex.
            return index != executeIndex ;
        } ) ,
        0
    ) ;
}


/*
 * This is a recursive function to calculate a value based on currentPoint
 * and a list of otherPoints, starting from a currentIndex.
 */
function calc ( currentPoint , otherPoints , currentIndex ) {
    // Base case: if there's no next element, return the current accumulated point.
    if ( typeof otherPoints [ currentIndex + 1 ] == 'undefined' ) {
        return currentPoint ;
    }

    // Recursive call 1: Include the current otherPoint.
    var a = calc ( currentPoint + otherPoints [ currentIndex ] , otherPoints , currentIndex + 1 ) ;

    // Recursive call 2: Exclude the current otherPoint.
    var b = calc ( currentPoint , otherPoints , currentIndex + 1 ) ;

    // Decision logic:
    // If 'a' is greater than or equal to 'b' AND 'a' is not a multiple of 10, return 'a'.
    if ( a >= b && a % 10 !== 0 ) {
        return a ;
    }

    // If 'b' is greater than or equal to 'a' AND 'b' is not a multiple of 10, return 'b'.
    if ( a <= b && b % 10 !== 0 ) {
        return b ;
    }

    // If both 'a' and 'b' are multiples of 10 (or one of them is, and the other didn't meet its condition),
    // or if neither condition above was met, this path indicates a specific scenario.
    // In this problem context, it usually means neither path yielded a non-10-multiple result,
    // or both yielded 10-multiples, and the problem logic dictates returning 0.
    return 0 ;
}


/**
 * Main function to process the input string and compute the final result.
 * It reads input, classifies points, and then calculates the maximum pattern.
 *
 * @param {String} input - The raw input string, typically from stdin.
 */
function Main ( input ) {
    // Split the input string by newlines to get an array of input lines.
    var inputs = input . split ( "\n" ) ;

    // Classify the points, skipping the first line (assuming it's a count or header).
    const classifyResult = classify ( inputs . slice ( 1 ) ) ;

    var result = 0 ; // Initialize the maximum result found so far.

    // Iterate over each 'otherPoint' to calculate patterns.
    classifyResult . otherPoints . forEach ( function ( point , index ) {
        // Calculate the pattern for the current point and update the overall maximum.
        result = Math . max ( result , calcMaxPattern ( point , index , classifyResult ) ) ;
    } ) ;

    // Return the final maximum result.
    return result ;
}


// Read input from stdin, process it using the Main function, and print the output.
console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;