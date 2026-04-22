function     calc ( x1 , y1 , z1 , w1 , x2 , y2 , z2 , w2 )
{
    /*
     * This function performs a specific set of calculations,
     * likely representing a form of quaternion or matrix
     * multiplication, accumulating values into four
     * distinct components: 'a', 'i', 'j', and 'k'.
     *
     * It takes eight numerical parameters as input.
     */

    // Initialize the four primary result components using products involving x1.
    var   a  =  x1  *  x2 ; // Component 'a' initialization
    var   i  =  x1  *  y2 ; // Component 'i' initialization
    var   j  =  x1  *  z2 ; // Component 'j' initialization
    var   k  =  x1  *  w2 ; // Component 'k' initialization


    // Accumulate values based on y1 and the second set of inputs.
    i  +=  y1  *  x2 ; // Update 'i'
    a  -=  y1  *  y2 ; // Update 'a'
    k  +=  y1  *  z2 ; // Update 'k'
    j  -=  y1  *  w2 ; // Update 'j'


    // Accumulate values based on z1 and the second set of inputs.
    j  +=  z1  *  x2 ; // Update 'j'
    k  -=  z1  *  y2 ; // Update 'k'
    a  -=  z1  *  z2 ; // Update 'a'
    i  +=  z1  *  w2 ; // Update 'i'


    // Accumulate values based on w1 and the second set of inputs.
    k  +=  w1  *  x2 ; // Update 'k'
    j  +=  w1  *  y2 ; // Update 'j'
    i  -=  w1  *  z2 ; // Update 'i'
    a  -=  w1  *  w2 ; // Update 'a'

    // Return the final array containing the four calculated components.
    return  [ a , i , j , k ] ;
}

// --- Start of the main program execution logic ---

// Load the 'fs' (file system) module to read input from standard input.
var   input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Process the raw input: trim any leading/trailing whitespace, then split
// the string into an array of lines based on the newline character.
var   Arr    = ( input . trim ( ) ) . split ( "\n" ) ;

// Extract the first element from 'Arr', convert it to a number (N),
// and remove it from the array. N represents the total number of
// subsequent data sets to process.
var   N      =  Arr . shift ( )  -  0 ;

// Iterate N times, processing each data line from the 'Arr' array.
for ( var   I  =  0 ;   I  <  N ;   I++ )
{
    // For the current line (Arr[I]), split it by spaces and
    // then convert each resulting string part into a number.
    // Store this array of numbers in variable 'A'.
    var   A    =  Arr [ I ] . split ( " " ) . map ( Number ) ;

    // Call the 'calc' function using the elements of array 'A'
    // as individual arguments. 'apply(null, A)' achieves this.
    var   ans  =  calc . apply ( null ,  A ) ;

    // Print the resulting array 'ans' to the console, with its
    // elements joined together by a single space.
    console . log ( ans . join ( " " ) ) ;
}