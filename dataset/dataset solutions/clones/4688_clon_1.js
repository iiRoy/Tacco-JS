/*
 * This JavaScript program processes input to solve a specific problem.
 * The problem originates from the AtCoder programming contest platform.
 * Contest: AGC011
 * Task: A
 *
 * For more details, refer to the original problem URL:
 * https://atcoder.jp/contests/agc011/tasks/agc011_a
 *
 * This code calculates the minimum number of buses required
 * to transport passengers based on their arrival times,
 * bus capacity, and maximum waiting time.
 */


( ( input ) => {

    // Split the entire input string by newline characters to get an array of lines.
    const arr = input .split( '\n' ) ;


    // Process the first line of input to extract key parameters.
    const first = arr[ 0 ] .split( ' ' ) .map( Number ) ;

    // C represents the maximum capacity of a single bus.
    const C = first[ 1 ] ;

    // K represents the maximum waiting time allowed for any passenger on a bus.
    const K = first[ 2 ] ;


    // Extract passenger arrival times from the input, starting from the second line.
    // Convert them to numbers and then sort them in ascending order.
    let T = arr .slice( 1 ) .map( Number ) .sort( ( a , b ) => a - b ) ;


    // Initialize a counter for the number of buses dispatched.
    let count = 0 ;


    // The main loop continues as long as there are passengers waiting to be transported.
    while ( T .length > 0 )
    {
        // Calculate the departure time limit for the current bus.
        // A bus departs at the arrival time of its first passenger plus the maximum waiting time K.
        const limit = T[ 0 ] + K ;


        // 'i' will track the index of the first passenger who cannot board the current bus.
        // This is initialized to 1, assuming the first passenger (T[0]) always boards.
        let i = 1 ;


        // Iterate through potential passengers for the current bus.
        // A bus can take up to 'C' passengers.
        for ( let j = 1 ; j <= C ; j++ )
        {
            // If the current passenger T[j] arrives at or after the bus's departure limit,
            // then this passenger and subsequent ones cannot board this bus.
            // Note: If T[j] is undefined (out of bounds), the comparison T[j] >= limit evaluates to false.
            if ( T[ j ] >= limit )
            {
                break ; // Stop checking passengers for this bus.
            }

            // If the passenger can board, update 'i' to include them.
            // 'i' will eventually be the count of passengers who boarded this bus.
            i = j ;
        }


        // Remove the passengers who just boarded this bus from the 'T' array.
        // T.slice(i) effectively creates a new array starting from the i-th element.
        T = T .slice( i ) ;


        // Increment the total number of buses dispatched.
        count += 1 ;
    }


    // After all passengers have been transported, print the total number of buses used.
    console .log( count ) ;

} ) ( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;