const    input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;   // Read input from standard input stream

const s   =   Number ( input ) ;   /* Convert the raw input string to a numerical value */

// This function 'f' implements a step in the Collatz conjecture sequence.
// It takes a number 'n' and returns the next number in the sequence.
const f = ( n ) => {
    // Check if the number 'n' is even.
    if  (  n  %  2  ===  0  )  {
        // If 'n' is even, divide it by 2.
        return   n   /   2 ;
    }  else  {
        // If 'n' is odd, apply the transformation 3n + 1.
        return   3   *   n   +   1 ;
    }
} ;


/*
 * The function 'a' appears to be a helper or an alternative step.
 * It calls the primary sequence function 'f' with 'n-1'.
 * Its specific role in the overall algorithm is not immediately clear from its usage here.
 */
const   a   =   (   n   )   =>   {
    return   f ( n - 1 ) ;
} ;


// Initialize an empty array to store the sequence elements encountered so far.
const list   =   [ ] ;


// This utility function checks if a given number 'n' is present within the array 'arr'.
// It returns 'true' if 'n' is found, and 'false' otherwise.
const   listIncludes   =   (   arr ,   n   )   =>   {
    // The indexOf method returns -1 if the element is not found, or its index if found.
    return   arr . indexOf ( n )   >=   0   ?   true   :   false ;
} ;


// Begin the main loop to generate the sequence and detect cycles.
// The loop starts with 's', continues as long as 'i' is less than 1,000,000,
// and updates 'i' using the 'f' function.
for   (   var   i   =   s ;   i   <   1000000 ;   i   =   f ( i )   )   {

    // Before adding 'i' to the list, check if it has already been encountered.
    if   (   listIncludes ( list ,   i )   )   {
        // If 'i' is already in 'list', a cycle has been detected.
        // Output the length of the list plus one (for the current repeating element).
        console . log ( list . length   +   1 ) ;
        break ; // Terminate the loop as the cycle is found.
    }   else   {
        // If 'i' has not been seen before, add it to the list of encountered elements.
        list . push ( i ) ;
    }
} ;