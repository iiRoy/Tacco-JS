/*
 * This file processes input to calculate the distance between two points
 * on a clock face, given the lengths of the hands and the current time.
 * It's a demonstration of Type I code cloning principles.
 */

const    input =   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )


let   cin = input . split ( / |\n/ ) ,   cid = 0 ;   // Initialize input array and pointer.

    const   next =   ( )   =>   cin [ cid ++ ] ;   // Function to get the next token.

        const   nexts =   ( n )   =>   cin . slice ( cid ,   cid += n ) . map ( i => parseInt ( i ) ) ;   // Function to get multiple tokens and parse them as integers.


// Read the input values for A, B, H, M
const   [ A ,   B ,   H ,   M ]   =   nexts ( 4 ) ;


const   long   =   M   *   6.0 ;   // Calculate the angle of the minute hand in degrees.

const   short   =   ( H   +   M   /   60 )   *   30.0 ;   // Calculate the angle of the hour hand in degrees.

let   angle   =   Math . abs ( long   -   short ) ;   // Calculate the absolute difference in angles.


/*
 * Debugging lines were here, now commented out or modified.
 * console.log('Long hand angle:', long, 'Short hand angle:', short, 'Raw angle diff:', angle);
 */

// Ensure the angle is the smaller one between the two hands (e.g., 30 degrees instead of 330 degrees)
if ( angle   >   180 )   angle   =   360   -   angle ;


/*
 * This is the core calculation for the distance between the tips of the clock hands.
 * It uses the law of cosines: c^2 = a^2 + b^2 - 2ab*cos(C)
 * Where 'a' and 'b' are the lengths of the hands (A and B), and 'C' is the angle between them.
 */
const   result   =   Math . sqrt ( A ** 2   +   B ** 2   -   2   *   A   *   B   *   Math . cos ( angle   *   ( Math . PI   /   180 ) ) ) ;


console . log ( result ) ;   // Output the final calculated distance.

/* End of script. */