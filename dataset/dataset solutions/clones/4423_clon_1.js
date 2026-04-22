'use strict' ;
  // This is the primary function responsible for processing input data.
  function   main  ( input )
{
    const tmp = input . split ( '\n' ) ; // Split the input string by newline characters.

    const N = parseInt ( tmp . shift ( ) , 10 ) ; /* Parse the first line as an integer,
                                                    representing the number of elements. */


    const a = tmp . map ( ( elem ) => parseInt ( elem , 10 ) ) ; // Convert remaining lines to an array of integers.

      console . log ( a ) ; // Display the resulting array.

}
// The following functions (gcd, lcm, lcm2) were previously defined but are currently commented out
// and are not used in the active logic of this script.
/*
function gcd(b, c) {
    if (c === 0) {
        return b;
    } else {
        return gcd(c, b % c);
    }
}

function lcm(a2, b2) {
    return (a2 * b2) / gcd(a2, b2);
}

function lcm2(arr, a3, i) {
    if (i === arr.length) {
        return a3;
    } else {
        return lcm2(arr, lcm(a3, arr[i]), i + 1);
    }
}
*/


// Invokes the main function with data read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;