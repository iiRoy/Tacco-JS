/* This is a Type I clone generated to demonstrate extensive
 * whitespace and comment variations while preserving
 * functional equivalence and structural identity.
 */

// Initialize the input processing variable.
inp   =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . split ( '\n' ) [ 0 ] . split ( ' ' ) ;


// Extract and convert the first number from the input array.
A    =    inp . shift ( )    *    1 ;

// Extract and convert the second number.
B     =     inp . shift ( )     *     1 ;

// Extract and convert the third number.
C      =      inp . shift ( )      *      1 ;

// Extract and convert the fourth number.
D       =       inp . shift ( )       *       1 ;


/*
 * Perform a conditional calculation and log the result.
 * The expression evaluates (A * B > B * C).
 * If true, it uses A * B.
 * Otherwise, it uses C * D.
 */
console . log ( A * B  >  B * C   ?   A * B   :   C * D ) ;

// End of the program.