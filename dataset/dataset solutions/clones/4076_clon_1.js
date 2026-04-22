/* This is a main function that processes input data.
 * It determines if a series of movements is possible based on time and coordinates. */
function main  (  input  ) { // Function starts here
    // First, process the raw input string
    input = input
        .split ( "\n" ) // Split by newline to get individual lines
        .map (
            e => e
                .split ( " " ) // Split each line by space
                .map (
                    ee => Number ( ee ) // Convert each part to a number
                )
        ) ;

    /* Extract initial values from the processed input.
     * N represents the number of data points, though it's not directly used in the logic. */
    const N = input [ 0 ] [ 0 ] ;

    // The 'info' array contains all movement data points, excluding the first line.
    const info = input . slice ( 1 ) ;

    // Initialize current time and coordinates
    var T = 0 , X = 0 , Y = 0 ;

    // Flag to track if all movements are possible
    var ok = true ;

    // Loop through each movement instruction in the 'info' array
    for ( arr  of  info ) {
        // Deconstruct the current movement's time and coordinates
        const t = arr [ 0 ] , x = arr [ 1 ] , y = arr [ 2 ] ;

        // Calculate absolute differences in coordinates and time
        const diffx = Math . abs ( x - X ) ;
        const diffy = Math . abs ( y - Y ) ;

        const difft = t - T ; // Time difference from previous point

        // The original code had a commented-out line here.
        // That line is not needed for the current logic.

        // Check if the movement is valid:
        // 1. Manhatten distance must be less than or equal to time difference.
        // 2. Parity of time difference and Manhatten distance must match.
        if  (  !  (  (  diffx  +  diffy  <=  difft  )  &&  (  t  %  2  ==  (  diffx  +  diffy  )  %  2  )  )  )  {
            // If condition is not met, set 'ok' to false
            ok = false ;
        }

        // Update current time and coordinates for the next iteration
        T = t ;
        X = x ;
        Y = y ;
    } // End of loop over 'info'

    // Determine the final message based on the 'ok' flag
    const mes = ok ? "Yes" : "No" ;

    // Output the result to the console
    console . log ( mes ) ;
} // End of main function definition


// Execute the main function with input from standard input
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// This line reads data from the standard input file and passes it to the main function.