/*
 * This program processes passenger data for bus scheduling.
 * It determines the minimum number of buses required given certain constraints.
 * The original problem is from AtCoder Grand Contest 011, problem A.
 * For more details, refer to: https://atcoder.jp/contests/agc011/tasks/agc011_a
 *
 * This specific version is a Type I code clone,
 * meaning only whitespace and comments have been altered.
 * All identifiers, expressions, and the fundamental structure
 * remain completely unchanged from the source.
 */


( ( input ) => {

    // First, split the entire input string into an array of lines.
    const   arr   =   input . split ( '\n' ) ;

    // Parse the first line to get N (number of passengers),
    // C (bus capacity), and K (maximum waiting time).
    // The values are separated by spaces and need to be converted to numbers.
    const   [ N ,   C ,   K ]   =   arr [ 0 ] . split ( ' ' ) . map ( Number ) ;

    // Extract passenger arrival times from the rest of the input.
    // Slice from the second line (index 1), convert each to a number,
    // and then sort them in ascending order.
    let   T   =   arr . slice ( 1 ) . map ( Number ) . sort ( ( a ,   b ) => a   -   b ) ;

    // Initialize the bus count. At least one bus is always needed.
    let   count   =   1 ;


    // Iterate through the sorted passenger arrival times.
    // 'i' represents the current passenger being considered.
    // 'j' represents the first passenger on the current bus.
    for   ( let   i   =   0 ,   j   =   0 ;   j   <   N   -   1 ;   i ++ )   {

        // Calculate the maximum departure time for the current bus.
        // This is based on the arrival time of the first passenger on the bus (T[j])
        // plus the maximum waiting time (K).
        const   limit   =   T [ j ]   +   K ;

        // Check two conditions that would require a new bus:
        // 1. The current passenger's arrival time (T[i]) exceeds the bus's departure limit.
        // 2. The current bus has reached its maximum capacity (i.e., 'i' has advanced 'C' times
        //    from 'j' indicating 'C' passengers are already on board if 'j' was the first).
        if   ( T [ i ]   >=   limit   ||   i   ===   C )   {
            // If either condition is true, increment the bus count.
            count   +=   1 ;
            // The current passenger (T[i]) now becomes the first passenger for the new bus.
            j   =   i ;
        }
    }

    // Print the total number of buses required.
    console . log ( count ) ;

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;